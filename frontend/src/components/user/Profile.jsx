import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
  Avatar,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  CalendarToday as CalendarIcon,
  Update as UpdateIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccessTime as TimeIcon,
  EventNote as EventIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api, { tokenStorage } from '../../api';

const Profile = ({ user, onUpdate, onLogout }) => {
  // State for profile data
  const [profileData, setProfileData] = useState({
    email: '',
    username: '',
    fullName: '',
    phone: ''
  });

  // State for password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for statistics
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    today: 0
  });

  // State for recent activity
  const [recentActivity, setRecentActivity] = useState([]);

  // State for UI
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Fetch user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        username: user.username || '',
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
      fetchStats();
      fetchRecentActivity();
    }
  }, [user]);

  // Fetch user statistics
  const fetchStats = async () => {
    if (!user) return;

    setStatsLoading(true);
    try {
      const response = await api.get('/appointments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      const response = await api.get('/appointments', {
        params: {
          page: 1,
          per_page: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      setRecentActivity(response.data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate profile form
  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (profileData.phone && !/^[\d\s\-\+\(\)]+$/.test(profileData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) {
      return;
    }

    setProfileLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/auth/user', profileData);

      setMessage({
        type: 'success',
        text: 'Profile updated successfully! Changes will take effect immediately.'
      });
      setEditMode(false);

      // Update user data in localStorage
      const updatedUser = { ...user, ...response.data.user };
      tokenStorage.setUser(updatedUser);

      if (onUpdate) {
        onUpdate(updatedUser);
      }
    } catch (error) {
      const messageText = error.response?.data?.error || 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: messageText });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setPasswordLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage({
        type: 'success',
        text: 'Password changed successfully! Please use your new password for future logins.'
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const messageText = error.response?.data?.error || 'Failed to change password. Please check your current password.';
      setMessage({ type: 'error', text: messageText });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage({
        type: 'error',
        text: 'Please type DELETE in uppercase to confirm account deletion.'
      });
      return;
    }

    try {
      // Note: We need to add a delete account endpoint in backend
      // For now, we'll just show a message
      setMessage({
        type: 'info',
        text: 'Account deletion feature is currently under development. Please contact support.'
      });
      setDeleteDialogOpen(false);
      setDeleteConfirmText('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete account. Please try again later.'
      });
    }
  };

  // Get status icon for appointments
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <TimeIcon fontSize="small" color="success" />;
      case 'completed': return <CheckCircleIcon fontSize="small" color="info" />;
      case 'cancelled': return <ErrorIcon fontSize="small" color="error" />;
      default: return <EventIcon fontSize="small" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM D, YYYY h:mm A');
  };

  // Calculate account age
  const getAccountAge = () => {
    if (!user?.createdAt) return 'N/A';
    const created = dayjs(user.createdAt);
    const now = dayjs();
    const years = now.diff(created, 'year');
    const months = now.diff(created, 'month') % 12;

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  // Calculate days since last login
  const getDaysSinceLastLogin = () => {
    if (!user?.lastLogin) return 'N/A';
    const lastLogin = dayjs(user.lastLogin);
    const now = dayjs();
    const days = now.diff(lastLogin, 'day');

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;

    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 3
      }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, maxWidth: 400 }}>
          <VerifiedIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Please login to view profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in to access your profile information.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      maxWidth: 1200,
      mx: 'auto',
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Paper sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 3,
          mb: 2
        }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'white',
              color: 'primary.main',
              fontSize: '3rem',
              border: '4px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {user.fullName
              ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
              : user.username.charAt(0).toUpperCase()
            }
          </Avatar>

          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              {user.fullName || user.username}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
              <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              @{user.username}
            </Typography>

            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}>
              <Chip
                icon={<EmailIcon />}
                label={user.email}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 500
                }}
              />
              {user.phone && (
                <Chip
                  icon={<PhoneIcon />}
                  label={user.phone}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              )}
              <Chip
                icon={<CalendarIcon />}
                label={`Member for ${getAccountAge()}`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>

          <Box>
            {!editMode ? (
              <Button
                variant="contained"
                startIcon={<UpdateIcon />}
                onClick={() => setEditMode(true)}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setEditMode(false);
                  setProfileData({
                    email: user.email || '',
                    username: user.username || '',
                    fullName: user.fullName || '',
                    phone: user.phone || ''
                  });
                  setErrors({});
                  setMessage({ type: '', text: '' });
                }}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Stats Grid */}
      {loading ? (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Appointments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TimeIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                  {stats.scheduled}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scheduled
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                  {stats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <HistoryIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                  {getDaysSinceLastLogin()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Message Alert */}
      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
          icon={
            message.type === 'success' ? <CheckCircleIcon /> :
              message.type === 'error' ? <ErrorIcon /> :
                message.type === 'warning' ? <WarningIcon /> : <InfoIcon />
          }
        >
          {message.text}
        </Alert>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Profile & Security */}
        <Grid item xs={12} lg={8}>
          {/* Profile Information Card */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Information
                </Typography>
              </Box>

              <form onSubmit={handleProfileSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      disabled={!editMode || profileLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      error={!!errors.username}
                      helperText={errors.username || '3-20 characters, letters, numbers, underscores'}
                      disabled={!editMode || profileLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      disabled={!editMode || profileLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      disabled={!editMode || profileLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {editMode && (
                  <Box sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2
                  }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={profileLoading}
                      startIcon={profileLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{ minWidth: 120 }}
                    >
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <SecurityIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security Settings
                </Typography>
              </Box>

              <form onSubmit={handlePasswordSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword}
                      disabled={passwordLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('current')}
                              edge="end"
                            >
                              {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword || 'At least 8 characters with uppercase, lowercase, and numbers'}
                      disabled={passwordLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('new')}
                              edge="end"
                            >
                              {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {passwordData.newPassword && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Password Strength
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength}
                          sx={{
                            mt: 0.5,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: passwordStrength < 50 ? 'error.main' :
                                passwordStrength < 75 ? 'warning.main' : 'success.main'
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{
                          color: passwordStrength < 50 ? 'error.main' :
                            passwordStrength < 75 ? 'warning.main' : 'success.main',
                          fontWeight: 600
                        }}>
                          {passwordStrength < 50 ? 'Weak' :
                            passwordStrength < 75 ? 'Medium' : 'Strong'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword}
                      disabled={passwordLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('confirm')}
                              edge="end"
                            >
                              {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={passwordLoading}
                    startIcon={passwordLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{ minWidth: 120 }}
                  >
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Recent Activity & Account Actions */}
        <Grid item xs={12} lg={4}>
          {/* Recent Activity Card */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <DashboardIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
              </Box>

              {recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recent activity found
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getStatusIcon(activity.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="medium">
                              {activity.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(activity.createdAt)}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={activity.status}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: activity.status === 'scheduled' ? 'success.light' :
                                      activity.status === 'completed' ? 'info.light' :
                                        'error.light',
                                    color: activity.status === 'scheduled' ? 'success.dark' :
                                      activity.status === 'completed' ? 'info.dark' :
                                        'error.dark'
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  • {activity.duration} min
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              )}

              {recentActivity.length > 0 && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    size="small"
                    onClick={fetchRecentActivity}
                    startIcon={<UpdateIcon />}
                  >
                    Refresh Activity
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <WarningIcon color="error" sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Account Actions
                </Typography>
              </Box>

              <List dense>
                <ListItem
                  button
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={onLogout}
                >
                  <ListItemIcon>
                    <LogoutIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography color="error.main" fontWeight="medium">
                        Logout
                      </Typography>
                    }
                    secondary="Sign out from all devices"
                  />
                </ListItem>

                <ListItem
                  button
                  sx={{
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <ListItemIcon>
                    <DeleteIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography color="error.main" fontWeight="medium">
                        Delete Account
                      </Typography>
                    }
                    secondary="Permanently delete your account and all data"
                  />
                </ListItem>
              </List>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Warning: These actions are irreversible. Please proceed with caution.
              </Typography>
            </CardContent>
          </Card>

          {/* Account Information Card */}
          <Card sx={{ mt: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <InfoIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Account Information
                </Typography>
              </Box>

              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Account ID"
                    secondary={
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        #{user.id}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider sx={{ my: 1 }} />

                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Account Created"
                    secondary={
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        {user.createdAt ? dayjs(user.createdAt).format('MMMM D, YYYY') : 'N/A'}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider sx={{ my: 1 }} />

                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Last Login"
                    secondary={
                      <Typography variant="body2" color="text.primary" fontWeight="medium">
                        {user.lastLogin ? dayjs(user.lastLogin).format('MMMM D, YYYY h:mm A') : 'N/A'}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider sx={{ my: 1 }} />

                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Appointment Statistics"
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Total Appointments</Typography>
                          <Typography variant="caption" fontWeight="bold">{stats.total}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Scheduled</Typography>
                          <Typography variant="caption" fontWeight="bold" color="success.main">{stats.scheduled}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Completed</Typography>
                          <Typography variant="caption" fontWeight="bold" color="info.main">{stats.completed}</Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </DialogContentText>

          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="600">
              Warning: You will lose access to all your appointments and data.
            </Typography>
          </Alert>

          <TextField
            autoFocus
            fullWidth
            label="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            error={deleteConfirmText && deleteConfirmText !== 'DELETE'}
            helperText={
              deleteConfirmText && deleteConfirmText !== 'DELETE'
                ? 'Please type DELETE in uppercase letters'
                : 'Enter DELETE in uppercase letters to confirm'
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={deleteConfirmText !== 'DELETE'}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;