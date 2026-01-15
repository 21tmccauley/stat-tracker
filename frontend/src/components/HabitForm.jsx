// components/HabitForm.jsx
// Modal form for creating a new habit

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Slider,
} from '@mui/material';

function HabitForm({ open, onClose, onSubmit, isLoading = false }) {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [xpReward, setXpReward] = useState(10);
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens/closes
  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setDescription('');
      setXpReward(10);
      setErrors({});
      onClose();
    }
  };

  // Validate form fields (matching backend validation)
  const validate = () => {
    const newErrors = {};

    // Name validation: required, non-empty string after trim
    if (!name || typeof name !== 'string' || name.trim() === '') {
      newErrors.name = 'Habit name is required';
    }

    // XP Reward validation: must be number between 1-100
    if (xpReward < 1 || xpReward > 100) {
      newErrors.xpReward = 'XP reward must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Prepare habit data (matching backend expected format)
    const habitData = {
      name: name.trim(),
      description: description.trim() || '',
      xpReward: xpReward,
      isActive: true, // New habits are always active
    };

    // Call parent's onSubmit handler
    onSubmit(habitData);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            Create New Habit
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Habit Name */}
            <TextField
              label="Habit Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
              fullWidth
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0075ff',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#0075ff',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.6)',
                },
              }}
            />

            {/* Description */}
            <TextField
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              fullWidth
              multiline
              rows={3}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0075ff',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#0075ff',
                  },
                },
              }}
            />

            {/* XP Reward Slider */}
            <Box>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
              >
                XP Reward: {xpReward}
              </Typography>
              <Slider
                value={xpReward}
                onChange={(e, newValue) => setXpReward(newValue)}
                min={1}
                max={100}
                step={1}
                disabled={isLoading}
                sx={{
                  color: '#0075ff',
                  '& .MuiSlider-thumb': {
                    '&:hover': {
                      boxShadow: '0 0 0 8px rgba(0, 117, 255, 0.16)',
                    },
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  1 XP
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  100 XP
                </Typography>
              </Box>
              {errors.xpReward && (
                <Typography
                  variant="caption"
                  sx={{ color: 'error.main', mt: 0.5, display: 'block' }}
                >
                  {errors.xpReward}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(90deg, #0075ff 0%, #21d4fd 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0066e6 0%, #1ac4ed 100%)',
              },
            }}
          >
            {isLoading ? 'Creating...' : 'Create Habit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default HabitForm;
