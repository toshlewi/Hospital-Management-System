import React from 'react';
import { Box, Typography } from '@mui/material';

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <Box sx={{ position: 'fixed', bottom: 0, width: '100%', bgcolor: 'background.paper', p: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        © {currentYear} Tosh Hospital. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer; 