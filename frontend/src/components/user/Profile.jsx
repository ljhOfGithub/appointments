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
  Chip
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
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Profile = ({ user, onUpdate, onLogout }) => {
  const [profileData, setProfileData] = useState({
    email: '',
    username: '',
    fullName: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        username: user.username || '',
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put(`${API_URL}/auth/user`, profileData, {
        withCredentials: true
      });

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setEditMode(false);

      if (onUpdate) {
        onUpdate(response.data.user);
      }
    } catch (error) {
      const messageText = error.response?.data?.error || 'Failed to update profile';
      setMessage({ type: 'error', text: messageText });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setPasswordLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });

      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const messageText = error.response?.data?.error || 'Failed to change password';
      setMessage({ type: 'error', text: messageText });
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!user) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Please login to view profile
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem'
            }}
          >
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {user.fullName || user.username}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Chip
                icon={<PersonIcon />}
                label={`@${user.username}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<EmailIcon />}
                label={user.email}
                size="small"
                variant="outlined"
              />
              {user.createdAt && (
                <Chip
                  icon={<CalendarIcon />}
                  label={`Joined ${dayjs(user.createdAt).format('MMM YYYY')}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {!editMode ? (
            <Button
              variant="outlined"
              startIcon={<UpdateIcon />}
              onClick={() => setEditMode(true)}
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
            >
              Cancel
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" color="primary">
                {user.appointmentCount || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Appointments
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" color="success.main">
                {dayjs(user.lastLogin).format('MMM D')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last Login
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Profile Form */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Profile Information
        </Typography>

        <form onSubmit={handleProfileSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={!editMode || loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                error={!!errors.username}
                helperText={errors.username}
                disabled={!editMode || loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                disabled={!editMode || loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                disabled={!editMode || loading}
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
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </form>
      </Paper>

      {/* Password Change Form */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Change Password
        </Typography>

        <form onSubmit={handlePasswordSubmit}>
          <Grid container spacing={2}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
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
            </Grid>

            <Grid item xs={12} sm={6}>
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

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={passwordLoading}
              startIcon={passwordLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Account Actions */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: 'error.main' }}>
          Account Actions
        </Typography>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={onLogout}
          sx={{ py: 1.5 }}
        >
          Logout from All Devices
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Note: This will end your current session and log you out from all devices.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Profile;