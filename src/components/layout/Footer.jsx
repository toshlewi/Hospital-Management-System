import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if the user has scrolled to the bottom
      if (scrollTop + windowHeight >= documentHeight - 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        bgcolor: 'background.paper',
        p: 2,
        textAlign: 'center',
        transition: 'transform 0.3s ease-in-out',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {currentYear} Tosh Hospital. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;