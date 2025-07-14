import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// We're not using useAuth directly for now to bypass backend authentication
// import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Error as ErrorIcon,
  Google as GoogleIcon
} from '@mui/icons-material';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      // Temporary bypass - directly navigate to the next page
      setTimeout(() => {
        // Mock user for testing
        localStorage.setItem('user', JSON.stringify({
          id: 'test-user-id',
          firstName: 'Test',
          lastName: 'User',
          email: formData.email,
          role: 'student'
        }));
        localStorage.setItem('token', 'mock-token-for-testing');
        navigate('/dashboard');
      }, 1000); // Add a small delay to simulate loading
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #2563eb, #4f46e5, #7e22ce)',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" color="white" fontWeight={700}>
            Procto
          </Typography>
          <Typography variant="body1" color="white" sx={{ opacity: 0.9, mt: 1 }}>
            Secure Online Exam Proctoring
          </Typography>
        </Box>
        
        <Card elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ height: 4, bgcolor: 'primary.main', background: 'linear-gradient(to right, #2563eb, #4f46e5, #7e22ce)' }} />
          <CardContent sx={{ px: 4, py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" component="h2" fontWeight={600}>
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Log in to your account to continue
              </Typography>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      alignItems: 'center',
                      '& .MuiAlert-icon': {
                        fontSize: 20,
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(formErrors.email)}
                  helperText={formErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    bgcolor: 'grey.50',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    }
                  }}
                />
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" component="label" htmlFor="password" fontWeight={500} color="text.primary">
                      Password
                    </Typography>
                    <Link 
                      to="/forgot-password"
                      style={{ 
                        fontSize: '0.75rem', 
                        color: '#2563eb',
                        textDecoration: 'none', 
                        fontWeight: 500
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={formData.password}
                    onChange={handleChange}
                    error={Boolean(formErrors.password)}
                    helperText={formErrors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      bgcolor: 'grey.50',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" color="text.secondary">Remember me for 30 days</Typography>}
                />
                
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                    borderRadius: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: 16,
                    '&:hover': {
                      background: 'linear-gradient(to right, #1d4ed8, #4338ca)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
                
                <Box sx={{ position: 'relative', my: 2 }}>
                  <Divider />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: 'background.paper',
                      px: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                      Or continue with
                    </Typography>
                  </Box>
                </Box>
                
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    sx={{
                      py: 1,
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'grey.50',
                        borderColor: 'grey.400',
                      }
                    }}
                  >
                    Google
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<svg width="20" height="20" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H12z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>}
                    sx={{
                      py: 1,
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'grey.50',
                        borderColor: 'grey.400',
                      }
                    }}
                  >
                    Microsoft
                  </Button>
                </Stack>
              </Stack>
            </form>
          </CardContent>
          
          <Box sx={{ textAlign: 'center', py: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#2563eb', 
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
        
        <Typography variant="caption" color="white" sx={{ opacity: 0.8, display: 'block', textAlign: 'center', mt: 3 }}>
          &copy; {new Date().getFullYear()} Procto. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginForm;

