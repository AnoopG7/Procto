import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useExamProctoring } from '../../hooks/useExamProctoring';
import { examAPI, examSessionAPI } from '../../lib/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  LinearProgress,
  Tabs,
  Tab,
  Stack,
  Paper,
  Chip,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
  IconButton,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Badge,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  CameraAlt as CameraIcon,
  Warning as AlertTriangleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Flag as FlagIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  CircleOutlined as Loader2Icon,
  Error as AlertCircleIcon,
  Visibility as EyeIcon,
  Description as FileTextIcon,
  Help as HelpCircleIcon,
  ArrowBack as ArrowLeftIcon,
  Fullscreen as Maximize2Icon
} from '@mui/icons-material';

const MCQQuestion = ({ question, answer, onAnswerChange }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom>{question.questionText}</Typography>
    
    <RadioGroup 
      value={answer || ""} 
      onChange={(e) => onAnswerChange(e.target.value)}
    >
      <Stack spacing={1}>
        {question.options?.map((option, index) => (
          <Paper 
            key={index} 
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <FormControlLabel 
              value={option}
              control={<Radio />}
              label={option}
              id={`option-${question._id}-${index}`}
              sx={{ width: '100%', ml: 0.5, mr: 0.5 }}
            />
          </Paper>
        ))}
      </Stack>
    </RadioGroup>
  </Box>
);

// Essay Question Component
const EssayQuestion = ({ question, answer, onAnswerChange }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom>{question.questionText}</Typography>
    {question.description && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {question.description}
      </Typography>
    )}
    <TextField
      value={answer || ''}
      onChange={(e) => onAnswerChange(e.target.value)}
      placeholder="Type your answer here..."
      multiline
      rows={4}
      variant="outlined"
      fullWidth
      sx={{
        bgcolor: 'background.paper',
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
          }
        }
      }}
    />
  </Box>
);

