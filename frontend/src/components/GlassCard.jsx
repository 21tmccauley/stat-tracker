// GlassCard - A glassmorphism-style card component
// Inspired by Vision UI's card design

import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)',
  backdropFilter: 'blur(120px)',
  borderRadius: '20px',
  border: '1px solid rgba(226, 232, 240, 0.3)',
  boxShadow: 'none',
  padding: theme.spacing(3),
  color: theme.palette.text.primary,
}));

export default GlassCard;

