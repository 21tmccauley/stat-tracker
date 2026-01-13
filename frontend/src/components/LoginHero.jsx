// components/LoginHero.jsx
// Decorative hero panel for the login page - purely presentational, no props needed

import { Box, Typography } from '@mui/material';

function LoginHero() {
  return (
    <Box
      sx={{
        flex: { xs: '0 0 200px', md: '1' },
        position: 'relative',
        overflow: 'hidden',
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        p: { sm: 4, md: 6 },
        // Gradient background
        background: `
          linear-gradient(
            to bottom,
            rgba(67, 24, 255, 0.1) 0%,
            rgba(6, 11, 40, 0.9) 100%
          ),
          linear-gradient(135deg, #1a0a4a 0%, #0d1b3e 50%, #0a1628 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Can replace with actual image: backgroundImage: 'url(/path/to/hero-image.jpg)',
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, 
              transparent 0%, 
              rgba(139, 92, 246, 0.1) 30%,
              rgba(59, 130, 246, 0.15) 60%,
              transparent 100%
            )
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      }}
    >
      {/* Blurred glow effect */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Hero Text */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 500,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            fontSize: { sm: '12px', md: '14px' },
            mb: 2,
          }}
        >
          Level Up Your Life:
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: { sm: '32px', md: '42px', lg: '52px' },
            lineHeight: 1.1,
            '& span': {
              background: 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            },
          }}
        >
          THE RPG <span>HABIT</span> TRACKER
        </Typography>
      </Box>

      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          right: '10%',
          width: 200,
          height: 200,
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '50%',
          opacity: 0.5,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          right: '5%',
          width: 300,
          height: 300,
          border: '1px solid rgba(59, 130, 246, 0.15)',
          borderRadius: '50%',
          opacity: 0.3,
        }}
      />
    </Box>
  );
}

export default LoginHero;

