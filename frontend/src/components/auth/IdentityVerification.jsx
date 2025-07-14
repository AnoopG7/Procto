import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Alert,
  Container,
  Stack,
  Grid,
  CircularProgress,
  Avatar,
  IconButton
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const IdentityVerification = () => {
  const [photoFile, setPhotoFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const photoInputRef = useRef(null);
  const idCardInputRef = useRef(null);
  
  const { verifyIdentity } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size should be less than 5MB', 'error');
      return;
    }

    if (type === 'photo') {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setIdCardFile(file);
      setIdCardPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = (inputRef) => {
    inputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photoFile || !idCardFile) {
      showToast('Both photo and ID card are required', 'error');
      return;
    }

    setLoading(true);

    try {
      // For demonstration, we'll just simulate API call
      // In a real app, you would use verifyIdentity from useAuth
      // const formData = new FormData();
      // formData.append('photo', photoFile);
      // formData.append('idCard', idCardFile);
      // await verifyIdentity(formData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success toast
      showToast('Identity verification successful!', 'success');
      
      // Navigate to dashboard after successful verification
      navigate('/dashboard');
    } catch (err) {
      console.error('Verification error:', err);
      showToast(err.message || 'Verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Identity Verification
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Please verify your identity to continue
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardHeader 
          title="Complete Verification" 
          titleTypographyProps={{ variant: 'h6' }}
          subheader="Upload your recent photo and ID card for verification"
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                      Your Photo
                    </Typography>

                    <Box 
                      sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 3,
                        mb: 2,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {photoPreview ? (
                        <Box 
                          component="img"
                          src={photoPreview}
                          alt="Profile Preview"
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'contain',
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        <Avatar 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mb: 2,
                            bgcolor: 'primary.light'
                          }}
                        >
                          <CameraIcon fontSize="large" />
                        </Avatar>
                      )}

                      <Typography variant="body2" color="text.secondary" sx={{ mt: photoPreview ? 2 : 0 }}>
                        {photoPreview ? 'Photo selected' : 'No photo selected'}
                      </Typography>
                    </Box>

                    <input
                      type="file"
                      accept="image/*"
                      ref={photoInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e, 'photo')}
                    />

                    <Button
                      variant="outlined"
                      startIcon={photoPreview ? <CheckCircleIcon /> : <CameraIcon />}
                      onClick={() => triggerFileInput(photoInputRef)}
                      fullWidth
                    >
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                      ID Card
                    </Typography>

                    <Box 
                      sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 3,
                        mb: 2,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {idCardPreview ? (
                        <Box 
                          component="img"
                          src={idCardPreview}
                          alt="ID Card Preview"
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'contain',
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        <Avatar 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mb: 2,
                            bgcolor: 'primary.light'
                          }}
                        >
                          <UploadIcon fontSize="large" />
                        </Avatar>
                      )}

                      <Typography variant="body2" color="text.secondary" sx={{ mt: idCardPreview ? 2 : 0 }}>
                        {idCardPreview ? 'ID card selected' : 'No ID card selected'}
                      </Typography>
                    </Box>

                    <input
                      type="file"
                      accept="image/*"
                      ref={idCardInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e, 'idCard')}
                    />

                    <Button
                      variant="outlined"
                      startIcon={idCardPreview ? <CheckCircleIcon /> : <UploadIcon />}
                      onClick={() => triggerFileInput(idCardInputRef)}
                      fullWidth
                    >
                      {idCardPreview ? 'Change ID Card' : 'Upload ID Card'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !photoFile || !idCardFile}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  >
                    {loading ? 'Verifying...' : 'Submit for Verification'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default IdentityVerification;