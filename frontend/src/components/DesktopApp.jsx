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
  Checkbox,
  InputAdornment,
  CircularProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  TextField,
  Tooltip,
  Chip,
  LinearProgress,
  Menu,
  Avatar,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Import components and API
import AppointmentForm from './common/AppointmentForm';
import AppointmentCard from './common/AppointmentCard';
import StatsPanel from './common/StatsPanel';
import api from '../api';

const DesktopApp = ({ user, onLogout, onNavigateToProfile }) => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, cancelled: 0, completed: 0, today: 0 });
  const [viewMode, setViewMode] = useState('table');
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Filter and search state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    startDate: null,
    endDate: null,
    sortBy: 'date',
    sortOrder: 'desc'
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
    if (user) {
      fetchAppointments();
      fetchStats();
    }
  }, [filters, pagination.page, user]);

  const fetchAppointments = async () => {
    if (!user) return;

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

      const response = await api.get('/appointments', { params });
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
    if (!user) return;

    try {
      const response = await api.get('/appointments/stats');
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
        await api.put(`/appointments/${editingAppointment.id}`, formData);
        showSnackbar('Appointment updated successfully', 'success');
      } else {
        await api.post('/appointments', formData);
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
        await api.delete(`/appointments/${id}`);
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
      await api.post(`/appointments/${id}/cancel`);
      showSnackbar('Appointment cancelled successfully', 'success');
      fetchAppointments();
      fetchStats();
    } catch (error) {
      showSnackbar('Failed to cancel appointment', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.post(`/appointments/${id}/complete`);
      showSnackbar('Appointment marked as completed', 'success');
      fetchAppointments();
      fetchStats();
    } catch (error) {
      showSnackbar('Failed to complete appointment', 'error');
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedAppointments.length === 0) {
      showSnackbar('No appointments selected', 'warning');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedAppointments.length} appointment(s)?`)) {
      try {
        await api.post('/appointments/bulk', {
          appointmentIds: selectedAppointments,
          action: 'delete'
        });
        showSnackbar(`${selectedAppointments.length} appointment(s) deleted successfully`, 'success');
        setSelectedAppointments([]);
        fetchAppointments();
        fetchStats();
      } catch (error) {
        showSnackbar('Failed to delete appointments', 'error');
      }
    }
  };

  const handleBulkCancel = async () => {
    if (selectedAppointments.length === 0) {
      showSnackbar('No appointments selected', 'warning');
      return;
    }

    try {
      await api.post('/appointments/bulk', {
        appointmentIds: selectedAppointments,
        action: 'cancel'
      });
      showSnackbar(`${selectedAppointments.length} appointment(s) cancelled successfully`, 'success');
      setSelectedAppointments([]);
      fetchAppointments();
      fetchStats();
    } catch (error) {
      showSnackbar('Failed to cancel appointments', 'error');
    }
  };

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedAppointments(appointments.map(app => app.id));
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleSelectAppointment = (id) => {
    setSelectedAppointments(prev => {
      if (prev.includes(id)) {
        return prev.filter(appId => appId !== id);
      } else {
        return [...prev, id];
      }
    });
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

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Date', 'Time', 'Customer', 'Email', 'Status', 'Duration'],
      ...appointments.map(app => [
        app.id,
        app.title,
        app.date,
        app.time,
        app.customerName,
        app.customerEmail,
        app.status,
        `${app.duration} min`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showSnackbar('Appointments exported successfully', 'success');
  };

  // Get status color for chips
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  // User menu handlers
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  const handleLogoutClick = () => {
    handleUserMenuClose();
    if (onLogout) {
      onLogout();
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Please login to access appointments</Typography>
      </Box>
    );
  }

  return (
    <div className="App">
      {/* Header */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
            onClick={() => setOpenFilterDrawer(!openFilterDrawer)}
          >
            <MenuIcon />
          </IconButton>

          <CalendarIcon sx={{ mr: 2 }} />

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Appointment Scheduler
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton color="inherit" onClick={fetchAppointments}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <IconButton
              onClick={handleUserMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200
                }
              }}
            >
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <AccountIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutClick}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Left Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={openFilterDrawer}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            marginTop: '64px',
            height: 'calc(100% - 64px)',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)'
          },
        }}
      >
        <Toolbar />

        <Box sx={{ p: 3 }}>
          {/* User Info */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  {user.fullName || user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user.username}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<AccountIcon />}
              onClick={handleProfileClick}
            >
              View Profile
            </Button>
          </Paper>

          {/* Stats Panel */}
          <StatsPanel stats={stats} />

          {/* Search Box */}
          <TextField
            fullWidth
            placeholder="Search appointments..."
            variant="outlined"
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
            sx={{ mb: 3 }}
          />

          {/* Status Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filters.status}
              label="Status Filter"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
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
                  size: 'small',
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
                  size: 'small',
                  fullWidth: true
                }
              }}
            />
          </Box>

          {/* View Mode Toggle */}
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', mb: 1 }}>
            View Mode
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('table')}
              fullWidth
            >
              Table View
            </Button>
            <Button
              variant={viewMode === 'card' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('card')}
              fullWidth
            >
              Card View
            </Button>
          </Box>

          {/* Quick Actions */}
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', mb: 1 }}>
            Quick Actions
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              fullWidth
            >
              Export CSV
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              fullWidth
            >
              Print
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setFilters({
                  search: '',
                  status: 'all',
                  startDate: null,
                  endDate: null,
                  sortBy: 'date',
                  sortOrder: 'desc'
                });
                showSnackbar('Filters cleared', 'info');
              }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: openFilterDrawer ? '320px' : 0,
          marginTop: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f5f5f5',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Container maxWidth="xl" disableGutters>
          {/* Top Action Bar */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                  My Appointments
                  <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 2 }}>
                    {pagination.total} total appointments
                  </Typography>
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                {selectedAppointments.length > 0 && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleBulkDelete}
                    >
                      Delete ({selectedAppointments.length})
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<CancelIcon />}
                      onClick={handleBulkCancel}
                    >
                      Cancel ({selectedAppointments.length})
                    </Button>
                  </>
                )}

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    resetForm();
                    setOpenDialog(true);
                  }}
                >
                  New Appointment
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Loading Indicator */}
          {loading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
            </Box>
          )}

          {/* Content based on view mode */}
          {viewMode === 'table' ? (
            // Table View
            <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
              {appointments.length === 0 && !loading ? (
                <Box sx={{ p: 8, textAlign: 'center' }}>
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
                  >
                    Create Appointment
                  </Button>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={selectedAppointments.length > 0 && selectedAppointments.length < appointments.length}
                              checked={appointments.length > 0 && selectedAppointments.length === appointments.length}
                              onChange={handleSelectAll}
                            />
                          </TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Date & Time</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow
                            key={appointment.id}
                            hover
                            selected={selectedAppointments.includes(appointment.id)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedAppointments.includes(appointment.id)}
                                onChange={() => handleSelectAppointment(appointment.id)}
                              />
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {appointment.title}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2">
                                {dayjs(appointment.date).format('MMM DD, YYYY')} at {appointment.time}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2">
                                {appointment.customerName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {appointment.customerEmail}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2">
                                {appointment.duration} min
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={appointment.status.toUpperCase()}
                                color={getStatusColor(appointment.status)}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>

                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEdit(appointment)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                {appointment.status === 'scheduled' && (
                                  <>
                                    <Tooltip title="Mark as Complete">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => handleComplete(appointment.id)}
                                      >
                                        <CheckCircleIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Cancel">
                                      <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={() => handleCancel(appointment.id)}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}

                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(appointment.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                      <Pagination
                        count={pagination.total_pages}
                        page={pagination.page}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </Paper>
          ) : (
            // Card View
            <Grid container spacing={3}>
              {appointments.length === 0 && !loading ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
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
                    >
                      Create Appointment
                    </Button>
                  </Paper>
                </Grid>
              ) : (
                appointments.map((appointment) => (
                  <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                    <AppointmentCard
                      appointment={appointment}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onCancel={handleCancel}
                      onComplete={handleComplete}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {/* Pagination for card view */}
          {viewMode === 'card' && pagination.total_pages > 1 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pagination.total_pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* Additional Info */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {appointments.length} of {pagination.total} appointments
            </Typography>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={pagination.per_page}
                onChange={(e) => setPagination(prev => ({ ...prev, per_page: e.target.value, page: 1 }))}
              >
                <MenuItem value={5}>5 per page</MenuItem>
                <MenuItem value={10}>10 per page</MenuItem>
                <MenuItem value={25}>25 per page</MenuItem>
                <MenuItem value={50}>50 per page</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Container>
      </Box>

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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
    </div>
  );
};

export default DesktopApp;