// contexts/AuthContext.jsx
// React Context to manage authentication state globally

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSession, getCurrentUser, signIn, signOut, signUp, confirmSignUp, forgotPassword, confirmPassword } from '../services/auth';

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // Current user object
  const [loading, setLoading] = useState(true);  // Loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    setLoading(true);
    try {
        const session = await getCurrentSession();
        if (session) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                setUser(currentUser.getUsername());
                setIsAuthenticated(true);
            }
            else {
                setUser(null);
                setIsAuthenticated(false);
            }
        }
    } catch (error) {
        // "No user found" is expected when user hasn't logged in yet - not an error
        if (error.message === 'No user found') {
            // User is simply not logged in - this is normal on first visit
            setUser(null);
            setIsAuthenticated(false);
        } else {
            // Log actual errors (expired sessions, network issues, etc.)
            console.error('Error checking auth:', error);
        }
    } finally {
        setLoading(false);
    }
  }

  async function handleSignIn(email, password) {
    setLoading(true);
    try {
        const result = await signIn(email, password);
        if (result) {  
            const currentUser = getCurrentUser();
            if (currentUser) {
                setUser(currentUser.getUsername());
                setIsAuthenticated(true);
            }
            else {
                setUser(null);
                setIsAuthenticated(false);
            }
        }
    } catch (error) {
        console.error('Error signing in:', error);
        throw error; // Re-throw so components can handle the error
    } finally {
        setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
        signOut();
        setUser(null);
        setIsAuthenticated(false);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error; // Re-throw so components can handle the error
    } finally {
        setLoading(false);
    }
  }


  async function handleSignUp(email, password) {
    setLoading(true);
    try {
        const result = await signUp(email, password);
        if (result) {
            return result;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.error('Error signing up:', error);
        throw error;
    } finally {
        setLoading(false);
    }
  }

  async function handleConfirmSignUp(email, code) {
    setLoading(true);
    try {
        const result = await confirmSignUp(email, code);
        return result;
    } catch (error) {
        console.error('Error confirming sign up:', error);
        throw error;
    } finally {
        setLoading(false);
    }
  }

  async function handleForgotPassword(email) {
    setLoading(true);
    try {
        const result = await forgotPassword(email);
        return result;
    } catch (error) {
        console.error('Error requesting password reset:', error);
        throw error;
    } finally {
        setLoading(false);
    }
  }

  async function handleConfirmPassword(email, code, newPassword) {
    setLoading(true);
    try {
        const result = await confirmPassword(email, code, newPassword);
        return result;
    } catch (error) {
        console.error('Error confirming password reset:', error);
        throw error;
    } finally {
        setLoading(false);
    }
  }

  
  const value = {
    user,
    isAuthenticated,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    confirmSignUp: handleConfirmSignUp,
    forgotPassword: handleForgotPassword,
    confirmPassword: handleConfirmPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}