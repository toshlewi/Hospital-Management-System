import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider
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
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { patientAPI } from '../services/api';
import { useDebounce } from 'use-debounce';

const Lab = () => {
  const theme = useTheme();
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [labOrders, setLabOrders] = useState([]);
  const [patientsWithOrders, setPatientsWithOrders] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [resultText, setResultText] = useState('');
  const [resultLoading, setResultLoading] = useState(false);
  const [resultSuccess, setResultSuccess] = useState('');
  const [resultError, setResultError] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [debouncedResultText] = useDebounce(resultText, 600);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [patientDialog, setPatientDialog] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [testOrders, setTestOrders] = useState([]);

  // Fetch lab orders and patients with orders from backend
  const fetchLabOrders = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const allPatients = await patientAPI.getAllPatients();
      let allLabOrders = [];
      let patientsWithLabOrders = [];
      
      for (const patient of allPatients) {
        try {
        const orders = await patientAPI.getTestOrders(patient.patient_id);
          console.log(`Orders for patient ${patient.patient_id}:`, orders);
          // Show only lab orders - exclude imaging orders
          const labOrdersForPatient = orders.filter(o => {
            // Exclude orders with imaging_type field (imaging orders)
            const hasImagingType = o.imaging_type && o.imaging_type.trim();
            // Exclude known imaging test types
            const isImagingTestType = o.test_types && o.test_types.name && 
                                    ['x-ray', 'mri', 'ct scan', 'ultrasound', 'mammography', 'angiography', 'fluoroscopy'].includes(
                                      o.test_types.name.toLowerCase()
                                    );
            // Exclude if test_type is 'imaging' (old imaging orders)
            const isImagingType = o.test_types && o.test_types.name && 
                                o.test_types.name.toLowerCase() === 'imaging';
            
            const isImaging = hasImagingType || isImagingTestType || isImagingType;
            console.log(`Order ${o.order_id}: test_type=${o.test_types?.name}, imaging_type=${o.imaging_type}, isImaging=${isImaging}`);
            return !isImaging; // Show only non-imaging orders (lab orders)
          });
          
        if (labOrdersForPatient.length > 0) {
          patientsWithLabOrders.push(patient);
        labOrdersForPatient.forEach(order => {
          order.patient = patient;
              order.order_type = 'lab';
        });
        allLabOrders = allLabOrders.concat(labOrdersForPatient);
          } else if (orders.length > 0) {
            // Fallback: if no lab orders found, show all orders for debugging
            console.log(`No lab orders found for patient ${patient.patient_id}, showing all orders:`, orders);
            orders.forEach(order => {
              order.patient = patient;
              order.order_type = 'unknown';
            });
            allLabOrders = allLabOrders.concat(orders);
          }
        } catch (error) {
          console.error(`Error fetching orders for patient ${patient.patient_id}:`, error);
        }
      }
      
      setLabOrders(allLabOrders);
      setPatientsWithOrders(patientsWithLabOrders);
    } catch (err) {
      console.error('Error fetching lab orders:', err);
      setFetchError('Failed to fetch lab orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load lab orders on component mount only
  useEffect(() => {
    fetchLabOrders();
  }, [fetchLabOrders]);



  const handleConfirmSend = () => {
    // In a real app, this would send the results to the doctor
    console.log('Sending results to doctor:', selectedTest.requestingPhysician);
    setOpenSendDialog(false);
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  };

  const handleCancelSend = () => {
    setOpenSendDialog(false);
  };

  // Sidebar: Filtered patients
  const filteredPatients = labOrders.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      (`${patient.patient?.first_name || ''} ${patient.patient?.last_name || ''}`).toLowerCase().includes(searchLower) ||
      String(patient.patient?.patient_id).includes(searchQuery)
    );
    const matchesStatus = filterStatus === 'all' || (patient.status && patient.status.toLowerCase() === filterStatus);
    return matchesSearch && matchesStatus;
  });

  // Main: Filtered lab orders for selected patient
  const patientLabOrders = selectedPatient
    ? labOrders.filter(o => {
        const selectedPatientId = selectedPatient.patient?.patient_id || selectedPatient.patient_id;
        const orderPatientId = o.patient?.patient_id;
        return orderPatientId === selectedPatientId && (filterStatus === 'all' || o.status === filterStatus);
      })
    : [];

  // Status chip color
  const statusColor = status => {
    if (status === 'completed') return 'success';
    if (status === 'ordered') return 'warning';
    return 'default';
  };

  // Select a patient
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setSelectedOrder(null);
    setResultText('');
    setResultSuccess('');
    setResultError('');
    await loadPatientDetails(patient.patient_id);
  };

  // Select a test order
  const handleSelectOrder = (order) => {
    console.log('Selected order:', order);
    console.log('Order patient:', order.patient);
    setSelectedOrder(order);
    setSelectedPatient(order); // Set the selected patient to the order's patient
    setResultText(order.result || '');
    setResultSuccess('');
    setResultError('');
  };

  // Save lab result
  const handleSaveResult = async () => {
    if (!selectedOrder) return;
    setResultLoading(true);
    setResultSuccess('');
    setResultError('');
    try {
      await patientAPI.updateTestOrder(selectedOrder.order_id, {
        result: resultText,
        status: 'completed'
      });
      setResultSuccess('Result saved and sent to doctor!');
      await fetchLabOrders(); // Always refresh after save
    } catch (err) {
      setResultError('Failed to save result.');
    } finally {
      setResultLoading(false);
    }
  };

  // Handle file upload
  const handleLabFileUpload = async (event) => {
    if (!selectedOrder) return;
    setUploadLoading(true);
    setUploadSuccess('');
    setUploadError('');
    try {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('order_id', selectedOrder.order_id);
      formData.append('description', `Lab result upload for order ${selectedOrder.order_id}`);
      const res = await patientAPI.uploadLabResult(selectedOrder.patient.patient_id, formData);
      setUploadSuccess('File uploaded successfully!');
      setUploadedFile({ path: res.file_path, type: file.type, name: file.name });
      await fetchLabOrders(); // Always refresh after upload
    } catch (err) {
      setUploadError('Failed to upload file.');
    } finally {
      setUploadLoading(false);
    }
  };

  const loadPatientDetails = async (patientId) => {
    try {
      const [details, orders] = await Promise.all([
        patientAPI.getPatientById(patientId),
        patientAPI.getTestOrders(patientId)
      ]);
      setPatientDetails(details);
      setTestOrders(orders || []);
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



  const getTestStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'ordered': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTestStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircleIcon />;
      case 'in_progress': return <ExpandMoreIcon />; // Placeholder for Pending icon
      case 'ordered': return <ExpandMoreIcon />; // Placeholder for Schedule icon
      case 'cancelled': return <ErrorIcon />;
      default: return <ExpandMoreIcon />; // Placeholder for Assignment icon
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };



  const getFilteredTestOrders = () => {
    if (filterStatus === 'all') return labOrders;
    return labOrders.filter(order => order.status?.toLowerCase() === filterStatus);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      overflowX: 'hidden',
      p: 0
    }}>
      {sendSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed', 
            top: 100, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1000,
            minWidth: 300
          }}
        >
          Results sent successfully to {selectedTest?.requestingPhysician}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LabIcon fontSize="large" /> Lab Department
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchLabOrders}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 140px)', width: '100%', px: 4, m: 0, overflow: 'hidden' }}>
        {/* Left Sidebar - Lab Patients */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Card sx={{ 
            boxShadow: 3,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
          }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              p: 2
            }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 2,
                color: 'primary.main'
              }}>
                <LabIcon sx={{ mr: 1 }} /> Lab Patients
              </Typography>
              
              <TextField
                label="Search patients by name or ID"
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : labOrders.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No lab orders found
                  </Typography>
                ) : (
                  <List dense>
                    {getFilteredTestOrders().map((order) => (
                      <ListItem 
                        key={order.order_id}
                        button
                        selected={selectedOrder?.order_id === order.order_id}
                        onClick={() => handleSelectOrder(order)}
                        sx={{ 
                          mb: 1, 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemText
                          primary={`${order.patient?.first_name || 'Unknown'} ${order.patient?.last_name || 'Patient'}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {order.test_types?.name || order.test_name}
                              </Typography>
                              {order.clinical_notes && (
                                <Typography variant="caption" color="text.primary">Notes: {order.clinical_notes}</Typography>
                              )}
                              <Chip 
                                label={order.status || 'N/A'}
                                color={statusColor(order.status)}
                                icon={order.status === 'completed' ? <CheckCircleIcon /> : <WarningIcon />}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content - Test Results */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Card sx={{ boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {selectedPatient ? (
                <>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                      {selectedPatient.patient?.first_name?.[0] || selectedPatient.first_name?.[0] || 'P'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5">
                        {selectedPatient.patient?.first_name || selectedPatient.first_name || 'N/A'} 
                        {selectedPatient.patient?.last_name || selectedPatient.last_name || ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gender: {selectedPatient.patient?.gender || selectedPatient.gender || 'N/A'} | 
                        DOB: {selectedPatient.patient?.date_of_birth || selectedPatient.date_of_birth || 'N/A'} | 
                        Status: {selectedPatient.status || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contact: {selectedPatient.patient?.contact_number || selectedPatient.contact_number || 'N/A'} | 
                        Email: {selectedPatient.patient?.email || selectedPatient.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                      onClick={() => setFilterStatus('all')}
                    >All</Button>
                    <Button
                      variant={filterStatus === 'ordered' ? 'contained' : 'outlined'}
                      onClick={() => setFilterStatus('ordered')}
                    >Ordered</Button>
                    <Button
                      variant={filterStatus === 'completed' ? 'contained' : 'outlined'}
                      onClick={() => setFilterStatus('completed')}
                    >Completed</Button>
                  </Box>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Test Name</TableCell>
                          <TableCell>Doctor</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Ordered At</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patientLabOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">No lab orders found.</TableCell>
                          </TableRow>
                        ) : (
                          patientLabOrders.map(order => (
                            <TableRow
                              key={order.order_id}
                              selected={selectedOrder && selectedOrder.order_id === order.order_id}
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleSelectOrder(order)}
                            >
                              <TableCell>{order.test_types?.name || order.test_name || 'Lab Test'}</TableCell>
                              <TableCell>{order.doctor_first_name || 'Dr.'} {order.doctor_last_name || 'Smith'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={order.status || 'N/A'}
                                  color={statusColor(order.status)}
                                  icon={order.status === 'completed' ? <CheckCircleIcon /> : <WarningIcon />}
                                />
                              </TableCell>
                              <TableCell>{order.ordered_at && new Date(order.ordered_at).toLocaleString()}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={e => { e.stopPropagation(); handleSelectOrder(order); }}
                                >View</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {selectedOrder && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Enter/Update Result for: <b>{selectedOrder.test_types?.name || selectedOrder.test_name || 'Lab Test'}</b></Typography>
                      
                      {/* Test Details Section */}
                      <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                          Test Details
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Test Type:</Typography>
                            <Typography variant="body1">{selectedOrder.test_types?.name || 'Not specified'}</Typography>
                          </Grid>
                          {selectedOrder.imaging_type && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary">Imaging Type:</Typography>
                              <Typography variant="body1">{selectedOrder.imaging_type}</Typography>
                            </Grid>
                          )}
                          {selectedOrder.body_part && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary">Body Part:</Typography>
                              <Typography variant="body1">{selectedOrder.body_part}</Typography>
                            </Grid>
                          )}
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Priority:</Typography>
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{selectedOrder.priority || 'Not specified'}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Requesting Physician:</Typography>
                            <Typography variant="body1">{selectedOrder.requesting_physician || 'Not specified'}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                            <Typography variant="body1">{selectedOrder.ordered_at ? new Date(selectedOrder.ordered_at).toLocaleDateString() : 'Not specified'}</Typography>
                          </Grid>
                          {selectedOrder.clinical_notes && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Clinical Notes:</Typography>
                              <Typography variant="body1">{selectedOrder.clinical_notes}</Typography>
                            </Grid>
                          )}
                          {selectedOrder.differential_diagnosis && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Differential Diagnosis:</Typography>
                              <Typography variant="body1">{selectedOrder.differential_diagnosis}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                      <TextField
                        label="Result"
                        multiline
                        minRows={3}
                        fullWidth
                        value={resultText}
                        onChange={e => setResultText(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      {/* File upload UI */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                          <DescriptionIcon sx={{ mr: 1 }} /> Upload Lab Result (Image or Document)
                        </Typography>
                        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 1, p: 3, textAlign: 'center' }}>
                          <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleLabFileUpload}
                            style={{ display: 'none' }}
                            id="lab-file-upload"
                          />
                          <label htmlFor="lab-file-upload">
                            <Button
                              component="span"
                              variant="outlined"
                              startIcon={<ImagingIcon />}
                              disabled={uploadLoading}
                            >
                              {uploadLoading ? 'Uploading...' : 'Upload File'}
                            </Button>
                          </label>
                          {uploadSuccess && <Alert severity="success" sx={{ mt: 2 }}>{uploadSuccess}</Alert>}
                          {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
                          {uploadedFile && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2">Uploaded: {uploadedFile.name}</Typography>
                              <Button
                                href={`/${uploadedFile.path}`.replace('backend/', '')}
                                target="_blank"
                                rel="noopener"
                                variant="text"
                                size="small"
                                sx={{ mt: 1 }}
                              >
                                View File
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      {resultSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resultSuccess}</Alert>}
                      {resultError && <Alert severity="error" sx={{ mb: 2 }}>{resultError}</Alert>}
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveResult}
                        disabled={resultLoading}
                      >
                        {resultLoading ? <CircularProgress size={24} /> : 'Save Result'}
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 8 }}>
                  Select a patient to view lab orders.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Send to Doctor Dialog */}
      <Dialog open={openSendDialog} onClose={handleCancelSend}>
        <DialogTitle>Send Results to Doctor</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to send the test results to {selectedTest?.requestingPhysician}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The results will be sent via the hospital's secure messaging system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSend}>Cancel</Button>
          <Button 
            onClick={handleConfirmSend} 
            variant="contained" 
            color="primary"
            startIcon={<SendIcon />}
          >
            Send Results
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Details Dialog */}
      <Dialog 
        open={patientDialog} 
        onClose={() => setPatientDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Patient Details & Test Orders
          </Box>
        </DialogTitle>
        <DialogContent>
          {patientDetails && (
            <Box>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Patient Info" />
                <Tab label="Test Orders" />
                <Tab label="Test Results" />
                <Tab label="Lab History" />
              </Tabs>

              {/* Patient Info Tab */}
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

              {/* Test Orders Tab */}
              {activeTab === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Test Orders</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        // Add new test order functionality
                        showSnackbar('Test order functionality coming soon', 'info');
                      }}
                    >
                      New Test Order
                    </Button>
                  </Box>
                  
                  {getFilteredTestOrders().length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Test Name</TableCell>
                            <TableCell>Ordered Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Doctor</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getFilteredTestOrders().map((order, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="subtitle2">
                                  {order.test_name || 'Lab Test'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {order.ordered_at ? formatDate(order.ordered_at) : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={getTestStatusIcon(order.status)}
                                  label={order.status || 'Unknown'}
                                  color={getTestStatusColor(order.status)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {order.doctor_name || 'Dr. Smith'}
                              </TableCell>
                              <TableCell>
                                <IconButton size="small">
                                  <ViewIcon />
                                </IconButton>
                                <IconButton size="small">
                                  <ImagingIcon />
                                </IconButton>
                                <IconButton size="small">
                                  <ReceiptIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">No test orders found for this patient</Alert>
                  )}
                </Box>
              )}

              {/* Test Results Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Test Results</Typography>
                  <Alert severity="info">
                    Test results will be displayed here once tests are completed and results are uploaded.
                  </Alert>
                </Box>
              )}

              {/* Lab History Tab */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Laboratory History</Typography>
                  <Stepper orientation="vertical">
                    {getFilteredTestOrders().map((order, index) => (
                      <Step key={index} active={true}>
                        <StepLabel>
                          <Typography variant="subtitle2">
                            {order.test_name || 'Lab Test'} - {formatDate(order.ordered_at)}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Status: {order.status || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ordered by: {order.doctor_name || 'Dr. Smith'}
                            </Typography>
                            {order.result && (
                              <Typography variant="body2" color="text.secondary">
                                Result: {order.result}
                              </Typography>
                            )}
                          </Box>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
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
    </Box>
  );
};

export default Lab; 