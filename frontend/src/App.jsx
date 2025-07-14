import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import IdentityVerification from './components/auth/IdentityVerification';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import LiveMonitor from './components/admin/LiveMonitor';
import PreTestCheck from './components/exam/PreTestCheck';
import ExamInterface from './components/exam/ExamInterface';
import SecureExamInterface from './components/exam/SecureExamInterface';
import { ToastProvider } from './hooks/useToast';
import { Snackbar as CustomSnackbar } from './components/ui/snackbar/snackbar.jsx';
import theme from './theme';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // For development/testing only - bypass authentication check
  // To enable proper auth checking in production, remove this line
  return children;
  
  /* Original authentication logic:
  if (loading) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #e8f0fe, #e0e7ff)'
        }}
      >
        <CircularProgress color="primary" size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" fontWeight={500} color="primary.dark">
          Loading application...
        </Typography>
      </Box>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
  */
};

// Role-based Protected Route
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  // For development/testing only - bypass authentication check
  // To enable proper auth checking in production, remove this line
  return children;
  
  /* Original authentication logic:
  if (loading) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #e8f0fe, #e0e7ff)'
        }}
      >
        <CircularProgress color="primary" size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" fontWeight={500} color="primary.dark">
          Loading application...
        </Typography>
      </Box>
    );
  }
  
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/dashboard" />;
  */
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // For development/testing only - bypass authentication check
  // To enable proper auth checking in production, remove this line
  return children;
  
  /* Original authentication logic:
  if (loading) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #e8f0fe, #e0e7ff)'
        }}
      >
        <CircularProgress color="primary" size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" fontWeight={500} color="primary.dark">
          Loading application...
        </Typography>
      </Box>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
  */
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ToastProvider>
          <Router>
            <CustomSnackbar />
            <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            } />
            <Route path="/verify-identity" element={
              <ProtectedRoute>
                <IdentityVerification />
              </ProtectedRoute>
            } />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/live-monitoring/:sessionId" element={
              <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                <LiveMonitor />
              </RoleProtectedRoute>
            } />
            
            {/* Exam Routes */}
            <Route path="/exam/:examId/precheck" element={
              <ProtectedRoute>
                <PreTestCheck />
              </ProtectedRoute>
            } />
            <Route path="/exam/:examId" element={
              <ProtectedRoute>
                <ExamInterface />
              </ProtectedRoute>
            } />
            <Route path="/exam/:examId/secure" element={
              <ProtectedRoute>
                <SecureExamInterface />
              </ProtectedRoute>
            } />
            
            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <Box
                sx={{
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.default'
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h1" color="primary" sx={{ fontSize: 96, fontWeight: 700 }}>404</Typography>
                  <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>Page Not Found</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    The page you're looking for doesn't exist or has been moved.
                  </Typography>
                  <Box 
                    component="a" 
                    href="/dashboard"
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 3,
                      py: 1,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: 1,
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }}
                  >
                    Go to Dashboard
                  </Box>
                </Box>
              </Box>
            } />
          </Routes>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

