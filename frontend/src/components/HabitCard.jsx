// HabitCard - Individual habit display with complete button
// Shows habit name, XP reward, and completion status

import { useState } from 'react';
import { Box, Typography, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { IoCheckmarkCircle, IoTrash } from 'react-icons/io5';

function HabitCard({ habit, onComplete, onDelete, isCompleted = false, isLoading = false, isDeleting = false }) {
  const { name, description, xpReward = 10 } = habit;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent any parent click handlers
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    if (onDelete) {
      onDelete(habit.habitId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: '16px',
        background: isCompleted 
          ? 'rgba(1, 181, 116, 0.1)' 
          : 'rgba(255, 255, 255, 0.05)',
        border: isCompleted 
          ? '1px solid rgba(1, 181, 116, 0.3)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: isCompleted 
            ? 'rgba(1, 181, 116, 0.15)' 
            : 'rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      {/* Icon/Status */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          background: isCompleted 
            ? 'linear-gradient(90deg, #01b574 0%, #35d28a 100%)' 
            : 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0,
        }}
      >
        {isCompleted ? (
          <IoCheckmarkCircle color="white" size={24} />
        ) : (
          <span>🎯</span>
        )}
      </Box>

      {/* Habit info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 600, 
            color: 'white',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Typography>
        {description && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              display: 'block',
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* XP Reward */}
      <Chip
        label={`+${xpReward} XP`}
        size="small"
        sx={{
          background: isCompleted 
            ? 'rgba(1, 181, 116, 0.2)' 
            : 'rgba(0, 117, 255, 0.2)',
          color: isCompleted ? '#01b574' : '#0075ff',
          fontWeight: 600,
          border: 'none',
        }}
      />

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {/* Delete button */}
        <IconButton
          size="small"
          onClick={handleDeleteClick}
          disabled={isDeleting || isLoading}
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              color: '#ff4444',
              background: 'rgba(255, 68, 68, 0.1)',
            },
            '&:disabled': {
              color: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <IoTrash size={18} />
        </IconButton>

        {/* Complete button */}
        {!isCompleted ? (
          <Button
            variant="contained"
            size="small"
            onClick={() => onComplete(habit.habitId)}
            disabled={isLoading || isDeleting}
            sx={{
              minWidth: 90,
              background: 'linear-gradient(90deg, #0075ff 0%, #21d4fd 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0066dd 0%, #1bc4ed 100%)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {isLoading ? '...' : 'Complete'}
          </Button>
        ) : (
          <Chip
            icon={<IoCheckmarkCircle size={16} />}
            label="Done"
            size="small"
            sx={{
              background: 'linear-gradient(90deg, #01b574 0%, #35d28a 100%)',
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Delete Habit?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Are you sure you want to delete "{name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              background: '#ff4444',
              '&:hover': {
                background: '#cc3333',
              },
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HabitCard;



