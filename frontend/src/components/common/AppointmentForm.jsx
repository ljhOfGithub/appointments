import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    InputAdornment,
    Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
    Info as InfoIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

const AppointmentForm = ({
    open,
    onClose,
    editingAppointment,
    formData,
    formErrors,
    onInputChange,
    onDateChange,
    onSubmit
}) => {
    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Title Field */}
                    <TextField
                        fullWidth
                        label="Appointment Title *"
                        name="title"
                        value={formData.title}
                        onChange={onInputChange}
                        error={!!formErrors.title}
                        helperText={formErrors.title}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <InfoIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Description Field */}
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={onInputChange}
                        multiline
                        rows={3}
                        placeholder="Add any additional details or notes..."
                    />

                    {/* Date and Time Fields */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="Date *"
                                value={formData.date ? dayjs(formData.date) : null}
                                onChange={onDateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!formErrors.date,
                                        helperText: formErrors.date,
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Time *"
                                name="time"
                                type="time"
                                value={formData.time}
                                onChange={onInputChange}
                                error={!!formErrors.time}
                                helperText={formErrors.time}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TimeIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>

                    {/* Duration Field */}
                    <TextField
                        fullWidth
                        label="Duration (minutes) *"
                        name="duration"
                        type="number"
                        value={formData.duration}
                        onChange={onInputChange}
                        error={!!formErrors.duration}
                        helperText={formErrors.duration}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <TimeIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Customer Info Fields */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Customer Name *"
                                name="customerName"
                                value={formData.customerName}
                                onChange={onInputChange}
                                error={!!formErrors.customerName}
                                helperText={formErrors.customerName}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Customer Email *"
                                name="customerEmail"
                                type="email"
                                value={formData.customerEmail}
                                onChange={onInputChange}
                                error={!!formErrors.customerEmail}
                                helperText={formErrors.customerEmail}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <Button
                    onClick={onClose}
                    sx={{ minWidth: 100 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{ minWidth: 120 }}
                >
                    {editingAppointment ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AppointmentForm;