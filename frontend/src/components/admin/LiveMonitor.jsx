import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examSessionAPI } from '../../lib/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  Alert,
  IconButton,
  Stack,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowLeftIcon,
  CameraAlt as CameraIcon,
  Mic as MicIcon,
  Visibility as EyeIcon,
  Warning as AlertTriangleIcon,
  AccessTime as ClockIcon,
  Group as UsersIcon,
  Timeline as ActivityIcon,
  Download as DownloadIcon,
  Flag as FlagIcon,
  Security as ShieldIcon
} from '@mui/icons-material';

const LiveMonitor = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  
  const intervalRef = useRef(null);
  const [confirmEndDialog, setConfirmEndDialog] = useState(false);
  const [confirmFlagDialog, setConfirmFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  
  useEffect(() => {
    fetchSessionData();
    
    // Set up periodic refresh
    intervalRef.current = setInterval(() => {
      fetchSessionData();
    }, refreshInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId, refreshInterval]);
  
  const fetchSessionData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the API
      // const response = await examSessionAPI.getSessionById(sessionId);
      // setSession(response.data);
      
      // Simulated response for demo
      const mockSession = {
        id: sessionId,
        examId: 'exam-123',
        examTitle: 'Midterm Exam',
        student: {
          id: 'student-456',
          name: 'John Doe',
          email: 'john@example.com'
        },
        startTime: new Date(Date.now() - 1000000).toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'active',
        progress: 40, // percentage
        currentQuestion: 4,
        totalQuestions: 10,
        violations: [
          {
            id: 'v1',
            type: 'face_not_visible',
            timestamp: new Date(Date.now() - 500000).toISOString(),
            description: 'Face not detected in frame',
            screenshot: 'https://via.placeholder.com/150',
            resolved: false
          },
          {
            id: 'v2',
            type: 'multiple_faces',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            description: 'Multiple faces detected in frame',
            screenshot: 'https://via.placeholder.com/150',
            resolved: true
          }
        ],
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
      };
      
      setSession(mockSession);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Failed to load session data. Please try again.');
      setLoading(false);
    }
  };
  
  const handleEndSession = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would call the API
      // await examSessionAPI.endSession(sessionId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfirmEndDialog(false);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error ending session:', err);
      setError('Failed to end session. Please try again.');
      setLoading(false);
    }
  };
  
  const handleFlagSession = async () => {
    if (!flagReason.trim()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, this would call the API
      // await examSessionAPI.flagSession(sessionId, { reason: flagReason });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update session locally
      setSession(prev => ({
        ...prev,
        status: 'flagged'
      }));
      
      setConfirmFlagDialog(false);
      setFlagReason('');
      setLoading(false);
    } catch (err) {
      console.error('Error flagging session:', err);
      setError('Failed to flag session. Please try again.');
      setLoading(false);
    }
  };
  
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  const calculateTimeRemaining = () => {
    if (!session) return { hours: 0, minutes: 0 };
    
    const endTime = new Date(session.endTime);
    const now = new Date();
    const diffMs = endTime - now;
    
    if (diffMs <= 0) {
      return { hours: 0, minutes: 0 };
    }
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };
  
  const timeRemaining = calculateTimeRemaining();
  
  if (loading && !session) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }
  
  if (error && !session) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/admin/dashboard')}>
              Return to Dashboard
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/admin/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowLeftIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Live Exam Monitoring
          </Typography>
        </Box>
        
        {loading && session && (
          <LinearProgress sx={{ mb: 3 }} />
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {session && (
          <>
            {/* Session Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      {session.examTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Student: {session.student.name} ({session.student.email})
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip
                        label={session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        color={
                          session.status === 'active' ? 'success' :
                          session.status === 'flagged' ? 'error' :
                          'default'
                        }
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        Started at {formatTime(session.startTime)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <ClockIcon color="primary" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Time Remaining
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {timeRemaining.hours}h {timeRemaining.minutes}m
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <ActivityIcon color="primary" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {session.progress}%
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <AlertTriangleIcon color={session.violations.filter(v => !v.resolved).length > 0 ? "error" : "disabled"} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Active Violations
                          </Typography>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight="medium"
                            color={session.violations.filter(v => !v.resolved).length > 0 ? "error.main" : "inherit"}
                          >
                            {session.violations.filter(v => !v.resolved).length}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <EyeIcon color="primary" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Current Question
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {session.currentQuestion} / {session.totalQuestions}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Main Content */}
            <Grid container spacing={3}>
              {/* Video Feed */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Live Webcam Feed" />
                  <CardContent>
                    <Box 
                      sx={{
                        position: 'relative',
                        bgcolor: 'black',
                        height: 0,
                        paddingTop: '56.25%' // 16:9 aspect ratio
                      }}
                    >
                      {session.videoUrl ? (
                        <Box
                          component="video"
                          autoPlay
                          muted
                          loop
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          src={session.videoUrl}
                        />
                      ) : (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 2
                          }}
                        >
                          <CameraIcon sx={{ fontSize: 48, color: 'grey.500' }} />
                          <Typography variant="body1" color="grey.500">
                            Video feed not available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="warning"
                        startIcon={<FlagIcon />}
                        onClick={() => setConfirmFlagDialog(true)}
                        disabled={session.status === 'flagged'}
                      >
                        Flag Session
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<ShieldIcon />}
                        onClick={() => setConfirmEndDialog(true)}
                      >
                        End Session
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Violations List */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader title="Violations" />
                  <Divider />
                  <CardContent sx={{ flex: 1, overflow: 'auto' }}>
                    {session.violations.length === 0 ? (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexDirection: 'column',
                          height: '100%',
                          py: 4
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'success.light', mb: 2 }}>
                          <ShieldIcon />
                        </Avatar>
                        <Typography variant="body1">
                          No violations detected
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Session is proceeding normally
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ px: 0 }}>
                        {session.violations.map((violation) => (
                          <Paper 
                            key={violation.id}
                            variant="outlined"
                            sx={{ 
                              mb: 2, 
                              p: 2,
                              bgcolor: violation.resolved ? 'background.default' : 'error.lightest',
                              borderColor: violation.resolved ? 'divider' : 'error.light'
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: violation.resolved ? 'action.selected' : 'error.light'
                                  }}
                                >
                                  {violation.type.includes('face') ? 
                                    <CameraIcon /> : 
                                    <AlertTriangleIcon />
                                  }
                                </Avatar>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  {violation.type.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {violation.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {formatTime(violation.timestamp)}
                                </Typography>
                                
                                {violation.screenshot && (
                                  <Box 
                                    component="img"
                                    src={violation.screenshot}
                                    alt="Violation screenshot"
                                    sx={{ 
                                      mt: 1,
                                      width: '100%',
                                      height: 100,
                                      objectFit: 'cover',
                                      borderRadius: 1
                                    }}
                                  />
                                )}
                                
                                {!violation.resolved && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    sx={{ mt: 1 }}
                                  >
                                    Mark as Resolved
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
      
      {/* Flag Session Dialog */}
      <Dialog open={confirmFlagDialog} onClose={() => setConfirmFlagDialog(false)}>
        <DialogTitle>Flag Exam Session</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Flagging this session will mark it for review. Please provide a reason for flagging.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for flagging"
            fullWidth
            multiline
            rows={3}
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmFlagDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleFlagSession} 
            color="warning"
            variant="contained"
            disabled={!flagReason.trim()}
          >
            Flag Session
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* End Session Dialog */}
      <Dialog open={confirmEndDialog} onClose={() => setConfirmEndDialog(false)}>
        <DialogTitle>End Exam Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end this exam session? This action cannot be undone.
            The student's current progress will be saved and the exam will be marked as incomplete.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEndDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleEndSession} 
            color="error"
            variant="contained"
          >
            End Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveMonitor;

