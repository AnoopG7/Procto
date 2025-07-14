import React, { forwardRef } from 'react';
import { Icon } from '@iconify/react';
import { Box } from '@mui/material';

/**
 * Iconify component for using Iconify icons in MUI
 */
const Iconify = forwardRef(({ icon, width = 20, sx, ...other }, ref) => (
  <Box
    ref={ref}
    component={Icon}
    // Using sx for styling instead of className
    icon={icon}
    sx={{
      width,
      height: width,
      ...sx,
    }}
    {...other}
  />
));

Iconify.displayName = 'Iconify';

export default Iconify;
