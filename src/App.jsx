import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AppRoutes from './routes';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Header toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-secondary)',
            transition: 'margin 0.3s ease-in-out',
            marginRight: isSidebarOpen ? '300px' : 0
          }}
        >
          <AppRoutes />
        </Box>
      </Box>
    </Router>
  );
};

export default App; 