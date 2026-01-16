import { Box, IconButton, Typography, Avatar } from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import { IoLogOutOutline, IoStatsChart, IoFlame, IoSettings } from 'react-icons/io5';

import { useAuth } from './contexts/AuthContext';

function Sidenav() {
  const navItems = [
    { icon: <IoStatsChart size={24} />, label: 'Dashboard', path: '/' },
    { icon: <IoFlame size={24} />, label: 'Habits', path: '/habits' },
    { icon: <IoSettings size={24} />, label: 'Settings', path: '/settings' },
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/'}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <IconButton
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '14px',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  background: isActive
                    ? 'linear-gradient(97.89deg, #4318ff 0%, #9f7aea 100%)'
                    : 'transparent',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(97.89deg, #4318ff 0%, #9f7aea 100%)'
                      : 'rgba(255,255,255,0.1)',
                  },
                }}
                aria-label={item.label}
              >
                {item.icon}
              </IconButton>
            )}
          </NavLink>
        ))}
      </Box>
    </Box>
  );
}

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

function Layout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#030c1d' }}>
      <Sidenav />
      <Box sx={{ flex: 1, ml: '80px' }}>
        <Header />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;