import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  List as ListIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const StatsPanel = ({ stats, isMobile = false }) => {
  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      icon: <ListIcon fontSize={isMobile ? "small" : "medium"} />,
      color: 'primary.main',
      bgColor: 'primary.light'
    },
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: <ScheduleIcon fontSize={isMobile ? "small" : "medium"} />,
      color: 'success.main',
      bgColor: 'success.light'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: <CheckCircleIcon fontSize={isMobile ? "small" : "medium"} />,
      color: 'info.main',
      bgColor: 'info.light'
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: <CancelIcon fontSize={isMobile ? "small" : "medium"} />,
      color: 'error.main',
      bgColor: 'error.light'
    },
    {
      label: 'Today',
      value: stats.today,
      icon: <TodayIcon fontSize={isMobile ? "small" : "medium"} />,
      color: 'warning.main',
      bgColor: 'warning.light'
    }
  ];

  // Calculate percentages
  const total = stats.total || 1; // Avoid division by zero
  const scheduledPercent = (stats.scheduled / total) * 100;
  const completedPercent = (stats.completed / total) * 100;
  const cancelledPercent = (stats.cancelled / total) * 100;

  if (isMobile) {
    return (
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TrendingUpIcon color="primary" />
          Statistics
        </Typography>

        <Grid container spacing={2}>
          {statItems.map((stat) => (
            <Grid item xs={4} key={stat.label}>
              <Card
                variant="outlined"
                sx={{
                  textAlign: 'center',
                  bgcolor: stat.bgColor + '10',
                  borderColor: stat.bgColor + '30'
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 1,
                    color: stat.color
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Progress bars for status distribution */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
                Status Distribution
              </Typography>

              {/* Scheduled */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    Scheduled
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {scheduledPercent.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={scheduledPercent}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'success.light',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'success.main'
                    }
                  }}
                />
              </Box>

              {/* Completed */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                    Completed
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {completedPercent.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completedPercent}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'info.light',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'info.main'
                    }
                  }}
                />
              </Box>

              {/* Cancelled */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                    Cancelled
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {cancelledPercent.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={cancelledPercent}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'error.light',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'error.main'
                    }
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  // Desktop version
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        bgcolor: 'primary.main',
        color: 'white',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Typography variant="subtitle2" gutterBottom sx={{
        opacity: 0.9,
        fontWeight: 600,
        letterSpacing: '0.5px',
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <TrendingUpIcon fontSize="small" />
        APPOINTMENT STATISTICS
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {statItems.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }}>
                  {stat.icon}
                </Box>
                <Typography variant="body2">
                  {stat.label}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" fontWeight="bold">
                  {stat.value}
                </Typography>
                {stat.label !== 'Total' && stat.label !== 'Today' && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {((stat.value / total) * 100).toFixed(1)}%
                  </Typography>
                )}
              </Box>
            </Box>

            {index < statItems.length - 1 && (
              <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Status distribution visualization */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
          Status Distribution
        </Typography>
        <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              width: `${scheduledPercent}%`,
              bgcolor: 'success.main',
              transition: 'width 0.3s ease'
            }}
            title={`Scheduled: ${stats.scheduled}`}
          />
          <Box
            sx={{
              width: `${completedPercent}%`,
              bgcolor: 'info.main',
              transition: 'width 0.3s ease'
            }}
            title={`Completed: ${stats.completed}`}
          />
          <Box
            sx={{
              width: `${cancelledPercent}%`,
              bgcolor: 'error.main',
              transition: 'width 0.3s ease'
            }}
            title={`Cancelled: ${stats.cancelled}`}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
            Scheduled
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
            Completed
          </Typography>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
            Cancelled
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Default props
StatsPanel.defaultProps = {
  stats: {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    today: 0
  },
  isMobile: false
};

export default StatsPanel;