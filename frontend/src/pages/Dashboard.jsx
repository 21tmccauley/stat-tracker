// pages/Dashboard.jsx
// Main dashboard page with character stats and habits

import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button, CircularProgress } from '@mui/material';
import { IoAdd, IoFlame, IoCheckmarkCircle, IoStatsChart } from 'react-icons/io5';
import { IoIosRocket } from 'react-icons/io';

// Components
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import CharacterCard from '../components/CharacterCard';
import HabitCard from '../components/HabitCard';
import ProgressChart from '../components/ProgressChart';

// Services
import { getUserData, completeHabit } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  
  // State
  const [userData, setUserData] = useState(null);
  const [habits, setHabits] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingHabit, setCompletingHabit] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const data = await getUserData();
      setUserData(data);
      // TODO: Fetch habits separately when we add that endpoint
      // For now, using mock data
      setHabits([
        { habitId: '1', name: 'Morning Exercise', description: '30 minutes of activity', xpReward: 25 },
        { habitId: '2', name: 'Read 30 Minutes', description: 'Read a book or articles', xpReward: 15 },
        { habitId: '3', name: 'Meditate', description: '10 minutes of mindfulness', xpReward: 10 },
        { habitId: '4', name: 'Drink 8 Glasses of Water', xpReward: 10 },
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteHabit(habitId) {
    try {
      setCompletingHabit(habitId);
      const result = await completeHabit(habitId);
      
      // Update completed list
      setCompletedToday(prev => [...prev, habitId]);
      
      // Update user data with new XP/level
      if (result.user) {
        setUserData(prev => ({
          ...prev,
          level: result.user.level,
          totalXP: result.user.totalXP,
        }));
      }

      // Show level up celebration (could add a modal/toast here)
      if (result.user?.leveledUp) {
        alert(`🎉 Level Up! You are now level ${result.user.level}!`);
      }
    } catch (err) {
      console.error('Failed to complete habit:', err);
      alert(err.message || 'Failed to complete habit');
    } finally {
      setCompletingHabit(null);
    }
  }

  // Loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}
      >
        <CircularProgress sx={{ color: '#0075ff' }} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Error loading dashboard
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<IoAdd />}
          sx={{
            background: 'linear-gradient(90deg, #0075ff 0%, #21d4fd 100%)',
          }}
        >
          New Habit
        </Button>
      </Box>

      {/* Character Card */}
      <Box sx={{ mb: 3 }}>
        <CharacterCard
          level={userData?.level || 1}
          totalXP={userData?.totalXP || 0}
          username={user || 'Adventurer'}
        />
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<IoStatsChart color="white" size={22} />}
            value={habits.length}
            label="Active Habits"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<IoIosRocket color="white" size={22} />}
            value={userData?.totalXP || 0}
            label="Total XP"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<IoCheckmarkCircle color="white" size={22} />}
            value={completedToday.length}
            label="Completed Today"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<IoFlame color="white" size={22} />}
            value={5}
            label="Day Streak"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Progress Chart - Full Width Section */}
      <Box sx={{ mb: 3 }}>
        <ProgressChart />
      </Box>

      {/* Today's Habits */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <GlassCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                Today's Quests
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#0075ff', 
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                See All →
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {habits.map((habit) => (
                <HabitCard
                  key={habit.habitId}
                  habit={habit}
                  isCompleted={completedToday.includes(habit.habitId)}
                  isLoading={completingHabit === habit.habitId}
                  onComplete={handleCompleteHabit}
                />
              ))}
            </Box>
          </GlassCard>
        </Grid>

        {/* Activity Log */}
        <Grid item xs={12} lg={4}>
          <GlassCard sx={{ height: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'white', mb: 3 }}>
              Recent Activity
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {completedToday.length > 0 ? (
                completedToday.map((habitId, index) => {
                  const habit = habits.find(h => h.habitId === habitId);
                  return (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#0075ff',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Completed <strong style={{ color: 'white' }}>{habit?.name}</strong>
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No activity yet today.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Complete a habit to get started! 🚀
                  </Typography>
                </Box>
              )}

              {/* Static examples for design */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#01b574' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Reached <strong style={{ color: 'white' }}>Level 5!</strong> 🎉
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#0075ff' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Earned <strong style={{ color: 'white' }}>+25 XP</strong> for Exercise
                </Typography>
              </Box>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;

