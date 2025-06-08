import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { 
  Menu as MenuIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const departments = [
    { name: 'Reception', path: '/reception' },
    { name: 'Clinicians', path: '/clinicians' },
    { name: 'Laboratory', path: '/laboratory' },
    { name: 'Imaging', path: '/imaging' },
    { name: 'Pharmacy', path: '/pharmacy' },
    { name: 'Cashier', path: '/cashier' }
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDepartmentClick = async (path) => {
    try {
      setIsNavigating(true);
      await navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsNavigating(false);
      handleMenuClose();
    }
  };

  const handleHomeClick = async () => {
    try {
      setIsNavigating(true);
      await navigate('/');
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1100,
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Logo and Home */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
            onClick={handleHomeClick}
          >
            Tosh Hospital
            {isNavigating && <CircularProgress size={20} color="inherit" />}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleHomeClick}
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Home
          </Button>
        </Box>

        {/* Center - Department Links */}
        {!isMobile && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            alignItems: 'center'
          }}>
            {departments.map((dept) => (
              <Button
                key={dept.name}
                color="inherit"
                onClick={() => handleDepartmentClick(dept.path)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  },
                  backgroundColor: location.pathname === dept.path ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                {dept.name}
              </Button>
            ))}
          </Box>
        )}

        {/* Right side - Mobile Menu */}
        {isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={handleMenuClick}
              endIcon={<ArrowDownIcon />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Departments
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  '& .MuiMenuItem-root': {
                    color: '#1a237e',
                    '&:hover': {
                      backgroundColor: 'rgba(26,35,126,0.1)'
                    }
                  }
                }
              }}
            >
              {departments.map((dept) => (
                <MenuItem 
                  key={dept.name}
                  onClick={() => handleDepartmentClick(dept.path)}
                  sx={{
                    backgroundColor: location.pathname === dept.path ? 'rgba(26,35,126,0.1)' : 'transparent'
                  }}
                >
                  {dept.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 