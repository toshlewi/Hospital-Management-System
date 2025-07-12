import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Home as HomeIcon,
  PeopleAlt as PatientsIcon,
  LocalPharmacy as PharmacyIcon,
  LocalHospital as OutpatientIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ 
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
            onClick={() => navigate('/')}
          >
            Tosh Hospital
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            {!isMobile && 'Home'}
          </Button>
          <Button
            color="inherit"
            startIcon={<PatientsIcon />}
            onClick={() => navigate('/patients')}
            sx={{
              backgroundColor: isActive('/patients') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            {!isMobile && 'Patients'}
          </Button>
          <Button
            color="inherit"
            startIcon={<OutpatientIcon />}
            onClick={() => navigate('/outpatient')}
            sx={{
              backgroundColor: isActive('/outpatient') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            {!isMobile && 'Outpatient'}
          </Button>
          <Button
            color="inherit"
            startIcon={<PharmacyIcon />}
            onClick={() => navigate('/pharmacy')}
            sx={{
              backgroundColor: isActive('/pharmacy') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            {!isMobile && 'Pharmacy'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 