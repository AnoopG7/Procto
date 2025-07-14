import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useExamProctoring } from '../../hooks/useExamProctoring';
import { useFaceDetection } from '../../hooks/useFaceDetection';
import { useAudioMonitoring } from '../../hooks/useAudioMonitoring';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Tooltip
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  CameraAlt as CameraIcon,
  Warning as AlertTriangleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Send as SendIcon,
  Visibility as EyeIcon,
  Mic as MicIcon,
  Security as ShieldIcon,
  Group as UsersIcon,
  Timeline as ActivityIcon
} from '@mui/icons-material';

// Question Components using MUI
const MCQQuestion = ({ question, answer, onAnswerChange }) => (
  <Box sx={{ mt: 2 }}>
    <FormControl component="fieldset" fullWidth>
      <RadioGroup
        value={answer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
      >
        {question.options?.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option}
            control={<Radio />}
            label={option}
            sx={{ mb: 1 }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  </Box>
);

const TrueFalseQuestion = ({ question, answer, onAnswerChange }) => (
  <Box sx={{ mt: 2 }}>
    <FormControl component="fieldset">
      <RadioGroup
        value={answer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
      >
        <FormControlLabel value="True" control={<Radio />} label="True" sx={{ mb: 1 }} />
        <FormControlLabel value="False" control={<Radio />} label="False" />
      </RadioGroup>
    </FormControl>
  </Box>
);

const ShortAnswerQuestion = ({ answer, onAnswerChange }) => (
  <Box sx={{ mt: 2 }}>
    <TextField
      fullWidth
      multiline
      rows={4}
      placeholder="Type your answer here..."
      value={answer || ''}
      onChange={(e) => onAnswerChange(e.target.value)}
      variant="outlined"
    />
  </Box>
);

const EnhancedExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const microphoneRef = useRef(null);
  
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  
  // Proctoring hooks
  const { violations, startProctoring, stopProctoring } = useExamProctoring(webcamRef);
  const { isFaceDetected } = useFaceDetection(webcamRef);
  const { audioLevel } = useAudioMonitoring(microphoneRef);

  // Mock exam data for demo
  const mockExam = {
    id: examId,
    title: 'Enhanced Interactive Exam',
    duration: 60, // minutes
    totalQuestions: 10,
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      questionText: `Question ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit?`,
      type: i % 3 === 0 ? 'multiple_choice' : i % 3 === 1 ? 'true_false' : 'short_answer',
      options: i % 3 === 0 
        ? ['Option A', 'Option B', 'Option C', 'Option D'] 
        : i % 3 === 1 
          ? ['True', 'False'] 
          : null,
      points: 10,
      hints: ['Consider the relationship between variables', 'Review section 3.2 in your textbook']
    }))
  };

  // Initialize exam data and proctoring
  useEffect(() => {
    fetchExam();
    
    return () => {
      stopProctoring();
    };
  }, [examId]);
  
  // Start proctoring when exam is loaded
  useEffect(() => {
    if (exam && !loading && webcamRef.current) {
      startProctoring();
    }
  }, [exam, loading, webcamRef]);
  
  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (timeLeft !== null && timeLeft > 0 && !examSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !examSubmitted) {
      handleSubmit();
    }
    
    return () => clearInterval(timer);
  }, [timeLeft, examSubmitted]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would fetch from the API
      // const response = await examAPI.getExamById(examId);
      // setExam(response.data);
      
      // Using mock data for demo
      setExam(mockExam);
      setTimeLeft(mockExam.duration * 60); // Convert minutes to seconds
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('Failed to load exam data. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handlePrevQuestion = () => {
    setCurrentQuestion(prev => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => Math.min(exam.totalQuestions - 1, prev + 1));
  };

  const toggleFlagged = (questionId) => {
    setFlagged(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmit = async () => {
    if (!confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, this would submit to the API
      // const response = await examAPI.submitExam(examId, {
      //   answers,
      //   timeSpent: exam.duration * 60 - timeLeft
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stop proctoring
      stopProctoring();
      
      setExamSubmitted(true);
      setLoading(false);
      
      // Navigate to results page
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError('Failed to submit exam. Please try again.');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAiAssistantToggle = () => {
    setShowAIAssistant(prev => !prev);
  };

  const askAiAssistant = async () => {
    if (!aiQuestion.trim()) return;
    
    setAiLoading(true);
    
    try {
      // In a real app, this would call an AI API
      // const response = await aiAPI.askQuestion(aiQuestion, currentQuestion);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate AI response
      const responses = [
        "To solve this problem, first identify the key variables mentioned in the question. Then consider how they relate to each other based on the principles covered in chapter 3.",
        "This question is asking about the relationship between cause and effect. Consider using a step-by-step approach to break down the complex interactions.",
        "The answer can be found by applying the formula discussed in lecture 4. Remember to convert units appropriately before calculation.",
        "This question tests your understanding of core concepts. Try to recall the definition provided in the textbook and apply it to this specific scenario."
      ];
      
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setAiResponse("I'm sorry, I couldn't generate a helpful response at this time. Please try rephrasing your question.");
    } finally {
      setAiLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [hours, minutes, secs]
      .map(v => v < 10 ? `0${v}` : v)
      .join(':');
  };

  const calculateProgress = () => {
    if (!exam) return 0;
    
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / exam.totalQuestions) * 100);
  };

  const renderQuestion = (question) => {
    if (!question) return null;
    
    switch(question.type) {
      case 'multiple_choice':
        return (
          <MCQQuestion
            question={question}
            answer={answers[question.id]}
            onAnswerChange={(value) => handleAnswerChange(question.id, value)}
          />
        );
        
      case 'true_false':
        return (
          <TrueFalseQuestion
            question={question}
            answer={answers[question.id]}
            onAnswerChange={(value) => handleAnswerChange(question.id, value)}
          />
        );
        
      case 'short_answer':
        return (
          <ShortAnswerQuestion
            answer={answers[question.id]}
            onAnswerChange={(value) => handleAnswerChange(question.id, value)}
          />
        );
        
      default:
        return null;
    }
  };

  const renderQuestionNavigation = () => {
    if (!exam) return null;
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Question Navigation
        </Typography>
        
        <Grid container spacing={1}>
          {Array.from({ length: exam.totalQuestions }, (_, i) => (
            <Grid item key={i}>
              <Tooltip title={`Question ${i + 1} ${flagged[i + 1] ? '(Flagged)' : ''}`}>
                <Button
                  variant={currentQuestion === i ? 'contained' : 'outlined'}
                  color={flagged[i + 1] ? 'warning' : answers[i + 1] ? 'success' : 'primary'}
                  size="small"
                  onClick={() => setCurrentQuestion(i)}
                  sx={{ minWidth: 'auto', width: 35, height: 35 }}
                >
                  {i + 1}
                </Button>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderHints = (question) => {
    if (!question?.hints || question.hints.length === 0) return null;
    
    return (
      <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Hints:
        </Typography>
        <List dense>
          {question.hints.map((hint, index) => (
            <ListItem key={index}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <CameraIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={hint} />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  if (loading && !exam) {
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
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              bgcolor: 'success.main', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <SendIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h4" gutterBottom>
              Exam Submitted Successfully
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for completing the enhanced exam experience. Your answers have been recorded.
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
              <Typography variant="h6" noWrap>
                {exam?.title}
              </Typography>
            </Grid>
            <Grid item xs />
            <Grid item>
              <Chip
                icon={<ClockIcon />}
                label={formatTime(timeLeft)}
                color={timeLeft < 300 ? 'error' : timeLeft < 600 ? 'warning' : 'default'}
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <Tooltip title={showAIAssistant ? "Hide AI Assistant" : "Show AI Assistant"}>
                <IconButton onClick={handleAiAssistantToggle} color={showAIAssistant ? "primary" : "default"}>
                  <ShieldIcon />
                </IconButton>
              </Tooltip>
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
                <CardHeader title="Exam Monitor" />
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
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2">
                        {violations.length} violation{violations.length > 1 ? 's' : ''} detected
                      </Typography>
                    </Alert>
                  )}
                  
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
              
              {/* Question navigation */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  {renderQuestionNavigation()}
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Legend
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: 'primary.main', borderRadius: 0.5 }} />
                        <Typography variant="body2">Current question</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 0.5 }} />
                        <Typography variant="body2">Answered</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: 'warning.main', borderRadius: 0.5 }} />
                        <Typography variant="body2">Flagged for review</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          {/* Main content - Questions */}
          <Grid item xs={12} md={showAIAssistant ? 5 : 9}>
            <Card>
              <CardContent>
                {exam?.questions?.[currentQuestion] && (
                  <>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        Question {currentQuestion + 1} of {exam.totalQuestions}
                      </Typography>
                      <IconButton 
                        onClick={() => toggleFlagged(exam.questions[currentQuestion].id)}
                        color={flagged[exam.questions[currentQuestion].id] ? 'warning' : 'default'}
                      >
                        {flagged[exam.questions[currentQuestion].id] ? (
                          <AlertTriangleIcon />
                        ) : (
                          <AlertTriangleIcon color="action" />
                        )}
                      </IconButton>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Typography variant="body1" gutterBottom>
                      {exam.questions[currentQuestion].questionText}
                    </Typography>
                    
                    {renderQuestion(exam.questions[currentQuestion])}
                    
                    {renderHints(exam.questions[currentQuestion])}
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        startIcon={<ChevronLeftIcon />}
                        onClick={handlePrevQuestion}
                        disabled={currentQuestion === 0}
                      >
                        Previous
                      </Button>
                      
                      {currentQuestion < exam.totalQuestions - 1 ? (
                        <Button
                          variant="contained"
                          endIcon={<ChevronRightIcon />}
                          onClick={handleNextQuestion}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          endIcon={<SendIcon />}
                          onClick={() => setConfirmSubmit(true)}
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
          
          {/* AI Assistant sidebar */}
          {showAIAssistant && (
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 80 }}>
                <Card>
                  <CardHeader 
                    title="AI Learning Assistant" 
                    subheader="Get help understanding concepts"
                  />
                  <CardContent>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        The AI Assistant can help explain concepts, but won't provide direct answers to exam questions.
                      </Typography>
                    </Alert>
                    
                    <TextField
                      fullWidth
                      label="Ask a question about concepts"
                      variant="outlined"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      multiline
                      rows={2}
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      variant="contained"
                      onClick={askAiAssistant}
                      disabled={aiLoading || !aiQuestion.trim()}
                      fullWidth
                      sx={{ mb: 3 }}
                    >
                      {aiLoading ? <CircularProgress size={24} /> : "Ask AI Assistant"}
                    </Button>
                    
                    {aiResponse && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          AI Response:
                        </Typography>
                        <Typography variant="body2">
                          {aiResponse}
                        </Typography>
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => setConfirmSubmit(true)}
          >
            Submit Exam
          </Button>
        </Box>
      </Container>
      
      {/* Submit Confirmation Dialog */}
      <Dialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)}>
        <DialogTitle>
          Submit Exam?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit your exam? 
            {Object.keys(answers).length < exam?.totalQuestions && (
              <Box component="span" sx={{ color: 'error.main' }}>
                {' '}You have only answered {Object.keys(answers).length} out of {exam?.totalQuestions} questions.
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
                      setConfirmSubmit(false);
                    }}
                  />
                )
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="error" variant="contained">
            Yes, Submit Exam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedExamInterface;

