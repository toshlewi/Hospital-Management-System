import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PersonAdd,
  Search,
  Edit,
  Delete,
  CalendarToday,
  LocalHospital,
  AssignmentInd,
  MedicalServices,
  PersonSearch,
  Schedule
} from '@mui/icons-material';
import { patientAPI } from '../services/api';
import { fetchPatientsStart, fetchPatientsSuccess, fetchPatientsFailure, deletePatient as deletePatientAction } from '../store/reducers/patientReducer';

const Reception = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { patients, loading, error } = useSelector(state => state.patients);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      dispatch(fetchPatientsStart());
      try {
        const data = await patientAPI.getAllPatients();
        dispatch(fetchPatientsSuccess(data));
      } catch (err) {
        console.error('Error fetching patients:', err);
        dispatch(fetchPatientsFailure('Failed to load patients. Please try again later.'));
      }
    };

    if (patients.length === 0) {
       fetchPatients();
    }
  }, [dispatch, patients.length]);

  // Navigate to patient registration
  const handleAddNewPatient = () => {
    navigate('/patients', { state: { openNewPatient: true } });
  };

  // Navigate to patient edit
  const handleEditPatient = (patientId) => {
    navigate('/patients', { state: { editPatientId: patientId } });
  };

  // Delete a patient
  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientAPI.deletePatient(patientId);
        dispatch(deletePatientAction(patientId));
      } catch (err) {
        console.error('Error deleting patient:', err);
        // Optionally dispatch an error action
      }
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(patient.patient_id).includes(searchTerm)
  );

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        color: 'primary.main'
      }}>
        <AssignmentInd fontSize="large" /> Receptionist Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Patient Management" icon={<PersonSearch />} />
        <Tab label="Appointments" icon={<CalendarToday />} />
        <Tab label="Doctors Availability" icon={<LocalHospital />} />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <TextField
              label="Search patients by name or ID"
              variant="outlined"
              size="small"
              sx={{ width: 400 }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              variant="contained" 
              startIcon={<PersonAdd />}
              onClick={handleAddNewPatient}
            >
              Register New Patient
            </Button>
          </Box>

          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Patient Records
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'primary.light' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>Patient ID</TableCell>
                        <TableCell sx={{ color: 'white' }}>Name</TableCell>
                        <TableCell sx={{ color: 'white' }}>Date of Birth</TableCell>
                        <TableCell sx={{ color: 'white' }}>Gender</TableCell>
                        <TableCell sx={{ color: 'white' }}>Contact</TableCell>
                        <TableCell sx={{ color: 'white' }}>Insurance</TableCell>
                        <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPatients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            {searchTerm ? 'No patients match your search' : 'No patients registered yet'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPatients.map((patient) => (
                          <TableRow key={patient.patient_id}>
                            <TableCell>{patient.patient_id}</TableCell>
                            <TableCell>{`${patient.first_name} ${patient.last_name}`}</TableCell>
                            <TableCell>{new Date(patient.date_of_birth).toLocaleDateString()}</TableCell>
                            <TableCell>{patient.gender}</TableCell>
                            <TableCell>
                              {patient.contact_number}
                              {patient.email && (
                                <Typography variant="caption" display="block" color="textSecondary">
                                  {patient.email}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {patient.insurance_info || 'None'}
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                color="primary" 
                                onClick={() => handleEditPatient(patient.patient_id)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeletePatient(patient.patient_id)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 1 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Appointments</Typography>
              <Button variant="contained" startIcon={<CalendarToday />}>
                Schedule New Appointment
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="primary" /> Today's Appointments
                </Typography>
                <Alert severity="info">
                  Appointment management feature coming soon!
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Doctors Availability
            </Typography>
            <Alert severity="info">
              Doctor availability management feature coming soon!
            </Alert>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Reception;