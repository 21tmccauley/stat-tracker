// pages/Login.jsx
// Complete authentication page with sign in, sign up, email confirmation, and password reset

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  // Get auth functions and state from context
  const { signIn, signUp, confirmSignUp, forgotPassword, confirmPassword, loading } = useAuth();
  
  // Track which view/mode we're in
  const [mode, setMode] = useState('signIn'); // 'signIn', 'signUp', 'confirmEmail', 'forgotPassword', 'resetPassword'
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear messages when switching modes
  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setCode('');
    setNewPassword('');
    setPassword('');
    setConfirmPasswordInput('');
  };

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      // On success, AuthContext updates isAuthenticated, App will redirect
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPasswordInput) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp(email, password);
      if (result) {
        setSuccess('Account created! Please check your email for a verification code.');
        setMode('confirmEmail');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Email Confirmation
  const handleConfirmEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await confirmSignUp(email, code);
      setSuccess('Email confirmed! You can now sign in.');
      // Switch to sign in after a delay
      setTimeout(() => {
        setMode('signIn');
        setCode('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setSuccess('Password reset code sent to your email!');
      setMode('resetPassword');
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please check your email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Password Reset Confirmation
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (newPassword !== confirmPasswordInput) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPassword(email, code, newPassword);
      setSuccess('Password reset successful! You can now sign in.');
      // Switch to sign in after a delay
      setTimeout(() => {
        setMode('signIn');
        setCode('');
        setNewPassword('');
        setConfirmPasswordInput('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid reset code or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          {mode === 'signIn' && 'Sign In'}
          {mode === 'signUp' && 'Create Account'}
          {mode === 'confirmEmail' && 'Confirm Email'}
          {mode === 'forgotPassword' && 'Reset Password'}
          {mode === 'resetPassword' && 'Enter Reset Code'}
        </h1>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'signIn' && (
          <form onSubmit={handleSignIn} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={styles.links}>
              <button
                type="button"
                onClick={() => switchMode('signUp')}
                style={styles.linkButton}
              >
                Don't have an account? Sign up
              </button>
              <button
                type="button"
                onClick={() => switchMode('forgotPassword')}
                style={styles.linkButton}
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === 'signUp' && (
          <form onSubmit={handleSignUp} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Create a password"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </button>

            <div style={styles.links}>
              <button
                type="button"
                onClick={() => switchMode('signIn')}
                style={styles.linkButton}
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}

        {/* Email Confirmation Form */}
        {mode === 'confirmEmail' && (
          <form onSubmit={handleConfirmEmail} style={styles.form}>
            <p style={styles.infoText}>
              We've sent a verification code to <strong>{email}</strong>. 
              Please enter it below to confirm your account.
            </p>

            <div style={styles.formGroup}>
              <label htmlFor="code" style={styles.label}>Verification Code</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Enter verification code"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isSubmitting ? 'Verifying...' : 'Confirm Email'}
            </button>

            <div style={styles.links}>
              <button
                type="button"
                onClick={() => switchMode('signIn')}
                style={styles.linkButton}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Request Form */}
        {mode === 'forgotPassword' && (
          <form onSubmit={handleForgotPasswordRequest} style={styles.form}>
            <p style={styles.infoText}>
              Enter your email address and we'll send you a code to reset your password.
            </p>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Code'}
            </button>

            <div style={styles.links}>
              <button
                type="button"
                onClick={() => switchMode('signIn')}
                style={styles.linkButton}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Password Reset Confirmation Form */}
        {mode === 'resetPassword' && (
          <form onSubmit={handlePasswordReset} style={styles.form}>
            <p style={styles.infoText}>
              Check your email for the reset code, then enter it below along with your new password.
            </p>

            <div style={styles.formGroup}>
              <label htmlFor="code" style={styles.label}>Reset Code</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Enter reset code from email"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="newPassword" style={styles.label}>New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Enter new password"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmNewPassword" style={styles.label}>Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>

            <div style={styles.links}>
              <button
                type="button"
                onClick={() => switchMode('signIn')}
                style={styles.linkButton}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Inline styles for a clean, modern look
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginTop: 0,
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  success: {
    padding: '12px',
    backgroundColor: '#efe',
    color: '#3c3',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
    padding: '0',
  },
};

export default Login;
