import React from 'react';
import { Box, Typography, CircularProgress, SxProps, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Search not found component
 */
export function SearchNotFound({ query = '', sx }) {
  return (
    <Box sx={{ textAlign: 'center', ...sx }}>
      <Typography variant="h6" gutterBottom>
        No results found
      </Typography>
      
      {query && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No results found for &nbsp;
          <strong>{`"${query}"`}</strong>.
          <br /> Try checking for typos or using complete words.
        </Typography>
      )}

      {!query && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please try different search terms.
        </Typography>
      )}
    </Box>
  );
}

export default SearchNotFound;
