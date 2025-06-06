import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Card, CardContent, Avatar } from '@mui/material';
import { Person as PersonIcon, LocalHospital as HospitalIcon, CalendarToday as CalendarIcon, AccessTime as TimeIcon } from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleCardClick('/patients')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <PersonIcon sx={{ color: 'primary.contrastText' }} />
                </Avatar>
                <Typography variant="h6">Patients</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                100
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleCardClick('/diagnosis')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                  <HospitalIcon sx={{ color: 'success.contrastText' }} />
                </Avatar>
                <Typography variant="h6">Diagnosis</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                50
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleCardClick('/appointments')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                  <CalendarIcon sx={{ color: 'warning.contrastText' }} />
                </Avatar>
                <Typography variant="h6">Appointments</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                25
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleCardClick('/imaging')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
                  <TimeIcon sx={{ color: 'secondary.contrastText' }} />
                </Avatar>
                <Typography variant="h6">Imaging</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                75
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 