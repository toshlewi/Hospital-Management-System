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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
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

  // Mock data for lab tests
  const labTests = [
    {
      id: 'LAB001',
      patientName: 'John Doe',
      patientId: 'P1001',
      age: 45,
      gender: 'Male',
      testDate: '2024-03-15',
      testType: 'Complete Blood Count',
      status: 'completed',
      priority: 'routine',
      requestingPhysician: 'Dr. Smith',
      results: {
        wbc: '7.5 x10^9/L',
        rbc: '4.8 x10^12/L',
        hgb: '14.2 g/dL',
        hct: '42%',
        plt: '250 x10^9/L'
      },
      referenceRanges: {
        wbc: '4.5-11.0 x10^9/L',
        rbc: '4.5-5.5 x10^12/L',
        hgb: '13.5-17.5 g/dL',
        hct: '41-50%',
        plt: '150-450 x10^9/L'
      },
      report: 'All values within normal reference ranges.',
      aiAnalysis: {
        testAnalysis: 'Normal CBC results. No significant abnormalities detected.',
        reportAnalysis: 'Report is consistent with normal findings.',
        diagnosis: 'Normal CBC',
        recommendations: [
          'No immediate follow-up required',
          'Routine annual screening recommended'
        ]
      }
    },
    {
      id: 'LAB002',
      patientName: 'Jane Smith',
      patientId: 'P1002',
      age: 32,
      gender: 'Female',
      testDate: '2024-03-15',
      testType: 'Comprehensive Metabolic Panel',
      status: 'pending',
      priority: 'urgent',
      requestingPhysician: 'Dr. Johnson',
      results: null,
      referenceRanges: null,
      report: 'Pending',
      aiAnalysis: null
    },
    {
      id: 'LAB003',
      patientName: 'Robert Brown',
      patientId: 'P1003',
      age: 58,
      gender: 'Male',
      testDate: '2024-03-14',
      testType: 'Lipid Panel',
      status: 'completed',
      priority: 'routine',
      requestingPhysician: 'Dr. Williams',
      results: {
        totalCholesterol: '240 mg/dL',
        hdl: '45 mg/dL',
        ldl: '160 mg/dL',
        triglycerides: '180 mg/dL'
      },
      referenceRanges: {
        totalCholesterol: '<200 mg/dL',
        hdl: '>40 mg/dL',
        ldl: '<100 mg/dL',
        triglycerides: '<150 mg/dL'
      },
      report: 'Elevated total cholesterol and LDL levels. Borderline high triglycerides.',
      aiAnalysis: {
        testAnalysis: 'Abnormal lipid panel with elevated cholesterol and LDL.',
        reportAnalysis: 'Findings consistent with hyperlipidemia.',
        diagnosis: 'Hyperlipidemia',
        recommendations: [
          'Lifestyle modifications recommended',
          'Consider statin therapy',
          'Follow-up lipid panel in 3 months'
        ]
      }
    }
  ];

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

  // Filter tests based on search query and status
  const filteredTests = labTests.filter(test => {
    const matchesSearch = test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 4,
        mt: 12,
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5',
        '& .MuiCard-root': {
          height: 'calc(100vh - 140px)'
        }
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

      <Grid container spacing={3}>
        {/* Left Sidebar - Test List */}
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
                <Science sx={{ mr: 1 }} /> Lab Tests
              </Typography>

              {/* Search Bar */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search tests..."
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

              {/* Test List */}
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
                {filteredTests.map((test) => (
                  <React.Fragment key={test.id}>
                    <ListItem 
                      button 
                      selected={selectedTest?.id === test.id}
                      onClick={() => handleTestSelect(test)}
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
                          {test.patientName}
                        </Typography>
                        <Chip 
                          label={test.status} 
                          size="small"
                          color={test.status === 'completed' ? 'success' : 'warning'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {test.testType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {test.testDate} · {test.requestingPhysician}
                      </Typography>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content - Test Details */}
        <Grid item xs={12} md={6}>
          {selectedTest ? (
            <Card sx={{ 
              boxShadow: 3,
              height: 'calc(100vh - 100px)',
              overflow: 'auto'
            }}>
              <CardContent sx={{ p: 3 }}>
                {/* Test Header */}
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
                      {selectedTest.patientName}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID: {selectedTest.patientId} | Age: {selectedTest.age} | Gender: {selectedTest.gender}
                    </Typography>
                  </Box>
                  <Chip 
                    label={selectedTest.priority} 
                    color={selectedTest.priority === 'urgent' ? 'error' : 'primary'}
                  />
                </Box>

                {/* Test Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main'
                  }}>
                    <Science sx={{ mr: 1 }} /> Test Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Test Type
                      </Typography>
                      <Typography variant="body1">
                        {selectedTest.testType}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Requesting Physician
                      </Typography>
                      <Typography variant="body1">
                        {selectedTest.requestingPhysician}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Results Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main'
                  }}>
                    <Description sx={{ mr: 1 }} /> Test Results
                  </Typography>
                  {selectedTest.status === 'completed' ? (
                    <>
                      <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Parameter</TableCell>
                              <TableCell>Result</TableCell>
                              <TableCell>Reference Range</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(selectedTest.results).map(([key, value]) => (
                              <TableRow key={key}>
                                <TableCell>{key.toUpperCase()}</TableCell>
                                <TableCell>{value}</TableCell>
                                <TableCell>{selectedTest.referenceRanges[key]}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label="Normal" 
                                    size="small"
                                    color="success"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={reportText}
                        onChange={handleReportChange}
                        variant="outlined"
                        label="Interpretation"
                        sx={{ mb: 2 }}
                      />
                    </>
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
                        onChange={handleResultUpload}
                        style={{ display: 'none' }}
                        id="result-upload"
                      />
                      <label htmlFor="result-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<Upload />}
                        >
                          Upload Results
                        </Button>
                      </label>
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={handleSendToDoctor}
                    disabled={selectedTest.status === 'pending'}
                    fullWidth
                  >
                    Send to {selectedTest.requestingPhysician}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    disabled={selectedTest.status === 'pending'}
                  >
                    Download
                  </Button>
                </Box>
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
                  Select a test from the left to view details
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
              
              {selectedTest ? (
                <>
                  {selectedTest.status === 'pending' ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                      Complete the test to get AI analysis
                    </Typography>
                  ) : aiAnalysis ? (
                    <>
                      {/* Test Analysis */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                          Test Analysis
                        </Typography>
                        <Box sx={{ 
                          p: 1.5, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: 'info.light',
                          boxShadow: 1
                        }}>
                          <Typography variant="body2">
                            {aiAnalysis.testAnalysis}
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
                  Select a test to view AI analysis
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