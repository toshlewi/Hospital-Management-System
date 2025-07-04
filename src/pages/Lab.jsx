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
  Divider,
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
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
  TextareaAutosize,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  Science,
  History,
  AutoFixHigh,
  CheckCircle,
  Warning,
  Info,
  Add,
  Remove,
  Search,
  FilterList,
  Sort,
  Download,
  Share,
  Print,
  Upload,
  Edit,
  Send,
  LocalHospital,
  Description,
  Image,
  Email,
  AttachFile
} from '@mui/icons-material';
import { patientAPI, aiAPI } from '../services/api';
import { useDebounce } from 'use-debounce';

const Lab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reportText, setReportText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [labOrders, setLabOrders] = useState([]);
  const [patientsWithOrders, setPatientsWithOrders] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [resultText, setResultText] = useState('');
  const [resultLoading, setResultLoading] = useState(false);
  const [resultSuccess, setResultSuccess] = useState('');
  const [resultError, setResultError] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [debouncedResultText] = useDebounce(resultText, 600);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Fetch lab orders and patients with orders from backend
  const fetchLabOrders = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const allPatients = await patientAPI.getAllPatients();
      let allLabOrders = [];
      let patientsWithLabOrders = [];
      for (const patient of allPatients) {
        const orders = await patientAPI.getTestOrders(patient.patient_id);
        const labOrdersForPatient = orders.filter(o => o.order_type === 'lab');
        if (labOrdersForPatient.length > 0) {
          patientsWithLabOrders.push(patient);
        }
        labOrdersForPatient.forEach(order => {
          order.patient = patient;
        });
        allLabOrders = allLabOrders.concat(labOrdersForPatient);
      }
      setLabOrders(allLabOrders);
      setPatientsWithOrders(patientsWithLabOrders);
    } catch (err) {
      setFetchError('Failed to fetch lab orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabOrders();
  }, [fetchLabOrders]);

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setReportText(test.report);
    setAiAnalysis(test.aiAnalysis);
  };

  const handleReportChange = (event) => {
    setReportText(event.target.value);
  };

  const handleSendToDoctor = () => {
    setOpenSendDialog(true);
  };

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

  const handleResultUpload = (event) => {
    // In a real app, this would handle file upload
    console.log('Uploading results:', event.target.files[0]);
  };

  // Sidebar: Filtered patients
  const filteredPatients = patientsWithOrders.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (`${p.first_name} ${p.last_name}`).toLowerCase().includes(searchLower) ||
      String(p.patient_id).includes(searchQuery)
    );
  });

  // Main: Filtered lab orders for selected patient
  const patientLabOrders = selectedPatient
    ? labOrders.filter(o => o.patient.patient_id === selectedPatient.patient_id && (filterStatus === 'all' || o.status === filterStatus))
    : [];

  // Status chip color
  const statusColor = status => {
    if (status === 'completed') return 'success';
    if (status === 'ordered') return 'warning';
    return 'default';
  };

  // Select a patient
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSelectedOrder(null);
    setResultText('');
    setResultSuccess('');
    setResultError('');
  };

  // Select a test order
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
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
      fetchLabOrders();
    } catch (err) {
      setResultError('Failed to save result.');
    } finally {
      setResultLoading(false);
    }
  };

  // Real-time AI analysis of result
  useEffect(() => {
    if (selectedOrder && debouncedResultText) {
      setAiLoading(true);
      setAiError('');
      setAiAnalysis(null);
      aiAPI.diagnose({ note_text: debouncedResultText })
        .then(result => setAiAnalysis(result))
        .catch(() => setAiError('AI analysis failed.'))
        .finally(() => setAiLoading(false));
    } else {
      setAiAnalysis(null);
    }
  }, [selectedOrder, debouncedResultText]);

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
    } catch (err) {
      setUploadError('Failed to upload file.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 3,
        mt: 8,
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5'
      }}
    >
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

      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Science fontSize="large" /> Lab Department
      </Typography>

      <Grid container spacing={3}>
        {/* Left Sidebar - Patient List */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            height: 'calc(100vh - 100px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
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
                <Science sx={{ mr: 1 }} /> Lab Patients
              </Typography>
              <TextField
                label="Search patients by name or ID"
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : fetchError ? (
                  <Alert severity="error">{fetchError}</Alert>
                ) : filteredPatients.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No patients found.</Typography>
                ) : (
                  filteredPatients.map(patient => (
                    <Card
                      key={patient.patient_id}
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        backgroundColor: selectedPatient && selectedPatient.patient_id === patient.patient_id ? 'primary.light' : 'white',
                        border: selectedPatient && selectedPatient.patient_id === patient.patient_id ? `2px solid ${theme.palette.primary.main}` : '1px solid #eee',
                        transition: 'background 0.2s, border 0.2s'
                      }}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {patient.first_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">{patient.first_name} {patient.last_name}</Typography>
                          <Typography variant="body2" color="text.secondary">ID: {patient.patient_id}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Main Area - Lab Orders */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, minHeight: 'calc(100vh - 100px)' }}>
            <CardContent>
              {selectedPatient ? (
                <>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                      {selectedPatient.first_name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h5">{selectedPatient.first_name} {selectedPatient.last_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gender: {selectedPatient.gender} | DOB: {selectedPatient.date_of_birth} | Status: {selectedPatient.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contact: {selectedPatient.contact_number} | Email: {selectedPatient.email}
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
                              <TableCell>{order.test_name}</TableCell>
                              <TableCell>{order.doctor_first_name} {order.doctor_last_name}</TableCell>
                              <TableCell>
                                <Chip
                                  label={order.status}
                                  color={statusColor(order.status)}
                                  icon={order.status === 'completed' ? <CheckCircle /> : <Warning />}
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
                      <Typography variant="h6" sx={{ mb: 1 }}>Enter/Update Result for: <b>{selectedOrder.test_name}</b></Typography>
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
                          <Description sx={{ mr: 1 }} /> Upload Lab Result (Image or Document)
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
                              startIcon={<Upload />}
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
        {/* Right Sidebar - AI Analysis */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            height: 'calc(100vh - 100px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
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
                <AutoFixHigh sx={{ mr: 1 }} /> AI Analysis
              </Typography>
              {selectedOrder ? (
                resultText.trim() === '' ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Enter a result to get AI analysis
                  </Typography>
                ) : aiLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : aiError ? (
                  <Alert severity="error">{aiError}</Alert>
                ) : aiAnalysis ? (
                  <>
                    {/* Diagnosis */}
                    {aiAnalysis.diagnosis && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                          AI Diagnosis
                        </Typography>
                        <Box sx={{ 
                          p: 1.5, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: 'success.light',
                          boxShadow: 1
                        }}>
                          <Typography variant="body2">
                            {aiAnalysis.diagnosis}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {/* Recommendations */}
                    {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                          Recommendations
                        </Typography>
                        {aiAnalysis.recommendations.map((rec, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              p: 1.5, 
                              mb: 1, 
                              borderRadius: 1,
                              bgcolor: 'warning.light',
                              boxShadow: 1
                            }}
                          >
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Info fontSize="small" sx={{ mr: 1, mt: '2px' }} />
                              {rec}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {/* Raw AI output fallback */}
                    {!aiAnalysis.diagnosis && !aiAnalysis.recommendations && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {typeof aiAnalysis === 'string' ? aiAnalysis : JSON.stringify(aiAnalysis)}
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                )
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Select a test order to view AI analysis
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
            startIcon={<Send />}
          >
            Send Results
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Lab; 