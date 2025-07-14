import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Popover, 
  Paper, 
  Button, 
  styled 
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';

// Styled components
const NavigationRoot = styled(Box)(() => ({
  display: 'flex',
  maxWidth: 'max-content',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
}));

const NavigationList = styled(List)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  listStyle: 'none',
  padding: 0,
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

const NavigationItem = styled(ListItem)(() => ({
  padding: 0,
  position: 'relative',
}));

const NavigationTrigger = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s',
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const NavigationContent = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  zIndex: 50,
  width: 'auto',
  minWidth: '200px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
}));

const NavigationLink = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.875rem',
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Main Components
export function NavigationMenu({ children, ...props }) {
  return (
    <NavigationRoot {...props}>
      {children}
    </NavigationRoot>
  );
}

export function NavigationMenuList({ children, ...props }) {
  return (
    <NavigationList {...props}>
      {children}
    </NavigationList>
  );
}

export function NavigationMenuItem({ children, ...props }) {
  return (
    <NavigationItem disablePadding {...props}>
      {children}
    </NavigationItem>
  );
}

export function NavigationMenuTrigger({ children, ...props }) {
  return (
    <NavigationTrigger 
      variant="text" 
      endIcon={<KeyboardArrowDown />} 
      {...props}
    >
      {children}
    </NavigationTrigger>
  );
}

export function NavigationMenuContent({ children, anchorEl, onClose, open, ...props }) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      {...props}
    >
      <NavigationContent elevation={0}>
        {children}
      </NavigationContent>
    </Popover>
  );
}

export function NavigationMenuLink({ children, ...props }) {
  return (
    <NavigationLink disableRipple {...props}>
      {children}
    </NavigationLink>
  );
}

// No need to re-export as components are already exported individually

// No need for navigationMenuTriggerStyle export
