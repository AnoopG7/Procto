import React from 'react';
import { useToast } from '../../../hooks/useToast';
import { Snackbar, Alert } from '@mui/material';

export const MUIToaster = () => {
  const { open, message, severity, autoHideDuration, hideToast } = useToast();
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={hideToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={hideToast} 
        severity={severity} 
        variant="filled"
        elevation={6}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default MUIToaster;
