// MUI Theme configuration - Vision UI inspired dark theme
import { createTheme } from '@mui/material/styles';
import colors from './colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
    },
    secondary: {
      main: colors.info.main,
      light: colors.info.light,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.cardSolid,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: colors.background.default,
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: colors.background.card,
          backdropFilter: 'blur(120px)',
          borderRadius: '20px',
          border: `1px solid ${colors.border.light}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 24px',
          fontWeight: 600,
        },
        contained: {
          background: colors.info.gradient,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 14px 0 rgba(0, 117, 255, 0.39)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          borderRadius: 4,
          background: colors.info.gradient,
        },
      },
    },
  },
});

export default theme;
export { colors };

