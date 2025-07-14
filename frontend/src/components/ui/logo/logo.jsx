import React from 'react';
import { Box, Typography, Avatar, Stack, SvgIcon, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const LogoRoot = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  textDecoration: 'none',
  color: theme.palette.primary.main,
  '&:hover': {
    textDecoration: 'none',
  },
  '&.disabled': {
    pointerEvents: 'none',
  }
}));

/**
 * Logo component for the application
 */
export function Logo({ isSingle = false, disabled = false, ...other }) {
  return (
    <LogoRoot
      className={disabled ? 'disabled' : ''}
      {...other}
    >
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Avatar
          src="/logo.png"
          alt="ProctorApp Logo"
          sx={{ 
            width: 32, 
            height: 32,
            borderRadius: '8px',
            bgcolor: 'primary.main' 
          }}
        >
          P
        </Avatar>
        
        {!isSingle && (
          <Typography 
            variant="h6" 
            component="span"
            sx={{ 
              fontWeight: 'bold',
              lineHeight: 1,
              color: 'text.primary' 
            }}
          >
            ProctorApp
          </Typography>
        )}
      </Stack>
    </LogoRoot>
  );
}

export default Logo;
