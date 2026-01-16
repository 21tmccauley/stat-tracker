import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';

import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Settings from './pages/Settings';
import Layout from './layout';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route
              path="/"
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/habits"
              element={(
                <ProtectedRoute>
                  <Habits />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/settings"
              element={(
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              )}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
