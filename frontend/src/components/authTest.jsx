import { useState } from 'react'
import { signUp, signIn, signOut, getCurrentSession, confirmSignUp, forgotPassword, confirmPassword } from '../services/auth'

function AuthTest() {
  // State for form inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  // State for displaying results/errors
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordResetRequested, setPasswordResetRequested] = useState(false)

  // Handler for sign up
  // This is async because signUp returns a Promise
  const handleSignUp = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await signUp(email, password)
      setResult(`Sign up successful! User confirmed: ${response.userConfirmed}`)
    } catch (error) {
      // Cognito errors have a message property
      setResult(`Error: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  // Handler for sign in
  const handleSignIn = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await signIn(email, password)
      setResult('Sign in successful! Tokens stored.')
    } catch (error) {
      setResult(`Error: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  // Handler for sign out (doesn't need email/password)
  const handleSignOut = () => {
    try {
      signOut()
      setResult('Signed out successfully')
    } catch (error) {
      setResult(`Error: ${error.message || error}`)
    }
  }

  // Handler for getting current session
  const handleGetSession = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const session = await getCurrentSession()
      setResult(`Session valid! Access token expires at: ${session.getAccessToken().getExpiration()}`)
    } catch (error) {
      setResult(`Error: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }
  const handleConfirmSignUp = async () => {
    setLoading(true)
    setResult('')
    try {
      const response = await confirmSignUp(email, code)
      setResult('Sign up confirmed successfully')
    } catch (error) {
      setResult(`Error: ${error.message || error}`)
    } finally { 
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setLoading(true)
    setResult('')
    try {
      const response = await forgotPassword(email)
      setResult('Password reset code sent to your email')
      setPasswordResetRequested(true)
    } catch (error) {
      setResult(`Error: ${error.message || error}`)
      setPasswordResetRequested(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPassword = async () => {
    setLoading(true)
    setResult('')
    try {
      const response = await confirmPassword(email, code, newPassword)
      setResult('Password reset successfully')
    } catch (error) {
      setResult(`Error: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Auth Test Component</h2>
      
      {/* Common Email Field */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
      </div>

      {/* Sign Up / Sign In Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #444', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Sign Up / Sign In</h3>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <div>
          <button 
            onClick={handleSignUp} 
            disabled={loading || !email || !password}
            style={{ marginRight: '10px', marginBottom: '5px', padding: '8px 16px' }}
          >
            Sign Up
          </button>
          <button 
            onClick={handleSignIn} 
            disabled={loading || !email || !password}
            style={{ marginRight: '10px', marginBottom: '5px', padding: '8px 16px' }}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Confirm Sign Up Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #444', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Confirm Sign Up</h3>
        <input
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button 
          onClick={handleConfirmSignUp} 
          disabled={loading || !email || !code}
          style={{ padding: '8px 16px' }}
        >
          Confirm Sign Up
        </button>
      </div>

      {/* Password Reset Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #444', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Password Reset</h3>
        {!passwordResetRequested ? (
          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#888' }}>
              Request a password reset code to be sent to your email
            </p>
            <button 
              onClick={handleForgotPassword} 
              disabled={loading || !email}
              style={{ padding: '8px 16px' }}
            >
              Request Password Reset Code
            </button>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#4caf50' }}>
              Check your email for the reset code, then enter it below with your new password
            </p>
            <input
              type="text"
              placeholder="Reset Code (from email)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button 
              onClick={handleConfirmPassword} 
              disabled={loading || !email || !code || !newPassword}
              style={{ marginRight: '10px', padding: '8px 16px' }}
            >
              Confirm Password Reset
            </button>
            <button 
              onClick={() => {
                setPasswordResetRequested(false)
                setCode('')
                setNewPassword('')
                setResult('')
              }}
              disabled={loading}
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Session Management Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #444', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Session Management</h3>
        <button 
          onClick={handleGetSession} 
          disabled={loading}
          style={{ marginRight: '10px', marginBottom: '5px', padding: '8px 16px' }}
        >
          Get Session
        </button>
        <button 
          onClick={handleSignOut} 
          disabled={loading}
          style={{ padding: '8px 16px' }}
        >
          Sign Out
        </button>
      </div>

      {/* Result/Error display */}
      {result && (
        <div style={{ 
          color: result.includes('Error') ? '#f44336' : '#4caf50',
          padding: '10px', 
          backgroundColor: result.includes('Error') ? '#ffebee' : '#e8f5e9',
          border: `1px solid ${result.includes('Error') ? '#f44336' : '#4caf50'}`,
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          {result}
        </div>
      )}
      
      {loading && <p>Loading...</p>}
    </div>
  )
}

export default AuthTest