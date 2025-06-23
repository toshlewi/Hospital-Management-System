import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import { 
  Person as PersonIcon,
  LocalHospital,
  Science as ScienceIcon,
  LocalPharmacy as PharmacyIcon,
  AttachMoney as CashierIcon,
  SmartToy as AIIcon,
  PhotoCamera as ImagingIcon,
  PeopleAlt as PatientsIcon,
  Add as AddIcon,
  ViewList as ListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const patientActions = [
    {
      title: 'Register New Patient',
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      description: 'Add a new patient to the system',
      action: () => navigate('/patients?action=new'),
      primary: true
    },
    {
      title: 'View All Patients',
      icon: <ListIcon sx={{ fontSize: 40 }} />,
      description: 'View and manage existing patients',
      action: () => navigate('/patients'),
      primary: true
    }
  ];

  const departments = [
    {
      title: 'Reception',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      description: 'Patient registration and appointment scheduling',
      path: '/reception'
    },
    {
      title: 'Clinicians',
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
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
      pt: { xs: 4, sm: 6 },
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
        </Box>

        {/* Patient Management Section */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a237e',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <PatientsIcon sx={{ fontSize: 40 }} />
            Patient Management
          </Typography>
          <Grid container spacing={3}>
            {patientActions.map((action) => (
              <Grid item xs={12} md={6} key={action.title}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(26,35,126,0.2)',
                    }
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {action.icon}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {action.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Departments Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a237e',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <LocalHospital sx={{ fontSize: 40 }} />
            Hospital Departments
          </Typography>
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
        </Box>

        {/* AI Feature Badge */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'rgba(26,35,126,0.1)',
            px: 3,
            py: 2,
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
          }}>
            <AIIcon sx={{ color: '#1a237e', fontSize: 30 }} />
            <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
              AI-Powered Healthcare System
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 