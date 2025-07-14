import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  SxProps,
  Theme
} from '@mui/material';

export type LoadingScreenProps = {
  sx?: SxProps<Theme>;
  fullScreen?: boolean;
};

export function LoadingScreen({ sx, fullScreen = false }: LoadingScreenProps) {
  const containerStyle = fullScreen
    ? {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {
        py: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };

  return (
    <Container sx={{ ...containerStyle, ...sx }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </Box>
    </Container>
  );
}

export function SplashScreen() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
