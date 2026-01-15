// CharacterCard - Welcome/character display card
// Shows level, XP progress, and character info

import { Box, Typography, LinearProgress } from '@mui/material';
import GlassCard from './GlassCard';

function CharacterCard({ level = 1, totalXP = 0, username = 'Adventurer' }) {
  // Calculate XP progress
  // Level formula: level = Math.floor(totalXP / 100) + 1
  // So XP needed for current level = (level - 1) * 100
  // XP needed for next level = level * 100
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpProgress = totalXP - xpForCurrentLevel;
  const xpNeeded = 100; // Always 100 XP per level
  const progressPercent = (xpProgress / xpNeeded) * 100;

  // Character titles based on level
  const getTitleForLevel = (lvl) => {
    if (lvl >= 20) return 'Legendary Hero';
    if (lvl >= 15) return 'Master Adventurer';
    if (lvl >= 10) return 'Seasoned Warrior';
    if (lvl >= 5) return 'Apprentice Adventurer';
    if (lvl >= 2) return 'Novice Explorer';
    return 'Beginner';
  };

  return (
    <GlassCard
      sx={{
        background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.8) 0%, rgba(0, 117, 255, 0.6) 50%, rgba(6, 11, 40, 0.94) 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200,
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          right: 50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Welcome text */}
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
          Welcome back,
        </Typography>

        {/* Character name/title */}
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
          {username}
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
          {getTitleForLevel(level)}
        </Typography>

        {/* Level display */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
              {level}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              LEVEL
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {xpProgress} / {xpNeeded} XP
            </Typography>
          </Box>
        </Box>

        {/* XP Progress bar */}
        <Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
              },
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.6)', 
              display: 'block', 
              textAlign: 'right',
              mt: 0.5 
            }}
          >
            {xpNeeded - xpProgress} XP to Level {level + 1}
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
}

export default CharacterCard;



