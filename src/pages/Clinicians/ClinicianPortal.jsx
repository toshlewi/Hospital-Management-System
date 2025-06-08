import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import {
  LocalHospital as InpatientIcon,
  EventNote as OutpatientIcon,
} from '@mui/icons-material';

const ClinicianPortal = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleDepartmentClick = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          Clinician Portal
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          Access and manage patient care across all departments
        </Typography>
      </Box>

      {/* Main Content Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Inpatient Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
            onClick={() => handleDepartmentClick('inpatient')}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <InpatientIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Inpatient Care
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Manage hospitalized patients across all departments including Emergency,
              Surgery, Gynecology, Orthopedics, and Pediatrics
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{ mt: 'auto' }}
            >
              Access Inpatient Portal
            </Button>
          </Paper>
        </Grid>

        {/* Outpatient Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
            onClick={() => handleDepartmentClick('outpatient')}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: theme.palette.secondary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <OutpatientIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Outpatient Care
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Handle outpatient consultations, follow-ups, and manage patient
              appointments across all departments
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 'auto' }}
            >
              Access Outpatient Portal
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer Message */}
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'medium',
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          Our Commitment to Excellence
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            maxWidth: '800px',
            mx: 'auto',
            fontSize: '1.1rem',
            lineHeight: 1.6,
          }}
        >
          Providing the best patient care is our top priority. Our dedicated team of healthcare
          professionals is committed to delivering exceptional medical services with compassion
          and expertise.
        </Typography>
      </Box>
    </Container>
  );
};

export default ClinicianPortal; 