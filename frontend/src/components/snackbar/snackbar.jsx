import React from 'react';
import { Snackbar as MUISnackbar, Alert, styled, Portal } from '@mui/material';
import { useToast } from '../../hooks/useToast';

// Custom styled Alert component for the toast
const StyledAlert = styled(Alert)(({ theme }) => ({
  width: '100%',
  boxShadow: theme.shadows[3],
}));

// ----------------------------------------------------------------------

export function Snackbar() {
  const { open, message, severity, autoHideDuration, hideToast } = useToast();
  
  // Map string severity to MUI severity type
  const getMUISeverity = (sev) => {
    switch(sev) {
      case 'error': return 'error';
      case 'success': return 'success';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };
  
  return (
    <Portal>
      <MUISnackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <StyledAlert 
          onClose={hideToast} 
          severity={getMUISeverity(severity)}
          variant="filled"
          elevation={6}
        >
          {message}
        </StyledAlert>
      </MUISnackbar>
    </Portal>
  );
}
