import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera,
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
  Image
} from '@mui/icons-material';
import DICOMViewer from '../components/imaging/DICOMViewer'; // Correct path for DICOMViewer

const Imaging = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reportText, setReportText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Mock data for imaging patients
  const imagingPatients = [
    {
      id: 'IMG001',
      patientName: 'John Doe',
      patientId: 'P1001',
      age: 45,
      gender: 'Male',
      studyDate: '2024-03-15',
      modality: 'CT',
      bodyPart: 'Chest',
      status: 'completed',
      priority: 'routine',
      referringPhysician: 'Dr. Smith',
      differentialDiagnosis: ['Pneumonia', 'Pulmonary embolism', 'Lung cancer'],
      report: 'No significant findings. Lungs are clear. No evidence of consolidation or mass lesions.',
      imageUrl: 'https://example.com/ct-chest.jpg',
      aiAnalysis: {
        imageAnalysis: 'Normal lung parenchyma. No significant abnormalities detected.',
        reportAnalysis: 'Report is consistent with normal findings.',
        diagnosis: 'Normal chest CT',
        recommendations: [
          'No immediate follow-up required',
          'Routine annual screening recommended'
        ]
      }
    },
    {
      id: 'IMG002',
      patientName: 'Jane Smith',
      patientId: 'P1002',
      age: 32,
      gender: 'Female',
      studyDate: '2024-03-15',
      modality: 'MRI',
      bodyPart: 'Brain',
      status: 'pending',
      priority: 'urgent',
      referringPhysician: 'Dr. Johnson',
      differentialDiagnosis: ['Multiple sclerosis', 'Brain tumor', 'Vascular malformation'],
      report: 'Pending',
      imageUrl: null,
      aiAnalysis: null
    },
    {
      id: 'IMG003',
      patientName: 'Robert Brown',
      patientId: 'P1003',
      age: 58,
      gender: 'Male',
      studyDate: '2024-03-14',
      modality: 'X-Ray',
      bodyPart: 'Chest',
      status: 'completed',
      priority: 'routine',
      referringPhysician: 'Dr. Williams',
      report: 'Bilateral pulmonary infiltrates consistent with pneumonia.',
      imageUrl: 'https://example.com/chest-xray.jpg',
      aiAnalysis: {
        imageAnalysis: 'Bilateral infiltrates present. No pleural effusion.',
        reportAnalysis: 'Findings consistent with pneumonia.',
        diagnosis: 'Community-acquired pneumonia',
        recommendations: [
          'Antibiotic therapy recommended',
          'Follow-up chest X-ray in 2 weeks',
          'Consider CT if no improvement'
        ]
      }
    }
  ];

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setReportText(patient.report);
    setAiAnalysis(patient.aiAnalysis);
  };

  const handleReportChange = (event) => {
    setReportText(event.target.value);
  };

  const handleSubmitToDoctor = () => {
    // In a real app, this would send the report to the doctor
    console.log('Submitting report to doctor:', reportText);
  };

  const handleImageUpload = (event) => {
    // In a real app, this would handle file upload
    console.log('Uploading image:', event.target.files[0]);
  };

  const handleReportUpload = (event) => {
    // In a real app, this would handle file upload
    console.log('Uploading report:', event.target.files[0]);
  };

  // Filter patients based on search query and status
  const filteredPatients = imagingPatients.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
                <PhotoCamera sx={{ mr: 1 }} /> Imaging Patients
              </Typography>

              {/* Search Bar */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />

              {/* Filters */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Filter by Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['all', 'pending', 'completed'].map((status) => (
                    <Chip
                      key={status}
                      label={status.charAt(0).toUpperCase() + status.slice(1)}
                      onClick={() => setFilterStatus(status)}
                      color={filterStatus === status ? 'primary' : 'default'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Patient List */}
              <List sx={{ 
                flex: 1,
                overflow: 'auto',
                '& .MuiListItem-root': {
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }
              }}>
                {filteredPatients.map((patient) => (
                  <React.Fragment key={patient.id}>
                    <ListItem 
                      button 
                      selected={selectedPatient?.id === patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        width: '100%',
                        mb: 1
                      }}>
                        <Typography variant="subtitle2">
                          {patient.patientName}
                        </Typography>
                        <Chip 
                          label={patient.status} 
                          size="small"
                          color={patient.status === 'completed' ? 'success' : 'warning'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {patient.modality} - {patient.bodyPart}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {patient.studyDate} · {patient.referringPhysician}
                      </Typography>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content - Patient Details and Imaging */}
        <Grid item xs={12} md={6}>
          {selectedPatient ? (
            <Card sx={{ 
              boxShadow: 3,
              height: 'calc(100vh - 100px)',
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
                      {selectedPatient.patientName}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID: {selectedPatient.patientId} | Age: {selectedPatient.age} | Gender: {selectedPatient.gender}
                    </Typography>
                  </Box>
                  <Chip 
                    label={selectedPatient.priority} 
                    color={selectedPatient.priority === 'urgent' ? 'error' : 'primary'}
                  />
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
                    <Image sx={{ mr: 1 }} /> Imaging Study
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
              
              {selectedPatient ? (
                <>
                  {selectedPatient.status === 'pending' ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                      Complete the study to get AI analysis
                    </Typography>
                  ) : aiAnalysis ? (
                    <>
                      {/* Image Analysis */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                          Image Analysis
                        </Typography>
                        <Box sx={{ 
                          p: 1.5, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: 'info.light',
                          boxShadow: 1
                        }}>
                          <Typography variant="body2">
                            {aiAnalysis.imageAnalysis}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Report Analysis */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                          Report Analysis
                        </Typography>
                        <Box sx={{ 
                          p: 1.5, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: 'info.light',
                          boxShadow: 1
                        }}>
                          <Typography variant="body2">
                            {aiAnalysis.reportAnalysis}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Diagnosis */}
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

                      {/* Recommendations */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                          Recommendations
                        </Typography>
                        {aiAnalysis.recommendations?.map((rec, index) => (
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
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Select a patient to view AI analysis
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Imaging;