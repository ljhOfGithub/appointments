import React, { useState, useEffect } from 'react';
import { useMediaQuery, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DesktopApp from './components/DesktopApp';
import MobileApp from './components/MobileApp';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/user/Profile';
import axios from 'axios';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const API_URL = 'http://localhost:5000/api';

function App() {
  // Detect if it's mobile device
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); // 'login', 'register', 'app', 'profile'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/session`, {
        withCredentials: true
      });

      if (response.data.authenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setView('app');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setView('login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setView('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setView('app');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setView('app');
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
      setIsAuthenticated(false);
      setView('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleNavigateToProfile = () => {
    setView('profile');
  };

  const handleNavigateToApp = () => {
    setView('app');
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}>
            <div>Loading...</div>
          </div>
        </LocalizationProvider>
      </ThemeProvider>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'login':
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#f5f5f5'
          }}>
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setView('register')}
            />
          </div>
        );

      case 'register':
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#f5f5f5'
          }}>
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          </div>
        );

      case 'profile':
        return (
          <div style={{
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#f5f5f5'
          }}>
            <Profile
              user={user}
              onUpdate={handleProfileUpdate}
              onLogout={handleLogout}
            />

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleNavigateToApp}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Back to Appointments
              </button>
            </div>
          </div>
        );

      case 'app':
        if (isMobile) {
          return (
            <MobileApp
              user={user}
              onLogout={handleLogout}
              onNavigateToProfile={handleNavigateToProfile}
            />
          );
        } else {
          return (
            <DesktopApp
              user={user}
              onLogout={handleLogout}
              onNavigateToProfile={handleNavigateToProfile}
            />
          );
        }

      default:
        return <div>Invalid view</div>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        {renderContent()}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;