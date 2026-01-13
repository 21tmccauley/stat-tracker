// StatCard - Mini statistics card component
// Shows an icon, value, and label (like "750 Total XP")

import { Box, Typography } from '@mui/material';
import GlassCard from './GlassCard';

function StatCard({ icon, value, label, color = 'info' }) {
  // Color mapping for icon backgrounds
  const colorMap = {
    info: 'linear-gradient(90deg, #0075ff 0%, #21d4fd 100%)',
    success: 'linear-gradient(90deg, #01b574 0%, #35d28a 100%)',
    warning: 'linear-gradient(90deg, #ffb547 0%, #ffcd75 100%)',
    primary: 'linear-gradient(97.89deg, #4318ff 0%, #9f7aea 100%)',
    error: 'linear-gradient(90deg, #e31a1a 0%, #ee5d50 100%)',
  };

  return (
    <GlassCard>
      <Box display="flex" alignItems="center" gap={2}>
        {/* Icon box */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: colorMap[color] || colorMap.info,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 14px 0 rgba(0, 117, 255, 0.39)',
          }}
        >
          {icon}
        </Box>

        {/* Text content */}
        <Box>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary', 
              textTransform: 'uppercase',
              fontWeight: 500,
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'white',
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
}

export default StatCard;

