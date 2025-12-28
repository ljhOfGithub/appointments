import React, { useState, useEffect } from 'react';
import { useMediaQuery, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DesktopApp from './components/DesktopApp';
import MobileApp from './components/MobileApp';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/user/Profile';
import api, { tokenStorage } from './api';

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

function App() {
  // Detect if it's mobile device
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); // 'login', 'register', 'app', 'profile'

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userFromStorage = tokenStorage.getUser();
      const token = tokenStorage.getAccessToken();

      if (userFromStorage && token) {
        // Verify token is still valid
        const response = await api.get('/auth/verify');

        if (response.data.authenticated) {
          setUser(response.data.user);
          setView('app');
        } else {
          // Token expired, try to refresh
          try {
            const refreshResponse = await api.post('/auth/refresh');
            const { accessToken, user: refreshedUser } = refreshResponse.data;

            tokenStorage.setAccessToken(accessToken);
            tokenStorage.setUser(refreshedUser);

            setUser(refreshedUser);
            setView('app');
          } catch (refreshError) {
            // Refresh failed, clear storage
            tokenStorage.clear();
            setView('login');
          }
        }
      } else {
        setView('login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenStorage.clear();
      setView('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('app');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setView('app');
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      tokenStorage.clear();
      setUser(null);
      setView('login');
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