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
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  TextareaAutosize,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  ListItemIcon,
  ListItemSecondaryAction
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
  Medication as MedicationIcon,
  Notes as NotesIcon,
  Science as LabIcon,
  Image as ImagingIcon,
  Save as SaveIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { patientAPI } from '../../services/api';
import pharmacyService from '../../services/pharmacyService';


const Outpatient = ({ onPatientSelect }) => {
  // State for patient management
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [patientDialog, setPatientDialog] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [billingStatus, setBillingStatus] = useState(null);

  // State for medical notes
  const [medicalNote, setMedicalNote] = useState('');
  const [medicalNotes, setMedicalNotes] = useState([]);
  const [addingNote, setAddingNote] = useState(false);
  const [medicalNoteDialog, setMedicalNoteDialog] = useState(false);
  const [medicalNoteData, setMedicalNoteData] = useState({
    diagnosis: '',
    advice: ''
  });

  // State for lab orders
  const [labOrderDialog, setLabOrderDialog] = useState(false);
  const [labOrder, setLabOrder] = useState({
    test_name: '',
    test_type: 'lab',
    priority: 'routine',
    clinical_notes: '',
    requesting_physician: 'Dr. Smith' // In real app, get from auth
  });
  const [labOrders, setLabOrders] = useState([]);
  const [submittingLabOrder, setSubmittingLabOrder] = useState(false);

  // State for prescriptions
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [prescription, setPrescription] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: 1
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [submittingPrescription, setSubmittingPrescription] = useState(false);
  const [availableDrugs, setAvailableDrugs] = useState([]);

  // State for imaging orders
  const [imagingOrderDialog, setImagingOrderDialog] = useState(false);
  const [imagingOrder, setImagingOrder] = useState({
    imaging_type: '',
    body_part: '',
    clinical_notes: '',
    differential_diagnosis: '',
    priority: 'routine',
    requesting_physician: 'Dr. Smith'
  });
  const [imagingOrders, setImagingOrders] = useState([]);
  const [submittingImagingOrder, setSubmittingImagingOrder] = useState(false);

  // State for billing
  const [billingDialog, setBillingDialog] = useState(false);
  const [billingItems, setBillingItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);



  useEffect(() => {
    loadPatients();
  }, []);



  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };



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
      const [details, billing, notes, presc, lab, imaging] = await Promise.all([
        patientAPI.getPatientById(patientId),
        patientAPI.getPatientBillingStatus(patientId),
        patientAPI.getMedicalNotes(patientId),
        patientAPI.getPrescriptions(patientId),
        patientAPI.getTestOrders(patientId),
        patientAPI.getImaging(patientId)
      ]);
      setPatientDetails(details);
      setBillingStatus(billing);
      setMedicalNotes(notes || []);
      setPrescriptions(presc || []);
      setLabOrders(lab || []);
      setImagingOrders(imaging || []);
    } catch (error) {
      console.error('Error loading patient details:', error);
      showSnackbar('Error loading patient details', 'error');
    }
  };

  const loadAvailableDrugs = async () => {
    try {
      const drugs = await pharmacyService.getAllDrugs();
      setAvailableDrugs(drugs);
    } catch (error) {
      console.error('Error loading drugs:', error);
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
    
    // Notify parent component about patient selection
    if (onPatientSelect) {
      onPatientSelect(patient);
    }
  };

  // Medical Notes Functions
  const handleAddMedicalNote = async () => {
    if (!medicalNote.trim()) return;
    
    setAddingNote(true);
    try {
      const newNote = await patientAPI.addMedicalNote(selectedPatient.patient_id, {
        note_text: medicalNote,
        doctor_id: 1, // In real app, get from auth
        note_type: 'consultation'
      });
      setMedicalNotes([newNote, ...medicalNotes]);
      setMedicalNote('');
      showSnackbar('Medical note added successfully');
    } catch (error) {
      console.error('Error adding medical note:', error);
      showSnackbar('Error adding medical note', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  // Lab Order Functions
  const handleSubmitLabOrder = async () => {
    if (!labOrder.test_name.trim()) return;
    setSubmittingLabOrder(true);
    try {
      const newOrder = await patientAPI.addTestOrder(selectedPatient.patient_id, {
        test_name: labOrder.test_name,
        test_type: 'lab',
        clinical_notes: labOrder.clinical_notes,
        priority: labOrder.priority,
        requesting_physician: labOrder.requesting_physician,
        status: 'ordered',
        order_date: new Date().toISOString()
      });
      setLabOrders([newOrder, ...labOrders]);
      setLabOrder({
        test_name: '',
        test_type: 'lab',
        priority: 'routine',
        clinical_notes: '',
        requesting_physician: 'Dr. Smith'
      });
      setLabOrderDialog(false);
      showSnackbar('Lab order submitted successfully');
      await loadPatientDetails(selectedPatient.patient_id); // Always refresh after order
    } catch (error) {
      console.error('Error submitting lab order:', error);
      showSnackbar('Error submitting lab order', 'error');
    } finally {
      setSubmittingLabOrder(false);
    }
  };

  // Prescription Functions
  const handleSubmitPrescription = async () => {
    if (!prescription.medication_name.trim() || !prescription.dosage.trim()) return;
    setSubmittingPrescription(true);
    try {
      const newPrescription = await patientAPI.createPrescription(selectedPatient.patient_id, {
        ...prescription,
        prescribed_date: new Date().toISOString(),
        status: 'active'
      });
      setPrescriptions([newPrescription, ...prescriptions]);
      setPrescription({
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1
      });
      setPrescriptionDialog(false);
      showSnackbar('Prescription created successfully');
      await loadPatientDetails(selectedPatient.patient_id); // Always refresh after prescription
    } catch (error) {
      console.error('Error creating prescription:', error);
      showSnackbar('Error creating prescription', 'error');
    } finally {
      setSubmittingPrescription(false);
    }
  };

  // Imaging Order Functions
  const handleSubmitImagingOrder = async () => {
    if (!imagingOrder.imaging_type.trim()) return;
    setSubmittingImagingOrder(true);
    try {
      const newOrder = await patientAPI.addTestOrder(selectedPatient.patient_id, {
        test_name: `${imagingOrder.imaging_type} - ${imagingOrder.body_part}`,
        test_type: 'imaging',
        imaging_type: imagingOrder.imaging_type,
        body_part: imagingOrder.body_part,
        clinical_notes: imagingOrder.clinical_notes,
        differential_diagnosis: imagingOrder.differential_diagnosis,
        priority: imagingOrder.priority,
        requesting_physician: imagingOrder.requesting_physician,
        status: 'ordered',
        order_date: new Date().toISOString()
      });
      setImagingOrders([newOrder, ...imagingOrders]);
      setImagingOrder({
        imaging_type: '',
        body_part: '',
        clinical_notes: '',
        differential_diagnosis: '',
        priority: 'routine',
        requesting_physician: 'Dr. Smith'
      });
      setImagingOrderDialog(false);
      showSnackbar('Imaging order submitted successfully');
      await loadPatientDetails(selectedPatient.patient_id); // Always refresh after order
    } catch (error) {
      console.error('Error submitting imaging order:', error);
      showSnackbar('Error submitting imaging order', 'error');
    } finally {
      setSubmittingImagingOrder(false);
    }
  };

  // Billing Functions
  const handleCreateBill = async () => {
    try {
      const billData = {
        patient_id: selectedPatient.patient_id,
        items: billingItems,
        total_amount: totalAmount,
        status: 'pending'
      };
      
      // In a real app, you would call the billing API here
      console.log('Creating bill:', billData);
      showSnackbar('Bill created successfully');
      setBillingDialog(false);
    } catch (error) {
      console.error('Error creating bill:', error);
      showSnackbar('Error creating bill', 'error');
    }
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

  const filteredPatients = patients.filter(patient => 
    patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patient_id?.toString().includes(searchQuery)
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MedicalIcon sx={{ mr: 2, color: 'primary.main' }} />
        Outpatient Clinic - Clinician Portal
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
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
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
                        label={patient.status}
                        color={patient.status === 'active' ? 'success' : 'warning'}
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
                        title="View Patient"
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Enhanced Patient Details Dialog */}
      <Dialog 
        open={patientDialog} 
        onClose={() => setPatientDialog(false)} 
        maxWidth="xl" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { width: '95vw', maxWidth: '1400px', height: '90vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              Patient Details - {selectedPatient?.first_name} {selectedPatient?.last_name}
            </Box>
            <IconButton onClick={() => setPatientDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ height: 'calc(90vh - 120px)', overflow: 'auto' }}>
          {patientDetails && (
            <Grid container spacing={3}>
              {/* Left Column - Patient Info and Tabs */}
              <Grid item xs={12} md={8}>
            <Box>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Basic Info" />
                <Tab label="Medical Notes" />
                <Tab label="Lab Orders" />
                <Tab label="Prescriptions" />
                <Tab label="Imaging" />
                    <Tab label="Test Results" />
                    <Tab label="AI Diagnosis" />
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Medical Notes</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                          onClick={() => setMedicalNoteDialog(true)}
                    >
                      Add Note
                    </Button>
                  </Box>
                  
                  {medicalNotes.length > 0 ? (
                    <List>
                      {medicalNotes.map((note, index) => (
                            <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle2" color="primary">
                                    {note.note_text}
                              </Typography>
                                  <Chip 
                                    label={note.created_at ? formatDate(note.created_at) : 'N/A'} 
                                    size="small"
                                  />
                            </Box>
                                {note.diagnosis && (
                                  <Typography variant="body2" color="text.secondary">
                                    Diagnosis: {note.diagnosis}
                            </Typography>
                                )}
                                {note.advice && (
                                  <Typography variant="body2" color="text.secondary">
                                    Advice: {note.advice}
                                  </Typography>
                                )}
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">No medical notes available</Alert>
                  )}
                </Box>
              )}

              {/* Lab Orders Tab */}
              {activeTab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Lab Orders</Typography>
                    <Button
                      variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setLabOrderDialog(true)}
                    >
                          New Lab Order
                    </Button>
                  </Box>
                  
                  {labOrders.length > 0 ? (
                    <List>
                      {labOrders.map((order, index) => (
                            <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" color="primary">
                                {order.test_name}
                              </Typography>
                              <Chip 
                                label={order.status} 
                                color={order.status === 'completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                  Ordered: {formatDate(order.ordered_at)}
                            </Typography>
                            {order.clinical_notes && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Notes: {order.clinical_notes}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">No lab orders available</Alert>
                  )}
                </Box>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 3 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Prescriptions</Typography>
                    <Button
                      variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setPrescriptionDialog(true)}
                    >
                      New Prescription
                    </Button>
                  </Box>
                  
                  {prescriptions.length > 0 ? (
                    <List>
                      {prescriptions.map((prescription, index) => (
                            <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" color="primary">
                                {prescription.medication_name}
                              </Typography>
                              <Chip 
                                label={prescription.status} 
                                    color={prescription.status === 'active' ? 'success' : 'warning'}
                                size="small"
                              />
                            </Box>
                                <Typography variant="body2" color="text.secondary">
                                  Dosage: {prescription.dosage} | Frequency: {prescription.frequency}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                  Duration: {prescription.duration} | Quantity: {prescription.quantity}
                            </Typography>
                            {prescription.instructions && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Instructions: {prescription.instructions}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">No prescriptions available</Alert>
                  )}
                </Box>
              )}

              {/* Imaging Tab */}
              {activeTab === 4 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Imaging Orders</Typography>
                    <Button
                      variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setImagingOrderDialog(true)}
                    >
                          New Imaging Order
                    </Button>
                  </Box>
                  
                  {imagingOrders.length > 0 ? (
                    <List>
                      {imagingOrders.map((order, index) => (
                            <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" color="primary">
                                {order.imaging_type} - {order.body_part}
                              </Typography>
                              <Chip 
                                label={order.status} 
                                color={order.status === 'completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                  Ordered: {formatDate(order.ordered_at)}
                            </Typography>
                            {order.clinical_notes && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Notes: {order.clinical_notes}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">No imaging orders available</Alert>
                  )}
                </Box>
              )}

                  {/* Test Results Tab */}
                  {activeTab === 5 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Test Results</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed lab and imaging results
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={3}>
                        {/* Lab Results */}
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <LabIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Lab Results
                              </Typography>
                              
                              {labOrders.filter(order => order.status === 'completed').length > 0 ? (
                                <List>
                                  {labOrders.filter(order => order.status === 'completed').map((order, index) => (
                                    <Card key={index} sx={{ mb: 2, bgcolor: 'success.light' }}>
                                      <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                          <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                            {order.test_name}
                                          </Typography>
                                          <Chip 
                                            label="Completed" 
                                            color="success"
                                            size="small"
                                          />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Ordered: {formatDate(order.ordered_at)}
                                        </Typography>
                                        {order.result && (
                                          <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" gutterBottom color="primary">
                                              Results:
                                            </Typography>
                                            <Typography variant="body2">
                                              {order.result}
                                            </Typography>
                                          </Box>
                                        )}
                                        {order.clinical_notes && (
                                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                            Notes: {order.clinical_notes}
                                          </Typography>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </List>
                              ) : (
                                <Alert severity="info">No completed lab results available</Alert>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Imaging Results */}
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <ImagingIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Imaging Results
                              </Typography>
                              
                              {imagingOrders.filter(order => order.status === 'completed').length > 0 ? (
                                <List>
                                  {imagingOrders.filter(order => order.status === 'completed').map((order, index) => (
                                    <Card key={index} sx={{ mb: 2, bgcolor: 'info.light' }}>
                                      <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                          <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                            {order.imaging_type} - {order.body_part}
                                          </Typography>
                                          <Chip 
                                            label="Completed" 
                                            color="success"
                                            size="small"
                                          />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                          Ordered: {formatDate(order.ordered_at)}
                                        </Typography>
                                        {order.result && (
                                          <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                            <Typography variant="subtitle2" gutterBottom color="primary">
                                              Radiologist Report:
                                            </Typography>
                                            <Typography variant="body2">
                                              {order.result}
                                            </Typography>
                                          </Box>
                                        )}
                                        {order.clinical_notes && (
                                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                            Clinical Notes: {order.clinical_notes}
                                          </Typography>
                                        )}
                                        {order.differential_diagnosis && (
                                          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                                            <Typography variant="subtitle2" gutterBottom color="warning.dark">
                                              Differential Diagnosis:
                                            </Typography>
                                            <Typography variant="body2">
                                              {order.differential_diagnosis}
                                            </Typography>
                                          </Box>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </List>
                              ) : (
                                <Alert severity="info">No completed imaging results available</Alert>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Summary */}
                        <Grid item xs={12}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Results Summary
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                                    <Typography variant="h4" color="success.dark">
                                      {labOrders.filter(order => order.status === 'completed').length}
                                    </Typography>
                                    <Typography variant="body2" color="success.dark">
                                      Completed Lab Tests
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                                    <Typography variant="h4" color="info.dark">
                                      {imagingOrders.filter(order => order.status === 'completed').length}
                                    </Typography>
                                    <Typography variant="body2" color="info.dark">
                                      Completed Imaging Studies
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                                    <Typography variant="h4" color="warning.dark">
                                      {labOrders.filter(order => order.status === 'ordered').length + imagingOrders.filter(order => order.status === 'ordered').length}
                                    </Typography>
                                    <Typography variant="body2" color="warning.dark">
                                      Pending Tests
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}



              {/* Billing Tab */}
                  {activeTab === 7 && billingStatus && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Billing Information</Typography>
                    <Button
                      variant="contained"
                      startIcon={<PaymentIcon />}
                      onClick={() => setBillingDialog(true)}
                    >
                      Create Bill
                    </Button>
                  </Box>
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
              </Grid>


            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Medical Note Dialog */}
      <Dialog open={medicalNoteDialog} onClose={() => setMedicalNoteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Medical Note</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Medical Note"
                value={medicalNote}
                onChange={(e) => setMedicalNote(e.target.value)}
                placeholder="Enter patient symptoms, observations, or clinical notes..."
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Diagnosis (Optional)"
                value={medicalNoteData.diagnosis || ''}
                onChange={(e) => setMedicalNoteData({ ...medicalNoteData, diagnosis: e.target.value })}
                placeholder="e.g., Common cold, Hypertension"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Advice (Optional)"
                value={medicalNoteData.advice || ''}
                onChange={(e) => setMedicalNoteData({ ...medicalNoteData, advice: e.target.value })}
                placeholder="e.g., Rest, drink fluids, follow up in 1 week"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMedicalNoteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddMedicalNote}
            disabled={addingNote || !medicalNote.trim()}
            startIcon={<SaveIcon />}
          >
            {addingNote ? 'Adding...' : 'Add Note'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lab Order Dialog */}
      <Dialog open={labOrderDialog} onClose={() => setLabOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Lab Test</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Test Name"
                value={labOrder.test_name}
                onChange={(e) => setLabOrder({ ...labOrder, test_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={labOrder.priority}
                  onChange={(e) => setLabOrder({ ...labOrder, priority: e.target.value })}
                >
                  <MenuItem value="routine">Routine</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Clinical Notes"
                value={labOrder.clinical_notes}
                onChange={(e) => setLabOrder({ ...labOrder, clinical_notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabOrderDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitLabOrder}
            disabled={submittingLabOrder || !labOrder.test_name.trim()}
            startIcon={<SendIcon />}
          >
            {submittingLabOrder ? 'Submitting...' : 'Submit Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={prescriptionDialog} onClose={() => setPrescriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Prescription</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medication Name"
                value={prescription.medication_name}
                onChange={(e) => setPrescription({ ...prescription, medication_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dosage"
                value={prescription.dosage}
                onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Frequency"
                value={prescription.frequency}
                onChange={(e) => setPrescription({ ...prescription, frequency: e.target.value })}
                placeholder="e.g., Twice daily"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration"
                value={prescription.duration}
                onChange={(e) => setPrescription({ ...prescription, duration: e.target.value })}
                placeholder="e.g., 7 days"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={prescription.quantity}
                onChange={(e) => setPrescription({ ...prescription, quantity: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Instructions"
                value={prescription.instructions}
                onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
                placeholder="Special instructions for the patient..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrescriptionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitPrescription}
            disabled={submittingPrescription || !prescription.medication_name.trim() || !prescription.dosage.trim()}
            startIcon={<SendIcon />}
          >
            {submittingPrescription ? 'Creating...' : 'Create Prescription'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Imaging Order Dialog */}
      <Dialog open={imagingOrderDialog} onClose={() => setImagingOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Imaging</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Imaging Type"
                value={imagingOrder.imaging_type}
                onChange={(e) => setImagingOrder({ ...imagingOrder, imaging_type: e.target.value })}
                placeholder="e.g., X-Ray, MRI, CT Scan, Ultrasound"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Body Part"
                value={imagingOrder.body_part}
                onChange={(e) => setImagingOrder({ ...imagingOrder, body_part: e.target.value })}
                placeholder="e.g., Chest, Abdomen, Head"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={imagingOrder.priority}
                  onChange={(e) => setImagingOrder({ ...imagingOrder, priority: e.target.value })}
                >
                  <MenuItem value="routine">Routine</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Clinical Notes"
                value={imagingOrder.clinical_notes}
                onChange={(e) => setImagingOrder({ ...imagingOrder, clinical_notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Differential Diagnosis"
                value={imagingOrder.differential_diagnosis}
                onChange={(e) => setImagingOrder({ ...imagingOrder, differential_diagnosis: e.target.value })}
                placeholder="List possible diagnoses to rule out..."
                helperText="Enter suspected conditions or differential diagnoses to guide the imaging interpretation"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImagingOrderDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitImagingOrder}
            disabled={submittingImagingOrder || !imagingOrder.imaging_type.trim()}
            startIcon={<SendIcon />}
          >
            {submittingImagingOrder ? 'Submitting...' : 'Submit Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Billing Dialog */}
      <Dialog open={billingDialog} onClose={() => setBillingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Bill</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Bill Items</Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <MedicalIcon />
              </ListItemIcon>
              <ListItemText
                primary="Consultation Fee"
                secondary="Outpatient consultation"
              />
              <ListItemSecondaryAction>
                <Typography variant="body2" color="primary">
                  {formatCurrency(50)}
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
            {labOrders.length > 0 && (
              <ListItem>
                <ListItemIcon>
                  <LabIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Lab Tests"
                  secondary={`${labOrders.length} test(s) ordered`}
                />
                <ListItemSecondaryAction>
                  <Typography variant="body2" color="primary">
                    {formatCurrency(labOrders.length * 25)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            )}
            {prescriptions.length > 0 && (
              <ListItem>
                <ListItemIcon>
                  <MedicationIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Medications"
                  secondary={`${prescriptions.length} prescription(s)`}
                />
                <ListItemSecondaryAction>
                  <Typography variant="body2" color="primary">
                    {formatCurrency(prescriptions.length * 30)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            )}
            {imagingOrders.length > 0 && (
              <ListItem>
                <ListItemIcon>
                  <ImagingIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Imaging"
                  secondary={`${imagingOrders.length} imaging order(s)`}
                />
                <ListItemSecondaryAction>
                  <Typography variant="body2" color="primary">
                    {formatCurrency(imagingOrders.length * 100)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Total Amount</Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(50 + (labOrders.length * 25) + (prescriptions.length * 30) + (imagingOrders.length * 100))}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillingDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateBill}
            startIcon={<PaymentIcon />}
          >
            Create Bill
          </Button>
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