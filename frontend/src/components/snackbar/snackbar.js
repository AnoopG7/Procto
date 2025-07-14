import React from 'react';
import { Snackbar as MuiSnackbar, Alert } from '@mui/material';
import { useToast } from '../../../hooks/useToast';

export function Snackbar() {
  const { toast, closeToast } = useToast();
  
  return (
    <MuiSnackbar
      open={toast.open}
      autoHideDuration={toast.duration || 5000}
      onClose={closeToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={closeToast} 
        severity={toast.severity || 'info'} 
        sx={{ width: '100%' }}
        variant="filled"
        elevation={6}
      >
        {toast.message}
      </Alert>
    </MuiSnackbar>
  );
}
