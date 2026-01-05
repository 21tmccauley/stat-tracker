import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { signUp, signIn, signOut, getCurrentUser, getCurrentSession, confirmSignUp, forgotPassword, confirmPassword } from './auth'

// Create mock implementations that we can access in tests
const mockUserPool = {
  signUp: vi.fn(),
  getCurrentUser: vi.fn(),
}

const mockCognitoUser = vi.fn(() => ({
  authenticateUser: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  confirmRegistration: vi.fn(),
  forgotPassword: vi.fn(),
  confirmPassword: vi.fn(),
}))

const mockCognitoUserPool = vi.fn(() => mockUserPool)
const mockAuthenticationDetails = vi.fn()
const mockCognitoUserAttribute = vi.fn()

// Mock the amazon-cognito-identity-js module
vi.mock('amazon-cognito-identity-js', () => {
  return {
    CognitoUserPool: mockCognitoUserPool,
    CognitoUser: mockCognitoUser,
    AuthenticationDetails: mockAuthenticationDetails,
    CognitoUserAttribute: mockCognitoUserAttribute,
  }
})

// Set up environment variables for tests
// Note: import.meta.env is handled by Vite, but we can set these in the test
// For now, the mocked CognitoUserPool will handle the initialization

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset mocks after each test
    vi.resetAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return the current user from userPool', () => {
      // Arrange: Create a mock user object
      const mockUser = { username: 'test@example.com' }
      
      // Configure the mock to return our mock user
      mockUserPool.getCurrentUser.mockReturnValue(mockUser)
      
      // Act: Call the function we're testing
      const result = getCurrentUser()
      
      // Assert: Verify it returns the mock user
      expect(result).toBe(mockUser)
      
      // Also verify that getCurrentUser was called on the userPool
      expect(mockUserPool.getCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('should return null when no user is signed in', () => {
      // Arrange: Configure mock to return null (no user signed in)
      mockUserPool.getCurrentUser.mockReturnValue(null)
      
      // Act: Call the function
      const result = getCurrentUser()
      
      // Assert: Should return null
      expect(result).toBeNull()
      expect(mockUserPool.getCurrentUser).toHaveBeenCalledTimes(1)
    })
  })

  describe('signOut', () => {
    it('should call signOut on the current user if user exists', () => {
      // Arrange: Create a mock user with a signOut method
      const mockSignOutMethod = vi.fn()
      const mockUser = {
        signOut: mockSignOutMethod
      }
      mockUserPool.getCurrentUser.mockReturnValue(mockUser)
      
      // Act: Call signOut
      signOut()
      
      // Assert: Verify signOut was called on the user
      expect(mockUserPool.getCurrentUser).toHaveBeenCalledTimes(1)
      expect(mockSignOutMethod).toHaveBeenCalledTimes(1)
    })

    it('should not throw error if no user is signed in', () => {
      // Arrange: Mock getCurrentUser to return null
      mockUserPool.getCurrentUser.mockReturnValue(null)
      
      // Act & Assert: Should not throw
      expect(() => signOut()).not.toThrow()
      expect(mockUserPool.getCurrentUser).toHaveBeenCalledTimes(1)
    })
  })

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'Password123'
      const mockResult = { userConfirmed: false, user: { username: email } }
      
      mockUserPool.signUp.mockImplementation((email, password, attributes, validation, callback) => {
        // Call callback with success (null error, result)
        callback(null, mockResult)
      })
      
      // Act
      const result = await signUp(email, password)
      
      // Assert
      expect(result).toBe(mockResult)
      expect(mockUserPool.signUp).toHaveBeenCalledTimes(1)
      expect(mockUserPool.signUp).toHaveBeenCalledWith(
        email,
        password,
        expect.any(Array), // attributeList
        null, // validation data
        expect.any(Function) // callback
      )
    })

    it('should reject with error if signUp fails', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'weak' // Password doesn't meet requirements
      const mockError = new Error('Password did not conform with policy')
      
      mockUserPool.signUp.mockImplementation((email, password, attributes, validation, callback) => {
        // Call callback with error
        callback(mockError, null)
      })
      
      // Act & Assert
      await expect(signUp(email, password)).rejects.toThrow('Password did not conform with policy')
      expect(mockUserPool.signUp).toHaveBeenCalledTimes(1)
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'Password123'
      const mockAuthResult = {
        getIdToken: () => ({ getJwtToken: () => 'token' }),
        getAccessToken: () => ({ getJwtToken: () => 'accessToken' })
      }
      
      // Mock CognitoUser instance
      const mockUserInstance = {
        authenticateUser: vi.fn((authDetails, callbacks) => {
          callbacks.onSuccess(mockAuthResult)
        })
      }
      mockCognitoUser.mockReturnValue(mockUserInstance)
      
      // Act
      const result = await signIn(email, password)
      
      // Assert
      expect(result).toBe(mockAuthResult)
      expect(mockCognitoUser).toHaveBeenCalledWith({
        Username: email,
        Pool: mockUserPool
      })
      expect(mockUserInstance.authenticateUser).toHaveBeenCalledTimes(1)
      expect(mockUserInstance.authenticateUser).toHaveBeenCalledWith(
        expect.any(Object), // AuthenticationDetails
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onFailure: expect.any(Function)
        })
      )
    })

    it('should reject with error if signIn fails', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'WrongPassword'
      const mockError = new Error('Incorrect username or password')
      
      const mockUserInstance = {
        authenticateUser: vi.fn((authDetails, callbacks) => {
          callbacks.onFailure(mockError)
        })
      }
      mockCognitoUser.mockReturnValue(mockUserInstance)
      
      // Act & Assert
      await expect(signIn(email, password)).rejects.toThrow('Incorrect username or password')
      expect(mockUserInstance.authenticateUser).toHaveBeenCalledTimes(1)
    })
  })

  describe('getCurrentSession', () => {
    it('should return session if user is authenticated', async () => {
      // Arrange
      const mockSession = {
        isValid: () => true,
        getAccessToken: () => ({ getExpiration: () => 1234567890 })
      }
      
      const mockUser = {
        getSession: vi.fn((callback) => {
          callback(null, mockSession)
        })
      }
      mockUserPool.getCurrentUser.mockReturnValue(mockUser)
      
      // Act
      const result = await getCurrentSession()
      
      // Assert
      expect(result).toBe(mockSession)
      expect(mockUser.getSession).toHaveBeenCalledTimes(1)
      expect(mockUser.getSession).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should reject if no user is found', async () => {
      // Arrange
      mockUserPool.getCurrentUser.mockReturnValue(null)
      
      // Act & Assert
      await expect(getCurrentSession()).rejects.toThrow('No user found')
    })

    it('should reject if session is invalid', async () => {
      // Arrange
      const mockSession = {
        isValid: () => false
      }
      
      const mockUser = {
        getSession: vi.fn((callback) => {
          callback(null, mockSession)
        })
      }
      mockUserPool.getCurrentUser.mockReturnValue(mockUser)
      
      // Act & Assert
      await expect(getCurrentSession()).rejects.toThrow('Invalid session')
    })

    it('should reject if getSession callback returns error', async () => {
      // Arrange
      const mockError = new Error('Session expired')
      const mockUser = {
        getSession: vi.fn((callback) => {
          callback(mockError, null)
        })
      }
      mockUserPool.getCurrentUser.mockReturnValue(mockUser)
      
      // Act & Assert
      await expect(getCurrentSession()).rejects.toThrow('Session expired')
    })
  })

  describe('confirmSignUp', () => {
    it('should successfully confirm sign up', async () => {
      // Arrange
      const email = 'test@example.com'
      const code = '123456'
      const mockResult = { success: true }
      
      const mockUserInstance = {
        confirmRegistration: vi.fn((code, forceAliasCreation, callback) => {
          callback(null, mockResult)
        })
      }
      mockCognitoUser.mockReturnValue(mockUserInstance)
      
      // Act
      const result = await confirmSignUp(email, code)
      
      // Assert
      expect(result).toBe(mockResult)
      expect(mockCognitoUser).toHaveBeenCalledWith({
        Username: email,
        Pool: mockUserPool
      })
      expect(mockUserInstance.confirmRegistration).toHaveBeenCalledWith(
        code,
        true, // forceAliasCreation
        expect.any(Function) // callback
      )
    })

    it('should reject if confirmation fails', async () => {
      // Arrange
      const email = 'test@example.com'
      const code = 'wrong-code'
      const mockError = new Error('Invalid verification code')
      
      const mockUserInstance = {
        confirmRegistration: vi.fn((code, forceAliasCreation, callback) => {
          callback(mockError, null)
        })
      }
      mockCognitoUser.mockReturnValue(mockUserInstance)
      
      // Act & Assert
      await expect(confirmSignUp(email, code)).rejects.toThrow('Invalid verification code')
      expect(mockUserInstance.confirmRegistration).toHaveBeenCalledTimes(1)
    })
  })

  describe('forgotPassword', () => {
    it('should successfully request password reset', async () => {
      // Arrange
      const email = 'test@example.com'
      const mockResult = { CodeDeliveryDetails: { Destination: email } }
      
      const mockUserInstance = {
        forgotPassword: vi.fn((callbacks) => {
          callbacks.onSuccess(mockResult)
        })
      }
      mockCognitoUser.mockReturnValue(mockUserInstance)
      
      // Act
      const result = await forgotPassword(email)
      
      // Assert
      expect(result).toBe(mockResult)
      expect(mockCognitoUser).toHaveBeenCalledWith({
        Username: email,
        Pool: mockUserPool
      })
      expect(mockUserInstance.forgotPassword).toHaveBeenCalledTimes(1)
      expect(mockUserInstance.forgotPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onFailure: expect.any(Function)
        })
      )
    })

    it('should reject if request fails', async () => {
      // Arrange
      const email = 'nonexistent@example.com'
      const mockError = new Error('User does not exist')
      
      const mockUserInstance = {
        forgotPassword: vi.fn((callbacks) => {
          callbacks.onFailure(mockError)
        })
      }
      mockCognitoUser.mockReturnValue(mockUserInstance)
      
      // Act & Assert
      await expect(forgotPassword(email)).rejects.toThrow('User does not exist')
      expect(mockUserInstance.forgotPassword).toHaveBeenCalledTimes(1)
    })
  })

  describe('confirmPassword', () => {
    it('should successfully confirm password reset', async () => {
      // Arrange
      const email = 'test@example.com'
      const code = '123456'
      const newPassword = 'NewPassword123'
      const mockResult = { success: true }
      
      const mockUserInstance = {
        confirmPassword: vi.fn((code, newPassword, callbacks) => {
          callbacks.onSuccess(mockResult)
        })
      }
      mockCognitoUser.mockReturnValue(mockUserInstance)
      
      // Act
      const result = await confirmPassword(email, code, newPassword)
      
      // Assert
      expect(result).toBe(mockResult)
      expect(mockCognitoUser).toHaveBeenCalledWith({
        Username: email,
        Pool: mockUserPool
      })
      expect(mockUserInstance.confirmPassword).toHaveBeenCalledWith(
        code,
        newPassword,
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onFailure: expect.any(Function)
        })
      )
    })

    it('should reject if confirmation fails', async () => {
      // Arrange
      const email = 'test@example.com'
      const code = 'wrong-code'
      const newPassword = 'NewPassword123'
      const mockError = new Error('Invalid verification code')
      
      const mockUserInstance = {
        confirmPassword: vi.fn((code, newPassword, callbacks) => {
          callbacks.onFailure(mockError)
        })
      }
      mockCognitoUser.mockReturnValue(mockUserInstance)
      
      // Act & Assert
      await expect(confirmPassword(email, code, newPassword)).rejects.toThrow('Invalid verification code')
      expect(mockUserInstance.confirmPassword).toHaveBeenCalledTimes(1)
    })
  })
})

