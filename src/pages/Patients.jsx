import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  Badge,
  Alert
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
import PatientForm from '../components/patient/PatientForm';
import PatientTable from '../components/patient/PatientTable';
import { patientAPI } from '../services/api';

const Patients = () => {
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Handle navigation state
  useEffect(() => {
    if (location.state?.openNewPatient) {
      setOpenForm(true);
    } else if (location.state?.editPatientId) {
      const patientToEdit = patients.find(p => p.patient_id === location.state.editPatientId);
      if (patientToEdit) {
        setSelectedPatient(patientToEdit);
        setOpenForm(true);
      }
    }
  }, [location.state, patients]);

  // Fetch patients from backend
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getAllPatients();
      setPatients(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch patients from database');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (patient.first_name?.toLowerCase() || '').includes(searchLower) ||
      (patient.last_name?.toLowerCase() || '').includes(searchLower) ||
      (patient.email?.toLowerCase() || '').includes(searchLower) ||
      (patient.contact_number || '').includes(searchTerm)
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

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedPatient) {
        // Update existing patient
        await patientAPI.updatePatient(selectedPatient.patient_id, formData);
      } else {
        // Add new patient
        await patientAPI.createPatient(formData);
      }
      // Refresh the patient list
      await fetchPatients();
      handleFormClose();
    } catch (err) {
      console.error('Error saving patient:', err);
      // Error handling is done in the PatientForm component
    }
  };

  const handleRefresh = () => {
    fetchPatients();
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography>Loading patients...</Typography>
      </Container>
    );
  }

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
                <IconButton onClick={handleRefresh}>
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