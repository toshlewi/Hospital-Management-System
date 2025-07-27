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
  Alert
} from '@mui/material';
import {
  PhotoCamera,
  History,
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
  Image as ImagingIcon,
  Assignment,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DICOMViewer from '../components/imaging/DICOMViewer'; // Correct path for DICOMViewer
import { patientAPI } from '../services/api';

const Imaging = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [imagingPatients, setImagingPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reportText, setReportText] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [reportSubmitLoading, setReportSubmitLoading] = useState(false);
  const [reportSubmitSuccess, setReportSubmitSuccess] = useState('');
  const [reportSubmitError, setReportSubmitError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchImagingOrders = useCallback(async () => {
    setLoading(true);
    try {
      const allPatients = await patientAPI.getAllPatients();
      let imagingOrders = [];
      
      for (const patient of allPatients) {
        try {
          const orders = await patientAPI.getTestOrders(patient.patient_id);
          console.log(`Imaging orders for patient ${patient.patient_id}:`, orders);
          // Filter for imaging orders - look for orders with imaging_type or specific imaging test types
          const imagingOrdersForPatient = orders.filter(o => {
            // Check if it has imaging_type field (new imaging orders)
            const hasImagingType = o.imaging_type && o.imaging_type.trim();
            // Check if it's a known imaging test type
            const isImagingTestType = o.test_types && o.test_types.name && 
                                    ['x-ray', 'mri', 'ct scan', 'ultrasound', 'mammography', 'angiography', 'fluoroscopy'].includes(
                                      o.test_types.name.toLowerCase()
                                    );
            // Check if test_type is 'imaging' (old orders)
            const isImagingType = o.test_types && o.test_types.name && 
                                o.test_types.name.toLowerCase() === 'imaging';
            
            const isImaging = hasImagingType || isImagingTestType || isImagingType;
            console.log(`Order ${o.order_id}: test_type=${o.test_types?.name}, imaging_type=${o.imaging_type}, isImaging=${isImaging}`);
            return isImaging;
          });
          
          if (imagingOrdersForPatient.length > 0) {
            imagingOrdersForPatient.forEach(order => {
              order.patient = patient;
              order.order_type = 'imaging';
            });
            imagingOrders = imagingOrders.concat(imagingOrdersForPatient);
          }
        } catch (error) {
          console.error(`Error fetching orders for patient ${patient.patient_id}:`, error);
        }
      }
      
      setImagingPatients(imagingOrders);
    } catch (err) {
      console.error('Error fetching imaging orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImagingOrders();
  }, [fetchImagingOrders]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setReportText(patient.result || '');
  };

  const handleReportChange = (event) => {
    setReportText(event.target.value);
  };

  const handleSubmitToDoctor = async () => {
    if (!selectedPatient) return;
    setReportSubmitLoading(true);
    setReportSubmitSuccess('');
    setReportSubmitError('');
    try {
      await patientAPI.updateTestOrder(selectedPatient.order_id, {
        result: reportText,
        status: 'completed'
      });
      setReportSubmitSuccess('Report submitted and test marked as completed!');
      await fetchImagingOrders(); // Always refresh after submit
    } catch (err) {
      setReportSubmitError('Failed to submit report.');
    } finally {
      setReportSubmitLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    if (!selectedPatient) return;
    setImageUploadLoading(true);
    setImageUploadSuccess('');
    setImageUploadError('');
    try {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      formData.append('doctor_id', selectedPatient.doctor_id || 1); // fallback
      formData.append('description', 'Imaging study upload');
      formData.append('test_order_id', selectedPatient.order_id);
      await patientAPI.addImaging(selectedPatient.patient_id, formData);
      setImageUploadSuccess('Image uploaded successfully!');
      await fetchImagingOrders(); // Always refresh after upload
    } catch (err) {
      setImageUploadError('Failed to upload image.');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleReportUpload = (event) => {
    // In a real app, this would handle file upload
    console.log('Uploading report:', event.target.files[0]);
  };

  // Filter patients based on search query and status
  const filteredPatients = imagingPatients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      (`${patient.patient?.first_name || ''} ${patient.patient?.last_name || ''}`).toLowerCase().includes(searchLower) ||
      String(patient.patient?.patient_id).includes(searchQuery)
    );
    const matchesStatus = filterStatus === 'all' || (patient.status && patient.status.toLowerCase() === filterStatus);
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      overflowX: 'hidden',
      p: 0
    }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ImagingIcon fontSize="large" /> Imaging Department
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchImagingOrders}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 120px)', width: '100%', px: 4, m: 0 }}>
        {/* Left Sidebar - Imaging Patients */}
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
                <ImagingIcon sx={{ mr: 1 }} /> Imaging Patients
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
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : imagingPatients.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No imaging orders found
                  </Typography>
                ) : (
                  <List dense>
                    {filteredPatients.map((patient) => (
                      <ListItem 
                        key={patient.order_id}
                        button
                        selected={selectedPatient?.order_id === patient.order_id}
                        onClick={() => handlePatientSelect(patient)}
                        sx={{ 
                          mb: 1, 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemText
                          primary={`${patient.patient?.first_name || 'N/A'} ${patient.patient?.last_name || ''}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {patient.test_types?.name || patient.imaging_type || 'Imaging Test'}
                              </Typography>
                              <Chip 
                                label={patient.status || 'N/A'}
                                color={patient.status === 'completed' ? 'success' : 'warning'}
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

        {/* Main Content - Imaging Details */}
        <Grid item xs={12} md={8}>
          {selectedPatient ? (
            <Card sx={{ 
              boxShadow: 3,
              height: '100%',
              overflow: 'auto'
            }}>
              <CardContent sx={{ p: 3 }}>
                {/* Patient Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ color: 'primary.main' }}>
                      {selectedPatient.patient?.first_name || 'N/A'} {selectedPatient.patient?.last_name || ''}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID: {selectedPatient.patient?.patient_id || 'N/A'} | Gender: {selectedPatient.patient?.gender || 'N/A'}
                    </Typography>
                  </Box>
                  <Chip 
                    label={selectedPatient.priority} 
                    color={selectedPatient.priority === 'urgent' ? 'error' : 'primary'}
                  />
                </Box>

                {/* Detailed Test Information */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    <Assignment sx={{ mr: 1 }} /> Test Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Imaging Type
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          {selectedPatient.test_types?.name || selectedPatient.imaging_type || 'X-Ray'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Body Part
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedPatient.body_part || 'Not specified'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Clinical Notes
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {selectedPatient.clinical_notes || 'No clinical notes provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Differential Diagnosis
                        </Typography>
                        {selectedPatient.differential_diagnosis ? (
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'warning.dark' }}>
                            {selectedPatient.differential_diagnosis}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No differential diagnosis provided
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Order Date
                        </Typography>
                        <Typography variant="body2">
                          {selectedPatient.ordered_at ? new Date(selectedPatient.ordered_at).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Requesting Physician
                        </Typography>
                        <Typography variant="body2">
                          {selectedPatient.doctor_first_name || 'Dr.'} {selectedPatient.doctor_last_name || 'Smith'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Differential Diagnosis */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main'
                  }}>
                    <LocalHospital sx={{ mr: 1 }} /> Differential Diagnosis
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedPatient.differentialDiagnosis?.map((diagnosis, index) => (
                      <Chip
                        key={index}
                        label={diagnosis}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Image Upload/Display */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main'
                  }}>
                    <ImagingIcon sx={{ mr: 1 }} /> Imaging Study
                  </Typography>
                  {selectedPatient.imageUrl ? (
                    <Box sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1,
                      textAlign: 'center'
                    }}>
                      <img 
                        src={selectedPatient.imageUrl} 
                        alt="Imaging study"
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center'
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<Upload />}
                        >
                          Upload Image
                        </Button>
                      </label>
                    </Box>
                  )}
                  {imageUploadSuccess && <Alert severity="success" sx={{ mt: 2 }}>{imageUploadSuccess}</Alert>}
                  {imageUploadError && <Alert severity="error" sx={{ mt: 2 }}>{imageUploadError}</Alert>}
                </Box>

                {/* Report Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main'
                  }}>
                    <Description sx={{ mr: 1 }} /> Radiologist Report
                  </Typography>
                  {selectedPatient.status === 'completed' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={reportText}
                      onChange={handleReportChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  ) : (
                    <Box sx={{ 
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center'
                    }}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleReportUpload}
                        style={{ display: 'none' }}
                        id="report-upload"
                      />
                      <label htmlFor="report-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<Upload />}
                        >
                          Upload Report
                        </Button>
                      </label>
                    </Box>
                  )}
                </Box>

                {/* Submit Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<Send />}
                  onClick={handleSubmitToDoctor}
                  disabled={selectedPatient.status === 'pending'}
                >
                  Submit to Doctor
                </Button>
                {reportSubmitSuccess && <Alert severity="success" sx={{ mt: 2 }}>{reportSubmitSuccess}</Alert>}
                {reportSubmitError && <Alert severity="error" sx={{ mt: 2 }}>{reportSubmitError}</Alert>}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ 
              boxShadow: 3, 
              height: 'calc(100vh - 100px)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'background.paper'
            }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" align="center">
                  Select a patient from the left to view details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Imaging;