// Multiple Answer Question Component
const MultipleAnswerQuestion = ({ question, answer = [], onAnswerChange }) => {
  const handleCheckboxChange = (option) => {
    if (answer.includes(option)) {
      onAnswerChange(answer.filter(item => item !== option));
    } else {
      onAnswerChange([...answer, option]);
    }
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>{question.questionText}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select all that apply
      </Typography>
      <Stack spacing={1}>
        {question.options?.map((option, index) => (
          <Paper 
            key={index} 
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
            onClick={() => handleCheckboxChange(option)}
          >
            <FormControlLabel 
              control={
                <Checkbox 
                  id={`option-${question._id}-${index}`}
                  checked={answer.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
              }
              label={option}
              sx={{ width: '100%', ml: 0.5, mr: 0.5 }}
            />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

// File Upload Question Component
const FileUploadQuestion = ({ question, answer, onAnswerChange }) => {
  const [fileName, setFileName] = useState(answer?.name || '');
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onAnswerChange(file);
    }
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>{question.questionText}</Typography>
      {question.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {question.description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          component="label"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: 140,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'action.hover',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'background.default'
            },
            transition: 'background-color 0.2s'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 2 }}>
            <Box 
              component={FileTextIcon} 
              sx={{ 
                fontSize: 40, 
                mb: 1, 
                color: 'text.secondary' 
              }} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 'bold' }}>Click to upload</Box> or drag and drop
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PDF, DOCX, or image files
            </Typography>
          </Box>
          <input 
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
            accept=".pdf,.docx,.png,.jpg,.jpeg" 
          />
        </Box>
      </Box>
      {fileName && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1, 
          mt: 2,
          bgcolor: 'primary.lighter',
          color: 'primary.main',
          borderRadius: 1
        }}>
          <CheckCircleIcon sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body2" fontWeight="medium">
            File uploaded: {fileName}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Main Exam Interface Component
const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(60 * 60); // seconds
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  
  const {
    violations, 
    isFaceDetected, 
    multipleFacesDetected, 
    noFaceDetected,
    startProctoring,
    stopProctoring
  } = useExamProctoring(webcamRef);

  // Mock questions for development
  const mockExam = {
    _id: 'mock-exam-id',
    title: 'Sample Examination',
    description: 'This is a sample exam for testing purposes.',
    duration: 60, // in minutes
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    questions: [
      {
        _id: 'q1',
        questionText: 'What is the capital of France?',
        type: 'mcq',
        options: ['London', 'Paris', 'Berlin', 'Rome'],
        correctAnswer: 'Paris',
        points: 5
      },
      {
        _id: 'q2',
        questionText: 'Describe the water cycle and its importance to Earth\'s ecosystems.',
        type: 'essay',
        points: 15
      },
      {
        _id: 'q3',
        questionText: 'Which of the following are primary colors?',
        type: 'multiple_answer',
        options: ['Red', 'Green', 'Blue', 'Yellow', 'Purple'],
        correctAnswer: ['Red', 'Blue', 'Yellow'],
        points: 5
      },
      {
        _id: 'q4',
        questionText: 'Upload your completed assignment.',
        type: 'file_upload',
        description: 'Please upload your assignment in PDF format.',
        points: 20
      }
    ]
  };

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        
        // In a real application, uncomment this and remove the mock data
        /*
        const response = await examAPI.getExam(examId);
        setExam(response.data.exam);
        setRemainingTime(response.data.exam.duration * 60);
        */
        
        // Using mock data for development
        setTimeout(() => {
          setExam(mockExam);
          setRemainingTime(mockExam.duration * 60);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError('Failed to load exam. Please try again.');
        console.error('Error fetching exam:', err);
        setLoading(false);
      }
    };

    fetchExam();
    
    return () => {
      // Cleanup
      stopProctoring();
    };
  }, [examId]);

  // Start proctoring when exam is loaded
  useEffect(() => {
    if (exam && !loading && webcamRef.current) {
      startProctoring(webcamRef);
    }
  }, [exam, loading, webcamRef]);

  // Timer effect
  useEffect(() => {
    if (!exam || loading || examSubmitted) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, loading, examSubmitted]);

  // Handle proctoring warnings
  useEffect(() => {
    if (multipleFacesDetected) {
      addWarning('Multiple faces detected. Please ensure only you are visible.');
    }
    
    if (noFaceDetected) {
      addWarning('No face detected. Please ensure your face is visible.');
    }
  }, [multipleFacesDetected, noFaceDetected]);

  const addWarning = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setWarnings(prev => [...prev, { message, timestamp }]);
  };

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [exam.questions[currentQuestion]._id]: value
    }));
  };

  const navigateQuestion = (direction) => {
    if (direction === 'next' && currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const toggleFlagQuestion = () => {
    const questionId = exam.questions[currentQuestion]._id;
    
    if (flaggedQuestions.includes(questionId)) {
      setFlaggedQuestions(flaggedQuestions.filter(id => id !== questionId));
    } else {
      setFlaggedQuestions([...flaggedQuestions, questionId]);
    }
  };

  const handleSubmitExam = async () => {
    setExamSubmitted(true);
    
    try {
      // In a real application, uncomment this
      /*
      await examSessionAPI.submitExam(examId, {
        answers,
        warnings
      });
      */
      
      // Navigate to results or dashboard after submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (err) {
      setError('Failed to submit exam. Please try again.');
      setExamSubmitted(false);
      console.error('Error submitting exam:', err);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (!exam) return 0;
    
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / exam.totalQuestions) * 100);
  };

  const renderQuestion = (question) => {
    const answer = answers[question._id];
    
    switch (question.type) {
      case 'mcq':
        return <MCQQuestion question={question} answer={answer} onAnswerChange={handleAnswerChange} />;
      case 'essay':
        return <EssayQuestion question={question} answer={answer} onAnswerChange={handleAnswerChange} />;
      case 'multiple_answer':
        return <MultipleAnswerQuestion question={question} answer={answer} onAnswerChange={handleAnswerChange} />;
      case 'file_upload':
        return <FileUploadQuestion question={question} answer={answer} onAnswerChange={handleAnswerChange} />;
      default:
        return <Typography color="error">Unknown question type</Typography>;
    }
  };

  // Navigation functions for question UI

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    
    setFullscreen(!fullscreen);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !exam) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (examSubmitted) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Exam Submitted Successfully
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for completing the exam. Your answers have been recorded.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You will be redirected to your dashboard shortly...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box 
        sx={{ 
          bgcolor: 'background.paper', 
          boxShadow: 1,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          p: 1
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <IconButton onClick={() => navigate('/dashboard')}>
                <ArrowLeftIcon />
              </IconButton>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" noWrap>
                {exam?.title}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                icon={<ClockIcon />}
                label={formatTime(remainingTime)}
                color={remainingTime < 300 ? 'error' : remainingTime < 600 ? 'warning' : 'default'}
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <IconButton onClick={toggleFullscreen}>
                <Maximize2Icon />
              </IconButton>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
        <Grid container spacing={3}>
          {/* Left sidebar - Webcam and proctoring info */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <Card sx={{ mb: 3 }}>
                <CardHeader title="Proctoring" />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 1, borderRadius: 2 }}>
                      <Box 
                        sx={{ 
                          position: 'relative',
                          width: '100%',
                          height: 0,
                          paddingBottom: '75%',
                          overflow: 'hidden',
                          borderRadius: 1
                        }}
                      >
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Box>
                  
                  {violations.length > 0 && (
                    <Alert 
                      severity="warning" 
                      icon={<AlertTriangleIcon />}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2">
                        {violations.length} violation{violations.length > 1 ? 's' : ''} detected
                      </Typography>
                    </Alert>
                  )}
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Proctoring Status
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        <CameraIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Camera
                      </Typography>
                      <Chip 
                        label="Active" 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              
              {/* Progress card */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress()} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {Object.keys(answers).length} of {exam?.totalQuestions} questions answered
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          {/* Main content - Questions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                {exam?.questions?.[currentQuestion] && (
                  <>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        Question {currentQuestion + 1} of {exam.totalQuestions}
                      </Typography>
                      <Box>
                        <Tooltip title={flaggedQuestions.includes(exam.questions[currentQuestion]._id) ? 'Unflag Question' : 'Flag Question'}>
                          <IconButton 
                            onClick={toggleFlagQuestion}
                            color={flaggedQuestions.includes(exam.questions[currentQuestion]._id) ? 'warning' : 'default'}
                          >
                            <FlagIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Question Help">
                          <IconButton>
                            <HelpCircleIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Typography variant="body1" gutterBottom>
                      {exam.questions[currentQuestion].questionText}
                    </Typography>
                    
                    {renderQuestion(exam.questions[currentQuestion])}
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        startIcon={<ChevronLeftIcon />}
                        onClick={() => navigateQuestion('prev')}
                        disabled={currentQuestion === 0}
                      >
                        Previous
                      </Button>
                      
                      {currentQuestion < exam.questions.length - 1 ? (
                        <Button
                          variant="contained"
                          endIcon={<ChevronRightIcon />}
                          onClick={() => navigateQuestion('next')}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          endIcon={<SendIcon />}
                          onClick={() => setConfirmDialog(true)}
                        >
                          Submit Exam
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right sidebar - Question navigation */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <Box sx={{ mb: 3 }}>
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                  >
                    <Tab label="Questions" />
                    <Tab label="Instructions" />
                  </Tabs>
                  <Box sx={{ p: 2 }}>
                    {activeTab === 0 ? (
                      <>
                        {/* Question navigation function */}
                        {(() => {
                          const renderQuestionNavigation = () => {
                            if (!exam || !exam.questions) return null;
                            
                            return (
                              <Grid container spacing={1}>
                                {exam.questions.map((q, index) => {
                                  const isAnswered = answers[q._id];
                                  const isFlagged = flaggedQuestions.includes(q._id);
                                  const isCurrent = index === currentQuestion;
                                  
                                  return (
                                    <Grid item xs={3} key={q._id}>
                                      <Tooltip title={isFlagged ? "Flagged Question" : (isAnswered ? "Answered" : "Unanswered")}>
                                        <Button
                                          variant={isCurrent ? "contained" : "outlined"}
                                          color={isFlagged ? "warning" : (isAnswered ? "success" : "primary")}
                                          onClick={() => setCurrentQuestion(index)}
                                          sx={{
                                            minWidth: 'unset',
                                            width: '100%',
                                            height: '36px',
                                            p: 0
                                          }}
                                        >
                                          {index + 1}
                                        </Button>
                                      </Tooltip>
                                    </Grid>
                                  );
                                })}
                              </Grid>
                            );
                          };
                          return renderQuestionNavigation();
                        })()}
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Legend
                          </Typography>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button 
                                variant="contained" 
                                size="small" 
                                sx={{ minWidth: 'auto', width: 30, height: 30 }}
                                disabled
                              >
                                #
                              </Button>
                              <Typography variant="body2">Current question</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button 
                                variant="outlined" 
                                color="success" 
                                size="small"
                                sx={{ minWidth: 'auto', width: 30, height: 30 }}
                                disabled
                              >
                                #
                              </Button>
                              <Typography variant="body2">Answered</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button 
                                variant="outlined" 
                                color="warning" 
                                size="small"
                                sx={{ minWidth: 'auto', width: 30, height: 30 }}
                                disabled
                              >
                                #
                              </Button>
                              <Typography variant="body2">Flagged for review</Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </>
                    ) : (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Exam Instructions
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Answer all questions to the best of your ability. You can navigate between questions using the navigation panel or the previous/next buttons.
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Flag questions for review if you want to come back to them later. Your exam will be automatically submitted when the time runs out.
                        </Typography>
                        <Typography variant="body2" paragraph>
                          You must keep your camera on during the entire exam. Any suspicious activity will be flagged.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
              
              <Button
                variant="contained"
                color="error"
                fullWidth
                startIcon={<SendIcon />}
                onClick={() => setConfirmDialog(true)}
              >
                Submit Exam
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* Submit Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          Submit Exam?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit your exam? 
            {Object.keys(answers).length < exam?.questions.length && (
              <Box component="span" sx={{ color: 'error.main' }}>
                {' '}You have only answered {Object.keys(answers).length} out of {exam?.questions.length} questions.
              </Box>
            )}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Unanswered Questions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {exam?.questions?.map((question, index) => (
                !answers[question.id] && (
                  <Chip 
                    key={question.id} 
                    label={`Q${index + 1}`} 
                    size="small" 
                    color="warning"
                    onClick={() => {
                      setCurrentQuestion(index);
                      setConfirmDialog(false);
                    }}
                  />
                )
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmitExam} color="error" variant="contained">
            Yes, Submit Exam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamInterface;

