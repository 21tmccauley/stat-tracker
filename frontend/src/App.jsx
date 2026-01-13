import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, IconButton, Typography, Avatar } from '@mui/material';
import { IoLogOutOutline, IoStatsChart, IoFlame, IoTrophy, IoSettings } from 'react-icons/io5';

import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Sidebar navigation
function Sidenav() {
  const navItems = [
    { icon: <IoStatsChart size={24} />, label: 'Dashboard', active: true },
    { icon: <IoFlame size={24} />, label: 'Habits' },
    { icon: <IoTrophy size={24} />, label: 'Achievements' },
    { icon: <IoSettings size={24} />, label: 'Settings' },
  ];

  return (
    <Box
      sx={{
        width: 80,
        minHeight: '100vh',
        background: 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)',
        borderRight: '1px solid rgba(226, 232, 240, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: '14px',
          background: 'linear-gradient(97.89deg, #4318ff 0%, #9f7aea 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          fontSize: '24px',
        }}
      >
        ⚔️
      </Box>

      {/* Nav items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        {navItems.map((item, index) => (
          <IconButton
            key={index}
            sx={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              color: item.active ? 'white' : 'rgba(255,255,255,0.5)',
              background: item.active 
                ? 'linear-gradient(97.89deg, #4318ff 0%, #9f7aea 100%)' 
                : 'transparent',
              '&:hover': {
                background: item.active 
                  ? 'linear-gradient(97.89deg, #4318ff 0%, #9f7aea 100%)'
                  : 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {item.icon}
          </IconButton>
        ))}
      </Box>
    </Box>
  );
}

// Header bar
function Header() {
  const { user, signOut } = useAuth();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 2,
        p: 2,
        background: 'transparent',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {user}
        </Typography>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(97.89deg, #4318ff 0%, #9f7aea 100%)',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {user?.substring(0, 2).toUpperCase() || 'U'}
        </Avatar>
        <IconButton
          onClick={signOut}
          sx={{
            color: 'rgba(255,255,255,0.5)',
            '&:hover': {
              color: '#e31a1a',
              background: 'rgba(227, 26, 26, 0.1)',
            },
          }}
        >
          <IoLogOutOutline size={22} />
        </IconButton>
      </Box>
    </Box>
  );
}

// Main app layout with sidebar
function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#030c1d' }}>
      {/* Sidebar */}
      <Sidenav />

      {/* Main content area */}
      <Box sx={{ flex: 1, ml: '80px' }}>
        <Header />
        <Dashboard />
      </Box>
    </Box>
  );
}

// App content with auth check
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#030c1d',
          color: 'white',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show main app if authenticated
  return <MainLayout />;
}

// Root component with providers
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
