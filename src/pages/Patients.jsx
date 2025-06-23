import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import PatientForm from '../components/patient/PatientForm'; // Correct path for PatientForm
import PatientTable from '../components/patient/PatientTable'; // Correct path for PatientTable
import mockPatients from '../data/mockPatients'; // Correct path for mockPatients

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Simulate API call
    setPatients(mockPatients);
  }, []);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (patient.firstName?.toLowerCase() || '').includes(searchLower) ||
      (patient.lastName?.toLowerCase() || '').includes(searchLower) ||
      (patient.email?.toLowerCase() || '').includes(searchLower) ||
      (patient.phone || '').includes(searchTerm)
    );
  });

  const activePatients = filteredPatients.filter(p => p.status === 'active');
  const inactivePatients = filteredPatients.filter(p => p.status === 'inactive');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedPatient(null);
  };

  const handleFormSubmit = (formData) => {
    if (selectedPatient) {
      // Update existing patient
      setPatients(patients.map(p => 
        p.id === selectedPatient.id ? { ...p, ...formData } : p
      ));
    } else {
      // Add new patient
      const newPatient = {
        id: `patient-${Date.now()}`,
        ...formData,
        status: 'active',
        lastVisit: new Date().toISOString(),
      };
      setPatients([...patients, newPatient]);
    }
    handleFormClose();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Patient Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          New Patient
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }} className="hover-scale">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <PersonIcon sx={{ color: 'primary.contrastText' }} />
                </Avatar>
                <Typography variant="h6">Total Patients</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {patients.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }} className="hover-scale">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                  <HospitalIcon sx={{ color: 'success.contrastText' }} />
                </Avatar>
                <Typography variant="h6">Active Patients</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {activePatients.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }} className="hover-scale">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                  <CalendarIcon sx={{ color: 'warning.contrastText' }} />
                </Avatar>
                <Typography variant="h6">Today's Appointments</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {patients.filter(p => p.appointments?.some(a => a.date === new Date().toISOString().split('T')[0])).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }} className="hover-scale">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
                  <TimeIcon sx={{ color: 'secondary.contrastText' }} />
                </Avatar>
                <Typography variant="h6">Waiting Now</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {patients.filter(p => p.status === 'waiting').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Search and Filter */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  placeholder="Search patients..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                >
                  Filters
                </Button>
                <IconButton>
                  <RefreshIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab label={
                  <Badge badgeContent={activePatients.length} color="primary" sx={{ mr: 1 }}>
                    <span>Active Patients</span>
                  </Badge>
                } />
                <Tab label={
                  <Badge badgeContent={inactivePatients.length} color="secondary">
                    <span>Inactive</span>
                  </Badge>
                } />
                <Tab label="All Patients" />
              </Tabs>
            </Box>
            <PatientTable 
              patients={
                selectedTab === 0 ? activePatients :
                selectedTab === 1 ? inactivePatients :
                filteredPatients
              }
              onEdit={handleEditPatient}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Patient Form Dialog */}
      <PatientForm
        open={openForm}
        patient={selectedPatient}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </Container>
  );
};

export default Patients;