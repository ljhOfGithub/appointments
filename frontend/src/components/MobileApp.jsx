import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  Box,
  Paper,
  Grid,
  Button,
  Snackbar,
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  CircularProgress,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  TextField,
  Chip,
  Fab,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  ListItemButton,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  List as ListIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';

// Import components
import AppointmentForm from './common/AppointmentForm';
import AppointmentCard from './common/AppointmentCard';
import StatsPanel from './common/StatsPanel';

const API_URL = 'http://localhost:5000/api';

const MobileApp = () => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openMenuDrawer, setOpenMenuDrawer] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, cancelled: 0, completed: 0, today: 0 });
  const [bottomNav, setBottomNav] = useState(0);
  const [activeView, setActiveView] = useState('list'); // 'list', 'stats', 'calendar'
  const [activeTab, setActiveTab] = useState(0);

  // Filter and search state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: '09:00',
    duration: 60,
    customerName: '',
    customerEmail: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search,
        status: filters.status !== 'all' ? filters.status : '',
        startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : '',
        endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : '',
        page: pagination.page,
        per_page: pagination.per_page
      };

      const response = await axios.get(`${API_URL}/appointments`, { params });
      setAppointments(response.data.appointments);
      setPagination({
        ...pagination,
        total: response.data.total,
        total_pages: response.data.total_pages
      });
    } catch (error) {
      showSnackbar('Failed to fetch appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/appointments/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.time) {
      errors.time = 'Time is required';
    }

    if (!formData.customerName.trim()) {
      errors.customerName = 'Customer name is required';
    }

    if (!formData.customerEmail.trim()) {
      errors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.customerEmail = 'Email is invalid';
    }

    if (formData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date ? date.format('YYYY-MM-DD') : ''
    }));
    if (formErrors.date) {
      setFormErrors(prev => ({
        ...prev,
        date: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the form errors', 'error');
      return;
    }

    try {
      if (editingAppointment) {
        await axios.put(`${API_URL}/appointments/${editingAppointment.id}`, formData);
        showSnackbar('Appointment updated successfully', 'success');
      } else {
        await axios.post(`${API_URL}/appointments`, formData);
        showSnackbar('Appointment created successfully', 'success');
      }
      setOpenDialog(false);
      resetForm();
      fetchAppointments();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.error || 'Operation failed';
      showSnackbar(message, 'error');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`${API_URL}/appointments/${id}`);
        showSnackbar('Appointment deleted successfully', 'success');
        fetchAppointments();
        fetchStats();
      } catch (error) {
        showSnackbar('Failed to delete appointment', 'error');
      }
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.post(`${API_URL}/appointments/${id}/cancel`);
      showSnackbar('Appointment cancelled successfully', 'success');
      fetchAppointments();
      fetchStats();
    } catch (error) {
      showSnackbar('Failed to cancel appointment', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.post(`${API_URL}/appointments/${id}/complete`);
      showSnackbar('Appointment marked as completed', 'success');
      fetchAppointments();
      fetchStats();
    } catch (error) {
      showSnackbar('Failed to complete appointment', 'error');
    }
  };

  // Filter handlers
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: dayjs().format('YYYY-MM-DD'),
      time: '09:00',
      duration: 60,
      customerName: '',
      customerEmail: '',
    });
    setFormErrors({});
    setEditingAppointment(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleBottomNavChange = (event, newValue) => {
    setBottomNav(newValue);
    const views = ['list', 'stats', 'calendar'];
    setActiveView(views[newValue]);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Today's appointments
  const todayAppointments = appointments.filter(app =>
    app.date === dayjs().format('YYYY-MM-DD') && app.status === 'scheduled'
  );

  // Upcoming appointments (next 7 days)
  const upcomingAppointments = appointments.filter(app => {
    const appointmentDate = dayjs(app.date);
    const today = dayjs();
    const nextWeek = today.add(7, 'day');
    return appointmentDate.isAfter(today) &&
      appointmentDate.isBefore(nextWeek) &&
      app.status === 'scheduled';
  });

  // Render different views based on activeView
  const renderView = () => {
    switch (activeView) {
      case 'stats':
        return (
          <Box sx={{ p: 2 }}>
            {/* Stats Panel */}
            <StatsPanel stats={stats} isMobile={true} />

            {/* Today's Appointments */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                <TodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Today's Appointments
              </Typography>

              {todayAppointments.length > 0 ? (
                <List dense>
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      sx={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        py: 1.5
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <TimeIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={appointment.title}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <TimeIcon fontSize="small" sx={{ fontSize: '0.875rem' }} />
                            <Typography variant="caption">
                              {appointment.time} • {appointment.duration} min
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No appointments scheduled for today
                </Typography>
              )}
            </Paper>

            {/* Quick Stats Cards */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <ScheduleIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" color="success.main">
                      {stats.scheduled}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                    <Typography variant="h6" color="info.main">
                      {stats.completed}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 'calendar':
        return (
          <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <CalendarIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Calendar View
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                View and manage your appointments in calendar format.
              </Typography>

              {/* Calendar Tabs */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                sx={{ mb: 3 }}
              >
                <Tab label="Day" />
                <Tab label="Week" />
                <Tab label="Month" />
              </Tabs>

              {/* Calendar Content */}
              <Box sx={{
                bgcolor: 'background.default',
                borderRadius: 2,
                p: 3,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2
              }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body1" color="text.secondary">
                  Calendar feature is under development
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center">
                  You'll be able to view appointments in a calendar format
                </Typography>
              </Box>
            </Paper>

            {/* Upcoming Appointments */}
            <Paper sx={{ p: 2, mt: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Upcoming This Week
              </Typography>

              {upcomingAppointments.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <Paper
                      key={appointment.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <CalendarIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {appointment.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(appointment.date).format('MMM DD')} • {appointment.time}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={appointment.duration + ' min'}
                        size="small"
                        variant="outlined"
                      />
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No upcoming appointments this week
                </Typography>
              )}
            </Paper>
          </Box>
        );

      default: // 'list'
        return (
          <>
            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    placeholder="Search appointments..."
                    size="small"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => setOpenFilterDrawer(true)}
                  >
                    Filter
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Status Filter Chips */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, overflowX: 'auto', pb: 1, px: 1 }}>
              {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
                <Chip
                  key={status}
                  label={status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  onClick={() => handleFilterChange('status', status)}
                  color={filters.status === status ? 'primary' : 'default'}
                  variant={filters.status === status ? 'filled' : 'outlined'}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    fontWeight: filters.status === status ? 600 : 400
                  }}
                />
              ))}
            </Box>

            {/* Loading Indicator */}
            {loading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
              </Box>
            )}

            {/* Appointments List */}
            {appointments.length === 0 && !loading ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <ScheduleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No appointments found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {filters.search || filters.status !== 'all' || filters.startDate || filters.endDate
                    ? 'Try adjusting your filters'
                    : 'Create your first appointment to get started'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    resetForm();
                    setOpenDialog(true);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Create Appointment
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {appointments.map((appointment) => (
                  <Grid item xs={12} key={appointment.id}>
                    <AppointmentCard
                      appointment={appointment}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onCancel={handleCancel}
                      onComplete={handleComplete}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Load More Button */}
            {appointments.length > 0 && pagination.page < pagination.total_pages && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  sx={{ borderRadius: 2 }}
                >
                  Load More Appointments
                </Button>
              </Box>
            )}
          </>
        );
    }
  };

  // Menu Drawer Content
  const renderMenuDrawer = () => (
    <Box sx={{ width: 280 }}>
      {/* User Profile Section */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Avatar sx={{ width: 56, height: 56, mb: 2, bgcolor: 'white', color: 'primary.main' }}>
          <PersonIcon />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          Welcome Back!
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {appointments.length} appointments managed
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ p: 2 }}>
        <ListItemButton
          selected={activeView === 'list'}
          onClick={() => {
            setActiveView('list');
            setOpenMenuDrawer(false);
          }}
          sx={{ borderRadius: 1, mb: 1 }}
        >
          <ListItemIcon>
            <ListIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Appointments" />
        </ListItemButton>

        <ListItemButton
          selected={activeView === 'stats'}
          onClick={() => {
            setActiveView('stats');
            setOpenMenuDrawer(false);
          }}
          sx={{ borderRadius: 1, mb: 1 }}
        >
          <ListItemIcon>
            <DashboardIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Statistics" />
        </ListItemButton>

        <ListItemButton
          selected={activeView === 'calendar'}
          onClick={() => {
            setActiveView('calendar');
            setOpenMenuDrawer(false);
          }}
          sx={{ borderRadius: 1, mb: 1 }}
        >
          <ListItemIcon>
            <CalendarIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Calendar" />
        </ListItemButton>

        <Divider sx={{ my: 2 }} />

        {/* <ListItemButton sx={{ borderRadius: 1, mb: 1 }}>
          <ListItemIcon>
            <NotificationsIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItemButton>

        <ListItemButton sx={{ borderRadius: 1, mb: 1 }}>
          <ListItemIcon>
            <SettingsIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        <ListItemButton sx={{ borderRadius: 1, mb: 1 }}>
          <ListItemIcon>
            <HelpIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </ListItemButton>

        <Divider sx={{ my: 2 }} />

        <ListItemButton sx={{ borderRadius: 1, color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton> */}
      </List>

      {/* Quick Stats Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Quick Stats
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{
              p: 1,
              bgcolor: 'success.light',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="success.dark" fontWeight="bold">
                {stats.scheduled}
              </Typography>
              <Typography variant="caption" color="success.dark" display="block">
                Active
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{
              p: 1,
              bgcolor: 'info.light',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="info.dark" fontWeight="bold">
                {stats.completed}
              </Typography>
              <Typography variant="caption" color="info.dark" display="block">
                Completed
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ pb: 7, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpenMenuDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <CalendarIcon sx={{ mr: 1 }} />

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {activeView === 'list' ? 'Appointments' :
              activeView === 'stats' ? 'Statistics' : 'Calendar'}
          </Typography>

          <IconButton color="inherit" onClick={fetchAppointments}>
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ p: 0 }}>
        {renderView()}
      </Container>

      {/* Floating Action Button for New Appointment */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => {
          resetForm();
          setOpenDialog(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={bottomNav}
        onChange={handleBottomNavChange}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          bgcolor: 'background.paper'
        }}
      >
        <BottomNavigationAction
          label="Appointments"
          icon={<ListIcon />}
          sx={{
            color: bottomNav === 0 ? 'primary.main' : 'text.secondary',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }}
        />
        <BottomNavigationAction
          label="Statistics"
          icon={<DashboardIcon />}
          sx={{
            color: bottomNav === 1 ? 'primary.main' : 'text.secondary',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }}
        />
        <BottomNavigationAction
          label="Calendar"
          icon={<CalendarIcon />}
          sx={{
            color: bottomNav === 2 ? 'primary.main' : 'text.secondary',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }}
        />
      </BottomNavigation>

      {/* Menu Drawer */}
      <Drawer
        anchor="left"
        open={openMenuDrawer}
        onClose={() => setOpenMenuDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: '80vw'
          }
        }}
      >
        {renderMenuDrawer()}
      </Drawer>

      {/* Filter Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        onOpen={() => setOpenFilterDrawer(true)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Filter Appointments
          </Typography>

          {/* Status Filter */}
          <FormControl fullWidth size="medium" sx={{ mb: 3 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filters.status}
              label="Status Filter"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">All Appointments</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          {/* Date Range Filters */}
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', mb: 1 }}>
            Date Range
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              slotProps={{
                textField: {
                  size: 'medium',
                  fullWidth: true
                }
              }}
            />

            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              slotProps={{
                textField: {
                  size: 'medium',
                  fullWidth: true
                }
              }}
            />
          </Box>

          {/* Sort Options */}
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', mb: 1 }}>
            Sort By
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={1}>
              {['date', 'title', 'customerName'].map((sortBy) => (
                <Grid item xs={4} key={sortBy}>
                  <Button
                    fullWidth
                    variant={filters.sortBy === sortBy ? "contained" : "outlined"}
                    size="small"
                    onClick={() => handleFilterChange('sortBy', sortBy)}
                    sx={{ borderRadius: 1 }}
                  >
                    {sortBy === 'date' ? 'Date' :
                      sortBy === 'title' ? 'Title' : 'Customer'}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setFilters({
                  search: '',
                  status: 'all',
                  startDate: null,
                  endDate: null,
                  sortBy: 'date'
                });
                showSnackbar('Filters cleared', 'info');
                setOpenFilterDrawer(false);
              }}
              sx={{ borderRadius: 2 }}
            >
              Clear All
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setOpenFilterDrawer(false)}
              sx={{ borderRadius: 2 }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>

      {/* Appointment Form Dialog */}
      <AppointmentForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        editingAppointment={editingAppointment}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onDateChange={handleDateChange}
        onSubmit={handleSubmit}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileApp;