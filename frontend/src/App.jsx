import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'

// Inner component that uses auth context
function AppContent() {
  const { isAuthenticated, loading, user, signOut } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show main app if authenticated
  return (
    <div>
      <header style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>RPG Habit Tracker</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>Welcome, {user}!</span>
          <button 
            onClick={signOut}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>
      <main style={{ padding: '20px' }}>
        <p>You're logged in! This is where your main app content will go.</p>
      </main>
    </div>
  );
}

// Outer component that provides auth context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
