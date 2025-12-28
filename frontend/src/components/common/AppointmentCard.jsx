import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

const AppointmentCard = ({
  appointment,
  onEdit,
  onDelete,
  onCancel,
  onComplete,
  isSelected,
  onSelect,
  showSelect = false
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <TimeIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {appointment.title}
          </Typography>
          <Chip
            icon={getStatusIcon(appointment.status)}
            label={appointment.status.toUpperCase()}
            color={getStatusColor(appointment.status)}
            size="small"
            sx={{ fontWeight: 500, fontSize: '0.7rem' }}
          />
        </Box>

        {/* Description */}
        {appointment.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {appointment.description}
          </Typography>
        )}

        {/* Date and Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <CalendarIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {dayjs(appointment.date).format('MMM DD, YYYY')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
            •
          </Typography>
          <TimeIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {appointment.time}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
            •
          </Typography>
          <Typography variant="body2">
            {appointment.duration} min
          </Typography>
        </Box>

        {/* Customer Info */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {appointment.customerName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {appointment.customerEmail}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        pt: 1,
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {appointment.status === 'scheduled' && (
            <>
              <Tooltip title="Mark as Complete">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => onComplete && onComplete(appointment.id)}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Cancel">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => onCancel && onCancel(appointment.id)}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit && onEdit(appointment)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete && onDelete(appointment.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default AppointmentCard;