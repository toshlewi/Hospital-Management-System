import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  LocalHospital as HospitalIcon,
  Stethoscope as StethoscopeIcon,
  Medication as MedicationIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { patientAPI } from '../../services/api';

const Outpatient = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [patientDialog, setPatientDialog] = useState(false);
  const [billingDialog, setBillingDialog] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [billingStatus, setBillingStatus] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await patientAPI.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
      showSnackbar('Error loading patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId) => {
    try {
      const [details, billing] = await Promise.all([
        patientAPI.getPatientById(patientId),
        patientAPI.getPatientBillingStatus(patientId)
      ]);
      setPatientDetails(details);
      setBillingStatus(billing);
    } catch (error) {
      console.error('Error loading patient details:', error);
      showSnackbar('Error loading patient details', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setPatientDialog(true);
    await loadPatientDetails(patient.patient_id);
  };

  const handleSearch = () => {
    // Filter patients based on search query
    return patients.filter(patient => 
      patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patient_id?.toString().includes(searchQuery)
    );
  };

  const getPaymentStatusColor = (hasPaid) => {
    return hasPaid ? 'success' : 'error';
  };

  const getPaymentStatusIcon = (hasPaid) => {
    return hasPaid ? <CheckCircleIcon /> : <ErrorIcon />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredPatients = handleSearch();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <StethoscopeIcon sx={{ mr: 2, color: 'primary.main' }} />
        Outpatient Clinic
      </Typography>

      {/* Search and Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Patients</Typography>
              <Typography variant="h4">{patients.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patient List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Patient List
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Patient ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age/Gender</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow 
                    key={patient.patient_id}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                      borderLeft: patient.status === 'active' ? '4px solid #4caf50' : '4px solid #ff9800'
                    }}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        #{patient.patient_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {patient.first_name?.[0]}{patient.last_name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {patient.first_name} {patient.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {patient.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {patient.date_of_birth ? 
                          `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years` : 
                          'N/A'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {patient.gender}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {patient.contact_number || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getPaymentStatusIcon(patient.has_paid_consultation)}
                        label={patient.has_paid_consultation ? 'Paid' : 'Pending'}
                        color={getPaymentStatusColor(patient.has_paid_consultation)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePatientSelect(patient);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBillingDialog(true);
                          loadPatientDetails(patient.patient_id);
                        }}
                      >
                        <PaymentIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog 
        open={patientDialog} 
        onClose={() => setPatientDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Patient Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {patientDetails && (
            <Box>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Basic Info" />
                <Tab label="Medical Notes" />
                <Tab label="Prescriptions" />
                <Tab label="Billing" />
              </Tabs>

              {/* Basic Info Tab */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Personal Information</Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Name" 
                              secondary={`${patientDetails.first_name} ${patientDetails.last_name}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Date of Birth" 
                              secondary={formatDate(patientDetails.date_of_birth)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Gender" 
                              secondary={patientDetails.gender}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Contact" 
                              secondary={patientDetails.contact_number}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Email" 
                              secondary={patientDetails.email}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Medical Information</Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Blood Type" 
                              secondary={patientDetails.blood_type || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Emergency Contact" 
                              secondary={patientDetails.emergency_contact || 'N/A'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Insurance" 
                              secondary={patientDetails.insurance_info || 'N/A'}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Medical Notes Tab */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Medical Notes</Typography>
                  {patientDetails.medical_notes?.length > 0 ? (
                    <List>
                      {patientDetails.medical_notes.map((note, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle2" color="primary">
                              {formatDate(note.created_at)}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {note.notes}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">No medical notes available</Alert>
                  )}
                </Box>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Prescriptions</Typography>
                  {patientDetails.prescriptions?.length > 0 ? (
                    <List>
                      {patientDetails.prescriptions.map((prescription, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle2" color="primary">
                              {formatDate(prescription.prescribed_date)}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {prescription.medication_name} - {prescription.dosage}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {prescription.instructions}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">No prescriptions available</Alert>
                  )}
                </Box>
              )}

              {/* Billing Tab */}
              {activeTab === 3 && billingStatus && (
                <Box>
                  <Typography variant="h6" gutterBottom>Billing Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>Payment Status</Typography>
                          <Chip
                            icon={getPaymentStatusIcon(billingStatus.has_paid_consultation)}
                            label={billingStatus.has_paid_consultation ? 'Consultation Paid' : 'Consultation Pending'}
                            color={getPaymentStatusColor(billingStatus.has_paid_consultation)}
                            sx={{ mb: 2 }}
                          />
                          <Typography variant="body2">
                            Total Bills: {billingStatus.total_bills}
                          </Typography>
                          <Typography variant="body2">
                            Pending Amount: {formatCurrency(billingStatus.pending_amount)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>Recent Bills</Typography>
                          {billingStatus.recent_bills?.length > 0 ? (
                            <List dense>
                              {billingStatus.recent_bills.map((bill, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={`${bill.bill_number} - ${formatCurrency(bill.total_amount)}`}
                                    secondary={bill.status}
                                  />
                                  <Chip 
                                    label={bill.status} 
                                    color={bill.status === 'paid' ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No bills found
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Outpatient;