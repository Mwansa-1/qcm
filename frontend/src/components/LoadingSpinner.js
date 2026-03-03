import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function LoadingSpinner({ size = 48 }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <CircularProgress size={size} />
    </Box>
  );
}
