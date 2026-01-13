// components/AuthButton.jsx
// Reusable styled button for authentication forms

import { Button, CircularProgress } from '@mui/material';

// Preset gradient themes for different auth actions
const gradients = {
  primary: {
    background: 'linear-gradient(90deg, #0075ff 0%, #21d4fd 100%)',
    hover: 'linear-gradient(90deg, #0066dd 0%, #1bc4ed 100%)',
    shadow: '0 4px 14px 0 rgba(0, 117, 255, 0.39)',
    hoverShadow: '0 6px 20px 0 rgba(0, 117, 255, 0.5)',
  },
  purple: {
    background: 'linear-gradient(97.89deg, #4318ff 0%, #9f7aea 100%)',
    hover: 'linear-gradient(97.89deg, #3614cc 0%, #8a68d9 100%)',
    shadow: '0 4px 14px 0 rgba(67, 24, 255, 0.39)',
    hoverShadow: '0 6px 20px 0 rgba(67, 24, 255, 0.5)',
  },
  green: {
    background: 'linear-gradient(90deg, #01b574 0%, #35d28a 100%)',
    hover: 'linear-gradient(90deg, #01a066 0%, #2bc47a 100%)',
    shadow: '0 4px 14px 0 rgba(1, 181, 116, 0.39)',
    hoverShadow: '0 6px 20px 0 rgba(1, 181, 116, 0.5)',
  },
};

function AuthButton({ 
  children, 
  loading = false, 
  variant = 'primary',  // 'primary' | 'purple' | 'green'
  ...props 
}) {
  const colors = gradients[variant] || gradients.primary;

  return (
    <Button
      type="submit"
      fullWidth
      disabled={loading}
      sx={{
        py: 1.5,
        background: colors.background,
        color: 'white',
        fontWeight: 600,
        fontSize: '12px',
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        boxShadow: colors.shadow,
        '&:hover': {
          background: colors.hover,
          boxShadow: colors.hoverShadow,
        },
        '&:disabled': {
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.3)',
        },
      }}
      {...props}
    >
      {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : children}
    </Button>
  );
}

export default AuthButton;

