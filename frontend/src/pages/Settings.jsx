import { Box, Typography } from '@mui/material';

function Settings() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>
        Settings
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Settings page coming soon.
      </Typography>
    </Box>
  );
}

export default Settings;
