import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { IoAdd } from 'react-icons/io5';
import toast from 'react-hot-toast';

import HabitCard from '../components/HabitCard';
import HabitForm from '../components/HabitForm';
import StatCard from '../components/StatCard';
import { completeHabit, createHabit, deleteHabit, getHabits } from '../services/api';

function Habits() {
  const [habits, setHabits] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [creatingHabit, setCreatingHabit] = useState(false);
  const [completingHabit, setCompletingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    try {
      setLoading(true);
      setError(null);
      const habitsResult = await getHabits();
      const activeHabits = (habitsResult.habits || []).filter(
        (habit) => habit.isActive !== false,
      );
      setHabits(activeHabits);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
      setError(err.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteHabit(habitId) {
    try {
      setCompletingHabit(habitId);
      const result = await completeHabit(habitId);
      setCompletedToday((prev) => [...prev, habitId]);

      if (result.user?.leveledUp) {
        toast.success(`🎉 Level Up! You are now level ${result.user.level}!`);
      } else {
        toast.success('Habit completed!');
      }
    } catch (err) {
      console.error('Failed to complete habit:', err);
      toast.error(err.message || 'Failed to complete habit');
    } finally {
      setCompletingHabit(null);
    }
  }

  async function handleCreateHabit(habitData) {
    try {
      setCreatingHabit(true);
      const result = await createHabit(habitData);
      setHabitFormOpen(false);
      await fetchHabits();
      toast.success(`Habit "${result.habit.name}" created successfully!`);
    } catch (err) {
      console.error('Failed to create habit:', err);
      toast.error(err.message || 'Failed to create habit');
    } finally {
      setCreatingHabit(false);
    }
  }

  async function handleDeleteHabit(habitId) {
    try {
      setDeletingHabit(habitId);
      await deleteHabit(habitId);
      setHabits((prev) => prev.filter((habit) => habit.habitId !== habitId));
      setCompletedToday((prev) => prev.filter((id) => id !== habitId));
      toast.success('Habit deleted successfully!');
    } catch (err) {
      console.error('Failed to delete habit:', err);
      toast.error(err.message || 'Failed to delete habit');
      await fetchHabits();
    } finally {
      setDeletingHabit(null);
    }
  }

  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const completedCount = completedToday.length;
    const totalXp = habits.reduce((sum, habit) => sum + (habit.xpReward || 0), 0);

    return {
      totalHabits,
      completedCount,
      totalXp,
    };
  }, [habits, completedToday]);

  const visibleHabits = useMemo(() => {
    const filtered = habits.filter((habit) => {
      if (filter === 'completed') {
        return completedToday.includes(habit.habitId);
      }
      if (filter === 'active') {
        return !completedToday.includes(habit.habitId);
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'xp') {
        return (b.xpReward || 0) - (a.xpReward || 0);
      }
      if (sortBy === 'status') {
        const aCompleted = completedToday.includes(a.habitId);
        const bCompleted = completedToday.includes(b.habitId);
        if (aCompleted === bCompleted) return 0;
        return aCompleted ? 1 : -1;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    return sorted;
  }, [habits, completedToday, filter, sortBy]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress sx={{ color: '#0075ff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Error loading habits
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={fetchHabits}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
          Habits
        </Typography>
        <Button
          variant="contained"
          startIcon={<IoAdd />}
          onClick={() => setHabitFormOpen(true)}
          sx={{
            background: 'linear-gradient(90deg, #0075ff 0%, #21d4fd 100%)',
          }}
        >
          New Habit
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<span>📌</span>}
            value={stats.totalHabits}
            label="Total Habits"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<span>✅</span>}
            value={stats.completedCount}
            label="Completed Today"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<span>⚡</span>}
            value={stats.totalXp}
            label="Total XP"
            color="primary"
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          mb: 3,
        }}
      >
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, nextValue) => nextValue && setFilter(nextValue)}
          sx={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '14px',
            p: 0.5,
            '& .MuiToggleButton-root': {
              color: 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              px: 2,
              py: 1,
              borderRadius: '10px',
              textTransform: 'none',
            },
            '& .Mui-selected': {
              color: 'white',
              background: 'linear-gradient(90deg, #0075ff 0%, #21d4fd 100%)',
            },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="completed">Completed</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sort by
          </Typography>
          <Select
            size="small"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            sx={{
              minWidth: 160,
              color: 'white',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0075ff',
              },
              '& .MuiSvgIcon-root': {
                color: 'rgba(255, 255, 255, 0.6)',
              },
            }}
          >
            <MenuItem value="name">Name (A–Z)</MenuItem>
            <MenuItem value="xp">XP Reward (High–Low)</MenuItem>
            <MenuItem value="status">Status (Active First)</MenuItem>
          </Select>
        </Box>
      </Box>

      {visibleHabits.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            {habits.length === 0 ? 'No habits yet' : 'No habits match this filter'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {habits.length === 0
              ? 'Create your first habit to start earning XP.'
              : 'Try a different filter to see your habits.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {visibleHabits.map((habit) => (
            <Grid key={habit.habitId} item xs={12} md={6}>
              <HabitCard
                habit={habit}
                isCompleted={completedToday.includes(habit.habitId)}
                isLoading={completingHabit === habit.habitId}
                isDeleting={deletingHabit === habit.habitId}
                onComplete={handleCompleteHabit}
                onDelete={handleDeleteHabit}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <HabitForm
        open={habitFormOpen}
        onClose={() => setHabitFormOpen(false)}
        onSubmit={handleCreateHabit}
        isLoading={creatingHabit}
      />
    </Box>
  );
}

export default Habits;