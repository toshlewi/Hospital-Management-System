import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Home as HomeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  LocalPharmacy as PharmacyIcon,
  AttachMoney as CashierIcon,
  SmartToy as AIIcon,
  PhotoCamera as ImagingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const departments = [
    {
      title: 'Reception',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      description: 'Patient registration and appointment scheduling',
      path: '/reception'
    },
    {
      title: 'Clinicians',
      icon: <HospitalIcon sx={{ fontSize: 40 }} />,
      description: 'Medical consultation and treatment',
      path: '/clinicians'
    },
    {
      title: 'Laboratory',
      icon: <ScienceIcon sx={{ fontSize: 40 }} />,
      description: 'Medical tests and diagnostics',
      path: '/laboratory'
    },
    {
      title: 'Imaging',
      icon: <ImagingIcon sx={{ fontSize: 40 }} />,
      description: 'Radiology and diagnostic imaging services',
      path: '/imaging'
    },
    {
      title: 'Pharmacy',
      icon: <PharmacyIcon sx={{ fontSize: 40 }} />,
      description: 'Medication dispensing and management',
      path: '/pharmacy'
    },
    {
      title: 'Cashier',
      icon: <CashierIcon sx={{ fontSize: 40 }} />,
      description: 'Billing and payment processing',
      path: '/cashier'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      pt: { xs: 8, sm: 10 },
      pb: { xs: 4, sm: 6 }
    }}>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 4, sm: 6 },
          position: 'relative'
        }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              color: '#1a237e',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Welcome to Tosh Hospital
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#283593',
              maxWidth: '800px',
              mx: 'auto',
              mb: 4
            }}
          >
            Your trusted healthcare partner providing comprehensive medical services
          </Typography>
          
          {/* AI Badge */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(26,35,126,0.1)',
            px: 2,
            py: 1,
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            animation: 'pulse 2s infinite'
          }}>
            <AIIcon sx={{ color: '#1a237e' }} />
            <Typography sx={{ color: '#1a237e', fontWeight: 600 }}>
              AI-Powered Healthcare
            </Typography>
          </Box>
        </Box>

        {/* Departments Grid */}
        <Grid container spacing={3}>
          {departments.map((dept) => (
            <Grid item xs={12} sm={6} md={4} key={dept.title}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(26,35,126,0.2)',
                    '& .MuiSvgIcon-root': {
                      color: '#64ffda',
                      transform: 'scale(1.1)'
                    }
                  }
                }}
                onClick={() => navigate(dept.path)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    gap: 2
                  }}>
                    <Box sx={{ 
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      {dept.icon}
                    </Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#1a237e'
                      }}
                    >
                      {dept.title}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#283593',
                      opacity: 0.8
                    }}
                  >
                    {dept.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Status Section */}
        <Box sx={{ 
          mt: { xs: 4, sm: 6 },
          p: 3,
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(26,35,126,0.1)'
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 700 }}>24/7</Typography>
                <Typography variant="body1" sx={{ color: '#283593' }}>Emergency Care</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 700 }}>100+</Typography>
                <Typography variant="body1" sx={{ color: '#283593' }}>Expert Doctors</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 700 }}>50+</Typography>
                <Typography variant="body1" sx={{ color: '#283593' }}>Specialties</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 