import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { examAPI } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as ClockIcon,
  Group as UsersIcon,
  MenuBook as BookOpenIcon,
  Logout as LogOutIcon,
  Add as PlusIcon,
  AssignmentTurnedIn as BookOpenCheckIcon,
  EventNote as CalendarClockIcon,
  Person as UserIcon,
  BarChart as BarChartIcon,
  Error as AlertCircleIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await examAPI.getExams();
      setExams(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again later.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredExams = exams.filter(exam => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return new Date(exam.startTime) > new Date();
    if (activeTab === 'completed') return exam.status === 'completed';
    return true;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case 'upcoming':
        return { 
          label: 'Upcoming', 
          color: 'primary',
          variant: 'outlined'
        };
      case 'active':
        return { 
          label: 'Active', 
          color: 'success'
        };
      case 'completed':
        return { 
          label: 'Completed', 
          color: 'default'
        };
      default:
        return { 
          label: status, 
          color: 'default'
        };
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Header/Welcome Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h4" gutterBottom>
                      Welcome back, {user?.firstName || 'Student'}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Here's an overview of your exams and activities
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<LogOutIcon />}
                      onClick={handleLogout}
                    >
                      Log Out
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <BookOpenIcon />
                      </Avatar>
                      <Typography variant="h6">Total Exams</Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="bold">
                      {exams.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.light' }}>
                        <BookOpenCheckIcon />
                      </Avatar>
                      <Typography variant="h6">Completed</Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="bold">
                      {exams.filter(exam => exam.status === 'completed').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.light' }}>
                        <CalendarClockIcon />
                      </Avatar>
                      <Typography variant="h6">Upcoming</Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="bold">
                      {exams.filter(exam => new Date(exam.startTime) > new Date()).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.light' }}>
                        <BarChartIcon />
                      </Avatar>
                      <Typography variant="h6">Average Score</Typography>
                    </Stack>
                    <Typography variant="h3" fontWeight="bold">
                      {exams.length > 0 
                        ? `${Math.round(exams.reduce((acc, exam) => acc + (exam.score || 0), 0) / exams.length)}%` 
                        : 'N/A'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Exams Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="My Exams" 
                action={
                  user?.role === 'teacher' || user?.role === 'admin' ? (
                    <Button
                      variant="contained"
                      startIcon={<PlusIcon />}
                      onClick={() => navigate('/create-exam')}
                    >
                      Create Exam
                    </Button>
                  ) : null
                }
              />
              <Divider />

              {/* Tabs for filtering exams */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="All Exams" value="all" />
                  <Tab label="Upcoming" value="upcoming" />
                  <Tab label="Completed" value="completed" />
                </Tabs>
              </Box>

              <CardContent>
                {loading ? (
                  <Box sx={{ width: '100%', my: 4 }}>
                    <LinearProgress />
                  </Box>
                ) : error ? (
                  <Alert 
                    severity="error" 
                    sx={{ my: 2 }}
                    icon={<AlertCircleIcon />}
                  >
                    {error}
                  </Alert>
                ) : filteredExams.length === 0 ? (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'action.selected', width: 60, height: 60 }}>
                      <SearchIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6">No exams found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeTab === 'all' 
                        ? 'You have no exams scheduled yet.'
                        : activeTab === 'upcoming'
                        ? 'You have no upcoming exams.'
                        : 'You have not completed any exams yet.'
                      }
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {filteredExams.map(exam => {
                      const statusProps = getStatusChipProps(exam.status);
                      return (
                        <Card 
                          key={exam.id} 
                          variant="outlined"
                          sx={{ 
                            '&:hover': { 
                              boxShadow: 2, 
                              cursor: 'pointer' 
                            }
                          }}
                          onClick={() => {
                            if (exam.status === 'active') {
                              navigate(`/exam/${exam.id}/pre-check`);
                            } else if (exam.status === 'completed') {
                              navigate(`/exam/${exam.id}/result`);
                            } else {
                              // Just show details for upcoming exams
                              navigate(`/exam/${exam.id}/details`);
                            }
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={6}>
                                <Typography variant="h6" gutterBottom>
                                  {exam.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {exam.courseName || 'General Exam'}
                                </Typography>
                                <Chip
                                  label={statusProps.label}
                                  color={statusProps.color}
                                  variant={statusProps.variant}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                {exam.score !== undefined && (
                                  <Chip 
                                    label={`Score: ${exam.score}%`} 
                                    color={exam.score >= 70 ? 'success' : 'warning'}
                                    size="small"
                                  />
                                )}
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Stack
                                  direction={{ xs: 'column', md: 'row' }}
                                  spacing={2}
                                  justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon color="action" fontSize="small" />
                                    <Typography variant="body2">
                                      {formatDate(exam.startTime)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ClockIcon color="action" fontSize="small" />
                                    <Typography variant="body2">
                                      {formatTime(exam.startTime)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTime as={ClockIcon} color="action" fontSize="small" />
                                    <Typography variant="body2">
                                      {exam.duration} minutes
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;

