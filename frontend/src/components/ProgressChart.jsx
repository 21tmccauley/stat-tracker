// components/ProgressChart.jsx
// Progress tracking chart component

import { Box, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import GlassCard from './GlassCard';

function ProgressChart({ data }) {
  // Default data if none provided (last 7 days)
  const chartData = data || [
    { day: 'Mon', xp: 0 },
    { day: 'Tue', xp: 15 },
    { day: 'Wed', xp: 25 },
    { day: 'Thu', xp: 40 },
    { day: 'Fri', xp: 55 },
    { day: 'Sat', xp: 70 },
    { day: 'Sun', xp: 85 },
  ];

  // Custom tooltip styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: 'rgba(15, 21, 53, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}
          >
            {payload[0].payload.day}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#0075ff', fontWeight: 500 }}
          >
            {payload[0].value} XP
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <GlassCard sx={{ height: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
        Progress Overview
      </Typography>
      <Box sx={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0075ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0075ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="day"
              stroke="rgba(255, 255, 255, 0.4)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.4)"
              style={{ fontSize: '12px' }}
              tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="xp"
              stroke="#0075ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorXp)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Last 7 days
        </Typography>
        <Typography variant="body2" sx={{ color: '#0075ff', fontWeight: 600 }}>
          Total: {chartData[chartData.length - 1]?.xp || 0} XP
        </Typography>
      </Box>
    </GlassCard>
  );
}

export default ProgressChart;

