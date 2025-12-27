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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Cancel as CancelIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/appointments';

function App() {
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterStatus, setFilterStatus] = useState('all');

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: '09:00',
    duration: 60,
    customerName: '',
    customerEmail: '',
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(API_URL);
      setAppointments(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch appointments', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date ? date.format('YYYY-MM-DD') : ''
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingAppointment) {
        await axios.put(`${API_URL}/${editingAppointment.id}`, formData);
        showSnackbar('Appointment updated successfully', 'success');
      } else {
        await axios.post(API_URL, formData);
        showSnackbar('Appointment created successfully', 'success');
      }
      setOpenDialog(false);
      resetForm();
      fetchAppointments();
    } catch (error) {
      showSnackbar('Operation failed', 'error');
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
        await axios.delete(`${API_URL}/${id}`);
        showSnackbar('Appointment deleted successfully', 'success');
        fetchAppointments();
      } catch (error) {
        showSnackbar('Failed to delete appointment', 'error');
      }
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.post(`${API_URL}/${id}/cancel`);
      showSnackbar('Appointment cancelled successfully', 'success');
      fetchAppointments();
    } catch (error) {
      showSnackbar('Failed to cancel appointment', 'error');
    }
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
    setEditingAppointment(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(app => app.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Appointment Scheduler
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Appointments</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

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
          </Box>

          <Grid container spacing={3}>
            {filteredAppointments.map((appointment) => (
              <Grid item xs={12} md={6} lg={4} key={appointment.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {appointment.title}
                      </Typography>
                      <Chip
                        label={appointment.status.toUpperCase()}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </Box>

                    <Typography color="text.secondary" gutterBottom>
                      {dayjs(appointment.date).format('MMM DD, YYYY')} at {appointment.time}
                    </Typography>

                    {appointment.description && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {appointment.description}
                      </Typography>
                    )}

                    <Typography variant="body2">
                      <strong>Customer:</strong> {appointment.customerName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {appointment.customerEmail}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {appointment.duration} minutes
                    </Typography>
                  </CardContent>

                  <CardActions>
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(appointment)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancel(appointment.id)}
                          color="warning"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(appointment.id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredAppointments.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No appointments found
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => {
                  resetForm();
                  setOpenDialog(true);
                }}
              >
                Create your first appointment
              </Button>
            </Paper>
          )}
        </Container>

        {/* Add/Edit Appointment Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker
                    label="Date"
                    value={dayjs(formData.date)}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
              />

              <TextField
                fullWidth
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Customer Email"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingAppointment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
}

export default App;