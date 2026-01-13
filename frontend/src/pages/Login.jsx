// pages/Login.jsx
// Vision UI styled authentication page with split-screen layout

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Alert,
  InputAdornment,
  IconButton,
  Switch
} from '@mui/material';
import { IoEye, IoEyeOff, IoMail, IoLockClosed, IoKey } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import LoginHero from '../components/LoginHero';
import AuthButton from '../components/AuthButton';

// Custom styled input matching Vision UI - defined OUTSIDE Login to prevent re-creation on each render
const StyledInput = ({ label, type = 'text', value, onChange, placeholder, icon, disabled, showPassword, onTogglePassword }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'white', 
        fontWeight: 500, 
        mb: 1, 
        display: 'block',
        fontSize: '14px',
      }}
    >
      {label}
    </Typography>
    <TextField
      fullWidth
      type={type === 'password' && showPassword ? 'text' : type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      InputProps={{
        startAdornment: icon && (
          <InputAdornment position="start">
            <Box sx={{ color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
              {icon}
            </Box>
          </InputAdornment>
        ),
        endAdornment: type === 'password' && (
          <InputAdornment position="end">
            <IconButton
              onClick={onTogglePassword}
              edge="end"
              sx={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          background: '#0f1535',
          borderRadius: '15px',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '& fieldset': {
            border: 'none',
          },
          '&:hover': {
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused': {
            border: '1px solid rgba(0, 117, 255, 0.5)',
          },
        },
        '& .MuiInputBase-input': {
          padding: '14px 16px',
          fontSize: '14px',
          '&::placeholder': {
            color: 'rgba(255,255,255,0.3)',
            opacity: 1,
          },
        },
      }}
    />
  </Box>
);

function Login() {
  const { signIn, signUp, confirmSignUp, forgotPassword, confirmPassword, loading } = useAuth();
  
  // Track which view/mode we're in
  const [mode, setMode] = useState('signIn');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setCode('');
    setNewPassword('');
    setPassword('');
    setConfirmPasswordInput('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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

  const handleConfirmEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await confirmSignUp(email, code);
      setSuccess('Email confirmed! You can now sign in.');
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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPasswordInput) {
      setError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmPassword(email, code, newPassword);
      setSuccess('Password reset successful! You can now sign in.');
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

  const getTitleAndSubtitle = () => {
    switch (mode) {
      case 'signIn':
        return { title: 'Nice to see you!', subtitle: 'Enter your email and password to sign in' };
      case 'signUp':
        return { title: 'Join the Quest!', subtitle: 'Create your account to start your adventure' };
      case 'confirmEmail':
        return { title: 'Verify Email', subtitle: 'Enter the code we sent to your email' };
      case 'forgotPassword':
        return { title: 'Reset Password', subtitle: 'Enter your email to receive a reset code' };
      case 'resetPassword':
        return { title: 'New Password', subtitle: 'Enter the reset code and your new password' };
      default:
        return { title: 'Welcome', subtitle: '' };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#060b28',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Left Side - Hero Image */}
      <LoginHero />

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: { xs: '1', md: '0 0 50%' },
          maxWidth: { md: '580px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          position: 'relative',
        }}
      >
        {/* Form Container */}
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Title */}
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: 'white', 
              mb: 1,
              fontSize: { xs: '28px', md: '32px' },
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.5)', 
              mb: 4,
              fontSize: '14px',
            }}
          >
            {subtitle}
          </Typography>

          {/* Alerts */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                background: 'rgba(227, 26, 26, 0.15)',
                color: '#ff6b6b',
                border: '1px solid rgba(227, 26, 26, 0.3)',
                borderRadius: '12px',
                '& .MuiAlert-icon': { color: '#ff6b6b' },
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                background: 'rgba(1, 181, 116, 0.15)',
                color: '#01b574',
                border: '1px solid rgba(1, 181, 116, 0.3)',
                borderRadius: '12px',
                '& .MuiAlert-icon': { color: '#01b574' },
              }}
            >
              {success}
            </Alert>
          )}

          {/* Sign In Form */}
          {mode === 'signIn' && (
            <form onSubmit={handleSignIn}>
              <StyledInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email..."
                icon={<IoMail size={18} />}
                disabled={isLoading}
              />
              <StyledInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password..."
                icon={<IoLockClosed size={18} />}
                disabled={isLoading}
                showPassword={showPassword}
                onTogglePassword={togglePassword}
              />

              {/* Remember Me Switch */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Switch 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#0075ff',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#0075ff',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ color: 'white', fontSize: '14px', ml: 1 }}
                >
                  Remember me
                </Typography>
              </Box>

              <AuthButton loading={isLoading}>Sign In</AuthButton>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                  Don't have an account?{' '}
                  <Box
                    component="span"
                    onClick={() => switchMode('signUp')}
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { color: '#0075ff' },
                    }}
                  >
                    Sign up
                  </Box>
                </Typography>
                <Box
                  component="span"
                  onClick={() => switchMode('forgotPassword')}
                  sx={{
                    display: 'inline-block',
                    mt: 1.5,
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    '&:hover': { color: '#0075ff' },
                  }}
                >
                  Forgot password?
                </Box>
              </Box>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signUp' && (
            <form onSubmit={handleSignUp}>
              <StyledInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email..."
                icon={<IoMail size={18} />}
                disabled={isLoading}
              />
              <StyledInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password..."
                icon={<IoLockClosed size={18} />}
                disabled={isLoading}
                showPassword={showPassword}
                onTogglePassword={togglePassword}
              />
              <StyledInput
                label="Confirm Password"
                type="password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Confirm your password..."
                icon={<IoLockClosed size={18} />}
                disabled={isLoading}
                showPassword={showPassword}
                onTogglePassword={togglePassword}
              />

              <AuthButton loading={isLoading} variant="purple" sx={{ mt: 1 }}>
                Create Account
              </AuthButton>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                  Already have an account?{' '}
                  <Box
                    component="span"
                    onClick={() => switchMode('signIn')}
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { color: '#0075ff' },
                    }}
                  >
                    Sign in
                  </Box>
                </Typography>
              </Box>
            </form>
          )}

          {/* Confirm Email Form */}
          {mode === 'confirmEmail' && (
            <form onSubmit={handleConfirmEmail}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>
                We've sent a verification code to <strong style={{ color: 'white' }}>{email}</strong>
              </Typography>
              <StyledInput
                label="Verification Code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                icon={<IoKey size={18} />}
                disabled={isLoading}
              />

              <AuthButton loading={isLoading} variant="green" sx={{ mt: 1 }}>
                Verify Email
              </AuthButton>

              <Box
                onClick={() => switchMode('signIn')}
                sx={{
                  mt: 4,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  '&:hover': { color: '#0075ff' },
                }}
              >
                ← Back to Sign In
              </Box>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgotPassword' && (
            <form onSubmit={handleForgotPasswordRequest}>
              <StyledInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email..."
                icon={<IoMail size={18} />}
                disabled={isLoading}
              />

              <AuthButton loading={isLoading} sx={{ mt: 1 }}>Send Reset Code</AuthButton>

              <Box
                onClick={() => switchMode('signIn')}
                sx={{
                  mt: 4,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  '&:hover': { color: '#0075ff' },
                }}
              >
                ← Back to Sign In
              </Box>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'resetPassword' && (
            <form onSubmit={handlePasswordReset}>
              <StyledInput
                label="Reset Code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code from email"
                icon={<IoKey size={18} />}
                disabled={isLoading}
              />
              <StyledInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                icon={<IoLockClosed size={18} />}
                disabled={isLoading}
                showPassword={showPassword}
                onTogglePassword={togglePassword}
              />
              <StyledInput
                label="Confirm New Password"
                type="password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Confirm new password"
                icon={<IoLockClosed size={18} />}
                disabled={isLoading}
                showPassword={showPassword}
                onTogglePassword={togglePassword}
              />

              <AuthButton loading={isLoading} sx={{ mt: 1 }}>Reset Password</AuthButton>

              <Box
                onClick={() => switchMode('signIn')}
                sx={{
                  mt: 4,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  '&:hover': { color: '#0075ff' },
                }}
              >
                ← Back to Sign In
              </Box>
            </form>
          )}
        </Box>

        {/* Footer */}
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            bottom: 24,
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px',
          }}
        >
          © 2026 RPG Habit Tracker
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;
