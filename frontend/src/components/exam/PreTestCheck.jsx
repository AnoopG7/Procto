import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  Alert,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Mic as MicIcon,
  Wifi as WifiIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  Warning as AlertTriangleIcon,
  Replay as RotateCcwIcon,
  PlayArrow as PlayIcon,
  Stop as SquareIcon
} from '@mui/icons-material';

const PreTestCheck = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  const [checks, setChecks] = useState({
    camera: { status: 'pending', message: 'Checking camera access...' },
    microphone: { status: 'pending', message: 'Checking microphone access...' },
    network: { status: 'pending', message: 'Testing network connection...' },
    roomScan: { status: 'pending', message: 'Room scan required' }
  });

  const [activeStep, setActiveStep] = useState(0);
  const [roomScanRecording, setRoomScanRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [overallStatus, setOverallStatus] = useState('pending'); // 'pending', 'success', 'error'
  
  useEffect(() => {
    checkCamera();
    checkMicrophone();
    checkNetwork();
  }, []);

  useEffect(() => {
    // Update overall status based on all checks
    const allChecks = Object.values(checks);
    
    if (allChecks.some(check => check.status === 'error')) {
      setOverallStatus('error');
    } else if (allChecks.every(check => check.status === 'success')) {
      setOverallStatus('success');
    } else {
      setOverallStatus('pending');
    }
  }, [checks]);

  const checkCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // If we get here, camera access is granted
      setChecks(prev => ({
        ...prev,
        camera: { status: 'success', message: 'Camera access granted' }
      }));
      
      // Clean up the stream to avoid multiple webcam instances
      stream.getTracks().forEach(track => track.stop());
      
      setActiveStep(1); // Move to next step
    } catch (error) {
      console.error('Camera access error:', error);
      setChecks(prev => ({
        ...prev,
        camera: { 
          status: 'error', 
          message: 'Camera access denied. Please enable camera access and refresh.'
        }
      }));
    }
  };

  const checkMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // If we get here, microphone access is granted
      setChecks(prev => ({
        ...prev,
        microphone: { status: 'success', message: 'Microphone access granted' }
      }));
      
      // Clean up the stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone access error:', error);
      setChecks(prev => ({
        ...prev,
        microphone: { 
          status: 'error', 
          message: 'Microphone access denied. Please enable microphone access and refresh.'
        }
      }));
    }
  };

  const checkNetwork = async () => {
    try {
      // Simulate network check with a simple fetch request
      const startTime = Date.now();
      await fetch('https://www.google.com', { mode: 'no-cors' });
      const endTime = Date.now();
      
      const latency = endTime - startTime;
      
      if (latency < 300) {
        setChecks(prev => ({
          ...prev,
          network: { status: 'success', message: `Network connection good (${latency}ms)` }
        }));
      } else if (latency < 1000) {
        setChecks(prev => ({
          ...prev,
          network: { status: 'warning', message: `Network connection slow (${latency}ms)` }
        }));
      } else {
        setChecks(prev => ({
          ...prev,
          network: { status: 'error', message: `Network connection very slow (${latency}ms)` }
        }));
      }
    } catch (error) {
      console.error('Network check error:', error);
      setChecks(prev => ({
        ...prev,
        network: { 
          status: 'error', 
          message: 'Network connection failed. Please check your internet connection.'
        }
      }));
    }
  };

  const handleStartRoomScan = () => {
    if (!webcamRef.current?.stream) return;
    
    setRoomScanRecording(true);
    setRecordedChunks([]);
    
    const stream = webcamRef.current.stream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
    mediaRecorder.addEventListener('stop', handleStop);
    
    // Start recording with 1 second timeslices
    mediaRecorder.start(1000);
    
    // Automatically stop after 10 seconds
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, 10000);
  };

  const handleStopRoomScan = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks(prev => [...prev, data]);
    }
  };

  const handleStop = () => {
    setRoomScanRecording(false);
    
    // Mark room scan as successful
    setChecks(prev => ({
      ...prev,
      roomScan: { status: 'success', message: 'Room scan completed' }
    }));
    
    setActiveStep(prev => prev + 1);
  };

  const handleNextStep = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleResetStep = () => {
    if (activeStep === 3) {
      setChecks(prev => ({
        ...prev,
        roomScan: { status: 'pending', message: 'Room scan required' }
      }));
    }
    setActiveStep(prev => prev - 1);
  };

  const handleStartExam = () => {
    // Here we would normally upload the room scan video
    // For this demo, we'll just navigate to the exam
    navigate(`/exam/${examId}`);
  };

  const renderStatusIcon = (status) => {
    switch(status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <XCircleIcon color="error" />;
      case 'warning':
        return <AlertTriangleIcon color="warning" />;
      default:
        return null;
    }
  };

  const steps = [
    {
      label: 'System Check',
      description: 'Verifying your camera, microphone, and network connection',
      content: (
        <Grid container spacing={3}>
          {Object.entries(checks).slice(0, 3).map(([key, check]) => (
            <Grid item xs={12} sm={4} key={key}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    {key === 'camera' && <CameraIcon color="primary" />}
                    {key === 'microphone' && <MicIcon color="primary" />}
                    {key === 'network' && <WifiIcon color="primary" />}
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {key}
                    </Typography>
                  </Stack>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {check.status === 'pending' ? (
                      <LinearProgress sx={{ width: '100%' }} />
                    ) : (
                      renderStatusIcon(check.status)
                    )}
                    <Box sx={{ ml: 1, flexGrow: 1 }}>
                      <Typography 
                        variant="body2" 
                        color={
                          check.status === 'success' ? 'success.main' : 
                          check.status === 'error' ? 'error.main' : 
                          check.status === 'warning' ? 'warning.main' : 
                          'text.secondary'
                        }
                      >
                        {check.message}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {check.status === 'error' && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<RotateCcwIcon />}
                      onClick={() => {
                        if (key === 'camera') checkCamera();
                        if (key === 'microphone') checkMicrophone();
                        if (key === 'network') checkNetwork();
                      }}
                      sx={{ mt: 1 }}
                    >
                      Try Again
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ),
    },
    {
      label: 'Room Scan',
      description: 'Perform a 360° scan of your room to verify test conditions',
      content: (
        <Box>
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
          >
            Please slowly rotate your camera to show your entire room and workspace.
            The scan will automatically finish after 10 seconds.
          </Alert>
          
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Webcam
              audio
              ref={webcamRef}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px'
              }}
            />
            
            {roomScanRecording && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'error.main',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                <Box 
                  component="span"
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%',
                    bgcolor: 'white',
                    mr: 1,
                    animation: 'pulse 1s infinite'
                  }}
                />
                Recording
              </Box>
            )}
          </Box>
          
          <Stack direction="row" spacing={2} justifyContent="center">
            {!roomScanRecording ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayIcon />}
                onClick={handleStartRoomScan}
              >
                Start Room Scan
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="error"
                startIcon={<SquareIcon />}
                onClick={handleStopRoomScan}
              >
                Stop Recording
              </Button>
            )}
          </Stack>
        </Box>
      ),
    },
    {
      label: 'Ready to Begin',
      description: 'You\'re all set to start your exam',
      content: (
        <Box>
          <Alert 
            severity="success"
            sx={{ mb: 3 }}
            icon={<CheckCircleIcon />}
          >
            All checks passed successfully. You're ready to begin the exam.
          </Alert>
          
          <Typography variant="body1" paragraph>
            Important reminders before you start:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" paragraph>
              Ensure you have sufficient time to complete the exam. Once started, the timer cannot be paused.
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Keep your camera and microphone on throughout the exam.
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Do not leave the exam page or open other applications.
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              If you experience technical issues, use the Help button in the exam interface.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStartExam}
            >
              Start Exam
            </Button>
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardHeader
          title="Pre-Exam System Check"
          subheader="Complete the following steps before starting your exam"
        />
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="subtitle1">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {step.description}
                  </Typography>
                  
                  {step.content}
                  
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Stack direction="row" spacing={2}>
                      {index > 0 && (
                        <Button
                          onClick={handleResetStep}
                          variant="outlined"
                        >
                          Back
                        </Button>
                      )}
                      
                      {index < steps.length - 1 && 
                       ((index === 0 && !Object.values(checks).slice(0, 3).some(check => check.status === 'error')) ||
                        (index === 1 && checks.roomScan.status === 'success')) && (
                        <Button
                          onClick={handleNextStep}
                          variant="contained"
                        >
                          Continue
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PreTestCheck;

