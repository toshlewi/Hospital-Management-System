import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Card, CardContent, Button, Grid, Avatar, TextField, InputAdornment, Divider, CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Person as PersonIcon, Search as SearchIcon, History as HistoryIcon, NoteAdd as NoteAddIcon, Science as ScienceIcon, Medication as MedicationIcon, SmartToy as AIIcon, Image as ImageIcon, AutoFixHigh, Info } from '@mui/icons-material';
import { patientAPI, aiAPI } from '../../services/api';
import { useTheme } from '@mui/material/styles';
import { useDebounce } from 'use-debounce';

const Outpatient = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);
  const [tests, setTests] = useState([]);
  const [medications, setMedications] = useState([]);
  const [imaging, setImaging] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [doctorId, setDoctorId] = useState(1); // For demo, default to 1
  const [noteText, setNoteText] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');
  const [noteError, setNoteError] = useState('');
  const [testTypes, setTestTypes] = useState([]);
  const [selectedTestType, setSelectedTestType] = useState('');
  const [testOrderLoading, setTestOrderLoading] = useState(false);
  const [testOrderSuccess, setTestOrderSuccess] = useState('');
  const [testOrderError, setTestOrderError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiMedResult, setAiMedResult] = useState(null);
  const [aiMedLoading, setAiMedLoading] = useState(false);
  const [aiMedError, setAiMedError] = useState('');
  const theme = useTheme();

  // Add these constants for tab labels and icons
  const tabConfig = [
    { label: 'History', icon: <HistoryIcon /> },
    { label: 'New Note', icon: <NoteAddIcon /> },
    { label: 'Order Test', icon: <ScienceIcon /> },
    { label: 'Test Results', icon: <AutoFixHigh /> },
    { label: 'Prescribe', icon: <MedicationIcon /> },
    { label: 'Images', icon: <ImageIcon /> }
  ];

  const commonMeds = [
    'Paracetamol',
    'Amoxicillin',
    'Ibuprofen',
    'Ciprofloxacin',
    'Metformin',
    'Amlodipine',
    'Custom...'
  ];
  const [medName, setMedName] = useState('');
  const [customMedName, setCustomMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medInstructions, setMedInstructions] = useState('');
  const [medLoading, setMedLoading] = useState(false);
  const [medSuccess, setMedSuccess] = useState('');
  const [medError, setMedError] = useState('');

  // Debounced values for AI analysis
  const [debouncedNoteText] = useDebounce(noteText, 600);
  const [debouncedDiagnosis] = useDebounce(diagnosis, 600);
  const [debouncedAdvice] = useDebounce(advice, 600);
  const [debouncedMedName] = useDebounce(medName, 600);
  const [debouncedMedDosage] = useDebounce(medDosage, 600);
  const [debouncedMedInstructions] = useDebounce(medInstructions, 600);

  const commonLabTests = [
    { id: 1, name: 'CBC' },
    { id: 2, name: 'Malaria' },
    { id: 3, name: 'Blood Sugar' },
    { id: 4, name: 'Liver Function Test' },
    { id: 5, name: 'Renal Function Test' },
    { id: 6, name: 'HIV Test' },
    { id: 7, name: 'Urinalysis' },
  ];
  const imagingStudies = [
    'Chest X-ray',
    'Abdominal Ultrasound',
    'CT Scan',
    'MRI',
    'Echocardiogram',
    'Mammogram',
    'Pelvic Ultrasound',
    'Other...'
  ];
  const [selectedLabTest, setSelectedLabTest] = useState('');
  const [selectedImaging, setSelectedImaging] = useState('');
  const [imagingOrderLoading, setImagingOrderLoading] = useState(false);
  const [imagingOrderSuccess, setImagingOrderSuccess] = useState('');
  const [imagingOrderError, setImagingOrderError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getAllPatients();
      setPatients(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (id) => {
    const patient = patients.find(p => p.patient_id === Number(id));
    setSelectedPatient(patient);
  };

  // Fetch patient history when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      fetchHistory(selectedPatient.patient_id);
    } else {
      setNotes([]); setTests([]); setMedications([]); setImaging([]);
    }
  }, [selectedPatient]);

  const fetchHistory = async (patientId) => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const [notesData, testsData, medsData, imagingData] = await Promise.all([
        patientAPI.getMedicalNotes(patientId),
        patientAPI.getTestOrders(patientId),
        patientAPI.getMedications(patientId),
        patientAPI.getImaging(patientId)
      ]);
      setNotes(notesData);
      setTests(testsData);
      setMedications(medsData);
      setImaging(imagingData);
    } catch (err) {
      setHistoryError('Failed to load patient history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle new note submit
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setNoteLoading(true);
    setNoteSuccess('');
    setNoteError('');
    try {
      await patientAPI.addMedicalNote(selectedPatient.patient_id, {
        doctor_id: doctorId,
        note_text: noteText,
        diagnosis,
        advice
      });
      setNoteSuccess('Note saved successfully!');
      setNoteText(''); setDiagnosis(''); setAdvice('');
      fetchHistory(selectedPatient.patient_id); // Refresh history
    } catch (err) {
      setNoteError('Failed to save note.');
    } finally {
      setNoteLoading(false);
    }
  };

  // Fetch test types on mount
  useEffect(() => {
    fetchTestTypes();
  }, []);

  const fetchTestTypes = async () => {
    try {
      const response = await patientAPI.getAllTestTypes ? await patientAPI.getAllTestTypes() : [];
      setTestTypes(response);
    } catch (err) {
      setTestTypes([]);
    }
  };

  // Handle test order submit
  const handleTestOrderSubmit = async (e) => {
    e.preventDefault();
    setTestOrderLoading(true);
    setTestOrderSuccess('');
    setTestOrderError('');
    try {
      await patientAPI.addTestOrder(selectedPatient.patient_id, {
        doctor_id: doctorId,
        test_type_id: Number(selectedLabTest),
        order_type: 'lab'
      });
      setTestOrderSuccess('Test ordered successfully!');
      setSelectedLabTest('');
      fetchHistory(selectedPatient.patient_id);
    } catch (err) {
      setTestOrderError('Failed to order test.');
    } finally {
      setTestOrderLoading(false);
    }
  };

  // Handle imaging order submit
  const handleImagingOrderSubmit = async (e) => {
    e.preventDefault();
    setImagingOrderLoading(true);
    setImagingOrderSuccess('');
    setImagingOrderError('');
    if (!selectedImaging) {
      setImagingOrderError('Please select an imaging study.');
      setImagingOrderLoading(false);
      return;
    }
    try {
      await patientAPI.addTestOrder(selectedPatient.patient_id, {
        doctor_id: doctorId,
        test_type_id: null,
        test_name: selectedImaging,
        order_type: 'imaging'
      });
      setImagingOrderSuccess('Imaging ordered successfully!');
      setSelectedImaging('');
      fetchHistory(selectedPatient.patient_id);
    } catch (err) {
      setImagingOrderError('Failed to order imaging.');
    } finally {
      setImagingOrderLoading(false);
    }
  };

  // Prefill AI input with latest note when switching to AI tab
  useEffect(() => {
    if (tab === 4 && notes.length > 0 && !aiInput) {
      setAiInput(notes[0].note_text || '');
    }
    // eslint-disable-next-line
  }, [tab, notes]);

  // Real-time AI analysis as doctor types
  useEffect(() => {
    if (tab === 1 && (debouncedNoteText || debouncedDiagnosis || debouncedAdvice)) {
      setAiLoading(true);
      setAiError('');
      aiAPI.diagnose({
        note_text: debouncedNoteText,
        diagnosis: debouncedDiagnosis,
        advice: debouncedAdvice
      })
        .then(result => setAiResult(result))
        .catch(() => setAiError('AI diagnosis failed.'))
        .finally(() => setAiLoading(false));
    }
    // eslint-disable-next-line
  }, [debouncedNoteText, debouncedDiagnosis, debouncedAdvice]);

  // Real-time AI analysis for medication
  useEffect(() => {
    if (tab === 4 && (debouncedMedName || debouncedMedDosage || debouncedMedInstructions)) {
      setAiMedLoading(true);
      setAiMedError('');
      setAiMedResult(null);
      aiAPI.diagnose({
        medication_name: debouncedMedName,
        dosage: debouncedMedDosage,
        instructions: debouncedMedInstructions
      })
        .then(result => setAiMedResult(result))
        .catch(() => setAiMedError('AI analysis failed.'))
        .finally(() => setAiMedLoading(false));
    } else {
      setAiMedResult(null);
    }
  }, [tab, debouncedMedName, debouncedMedDosage, debouncedMedInstructions]);

  // Handle medication submit
  const handleMedSubmit = async (e) => {
    e.preventDefault();
    setMedLoading(true);
    setMedSuccess('');
    setMedError('');
    let medication_name = medName === 'Custom...' ? customMedName : medName;
    if (!medication_name) {
      setMedError('Please enter a medication name.');
      setMedLoading(false);
      return;
    }
    try {
      await patientAPI.addMedication(selectedPatient.patient_id, {
        doctor_id: doctorId,
        medication_name,
        dosage: medDosage,
        instructions: medInstructions
      });
      setMedSuccess('Medication prescribed successfully!');
      setMedName(''); setCustomMedName(''); setMedDosage(''); setMedInstructions('');
      fetchHistory(selectedPatient.patient_id);
    } catch (err) {
      setMedError('Failed to prescribe medication.');
    } finally {
      setMedLoading(false);
    }
  };

  // Status chip color
  const statusColor = status => {
    if (status === 'completed') return 'success';
    if (status === 'ordered') return 'warning';
    return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, mt: 8, minHeight: 'calc(100vh - 64px)', backgroundColor: '#f5f5f5' }}>
      <Grid container spacing={3}>
        {/* Left Sidebar - Patient List */}
        <Grid item xs={12} md={3}>
          <Card sx={{ boxShadow: 3, height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'primary.main' }}>
                <PersonIcon sx={{ mr: 1 }} /> Outpatients
              </Typography>
              <TextField
                placeholder="Search patient..."
                size="small"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : patients.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No patients found.</Typography>
                ) : (
                  patients.filter(p =>
                    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    String(p.patient_id).includes(searchTerm)
                  ).map(patient => (
                    <Card
                      key={patient.patient_id}
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        backgroundColor: selectedPatient && selectedPatient.patient_id === patient.patient_id ? 'primary.light' : 'white',
                        border: selectedPatient && selectedPatient.patient_id === patient.patient_id ? `2px solid ${theme.palette.primary.main}` : '1px solid #eee',
                        transition: 'background 0.2s, border 0.2s'
                      }}
                      onClick={() => handlePatientSelect(patient.patient_id)}
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
        {/* Main Area - Patient Details and Workflow */}
        <Grid item xs={12} md={6}>
          {selectedPatient ? (
            <Card sx={{ boxShadow: 3, minHeight: 'calc(100vh - 100px)' }}>
              <CardContent>
                {/* Patient Overview */}
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
                {/* Tabs for workflow */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs 
                    value={tab} 
                    onChange={(e, newValue) => setTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="scrollable patient tabs"
                    sx={{
                      '& .MuiTabs-scrollButtons': {
                        '&.Mui-disabled': { opacity: 0.3 }
                      }
                    }}
                  >
                    {tabConfig.map((config, index) => (
                      <Tab
                        key={config.label}
                        icon={config.icon}
                        label={config.label}
                        id={`patient-tab-${index}`}
                        aria-controls={`patient-tabpanel-${index}`}
                        sx={{
                          minHeight: '72px',
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          minWidth: { xs: '120px', sm: '160px' }
                        }}
                      />
                    ))}
                  </Tabs>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {/* Tab Panels */}
                {tab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>Patient History</Typography>
                    {historyLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    ) : historyError ? (
                      <Alert severity="error">{historyError}</Alert>
                    ) : (
                      <Box>
                        {/* Medical Notes */}
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: theme.palette.primary.main }}>Doctor Notes & Diagnoses</Typography>
                        {notes.length === 0 ? <Typography color="text.secondary">No notes yet.</Typography> : (
                          notes.map(note => (
                            <Box key={note.note_id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                              <Typography variant="body1"><b>Date:</b> {new Date(note.created_at).toLocaleString()}</Typography>
                              <Typography variant="body2"><b>Note:</b> {note.note_text}</Typography>
                              <Typography variant="body2"><b>Diagnosis:</b> {note.diagnosis}</Typography>
                              <Typography variant="body2"><b>Advice:</b> {note.advice}</Typography>
                            </Box>
                          ))
                        )}
                        <Divider sx={{ my: 2 }} />
                        {/* Test Orders */}
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: theme.palette.primary.main }}>Test Orders & Results</Typography>
                        {tests.length === 0 ? <Typography color="text.secondary">No tests yet.</Typography> : (
                          <TableContainer component={Paper} sx={{ mb: 2 }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Test Name</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Result</TableCell>
                                  <TableCell>Ordered At</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tests.map(test => (
                                  <TableRow key={test.order_id}>
                                    <TableCell>{test.test_name}</TableCell>
                                    <TableCell>
                                      <Chip label={test.status} color={statusColor(test.status)} size="small" />
                                    </TableCell>
                                    <TableCell>{test.result || '-'}</TableCell>
                                    <TableCell>{test.ordered_at && new Date(test.ordered_at).toLocaleString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                        <Divider sx={{ my: 2 }} />
                        {/* Medications */}
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: theme.palette.primary.main }}>Medications</Typography>
                        {medications.length === 0 ? <Typography color="text.secondary">No medications yet.</Typography> : (
                          <TableContainer component={Paper} sx={{ mb: 2 }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Medication</TableCell>
                                  <TableCell>Dosage</TableCell>
                                  <TableCell>Instructions</TableCell>
                                  <TableCell>Prescribed At</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {medications.map(med => (
                                  <TableRow key={med.medication_id}>
                                    <TableCell>{med.medication_name}</TableCell>
                                    <TableCell>{med.dosage}</TableCell>
                                    <TableCell>{med.instructions}</TableCell>
                                    <TableCell>{med.prescribed_at && new Date(med.prescribed_at).toLocaleString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                        <Divider sx={{ my: 2 }} />
                        {/* Imaging */}
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: theme.palette.primary.main }}>Imaging</Typography>
                        {imaging.length === 0 ? <Typography color="text.secondary">No images yet.</Typography> : (
                          <Grid container spacing={2}>
                            {imaging.map(img => (
                              <Grid item key={img.image_id} xs={12} sm={6} md={4}>
                                <Box sx={{ p: 1, border: '1px solid #eee', borderRadius: 2 }}>
                                  <Typography variant="body2"><b>Date:</b> {new Date(img.uploaded_at).toLocaleString()}</Typography>
                                  <Typography variant="body2"><b>Description:</b> {img.description}</Typography>
                                  <Typography variant="body2"><b>File:</b> {img.image_path}</Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
                {tab === 1 && (
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Add New Doctor Note / Diagnosis
                    </Typography>
                    <form onSubmit={handleNoteSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Doctor ID"
                            value={doctorId}
                            onChange={e => setDoctorId(e.target.value)}
                            fullWidth
                            required
                            type="number"
                            helperText="For demo, use 1 (Jane Doe)"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Note"
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            fullWidth
                            required
                            multiline
                            rows={3}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Diagnosis"
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                            fullWidth
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Advice"
                            value={advice}
                            onChange={e => setAdvice(e.target.value)}
                            fullWidth
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={noteLoading}
                          >
                            {noteLoading ? 'Saving...' : 'Save Note'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                    {noteSuccess && <Alert severity="success" sx={{ mt: 2 }}>{noteSuccess}</Alert>}
                    {noteError && <Alert severity="error" sx={{ mt: 2 }}>{noteError}</Alert>}
                  </CardContent>
                )}
                {tab === 2 && (
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Order New Test
                    </Typography>
                    <form onSubmit={handleTestOrderSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth required>
                            <InputLabel id="lab-test-label">Lab Test</InputLabel>
                            <Select
                              labelId="lab-test-label"
                              id="lab-test-select"
                              value={selectedLabTest}
                              label="Lab Test"
                              onChange={e => setSelectedLabTest(e.target.value)}
                            >
                              {commonLabTests.map(tt => (
                                <MenuItem key={tt.id} value={tt.id}>{tt.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Doctor ID"
                            value={doctorId}
                            onChange={e => setDoctorId(e.target.value)}
                            fullWidth
                            required
                            type="number"
                            helperText="For demo, use 1 (Jane Doe)"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={testOrderLoading}
                          >
                            {testOrderLoading ? 'Ordering...' : 'Order Lab Test'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                    {testOrderSuccess && <Alert severity="success" sx={{ mt: 2 }}>{testOrderSuccess}</Alert>}
                    {testOrderError && <Alert severity="error" sx={{ mt: 2 }}>{testOrderError}</Alert>}
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Order Imaging Study
                    </Typography>
                    <form onSubmit={handleImagingOrderSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth required>
                            <InputLabel id="imaging-study-label">Imaging Study</InputLabel>
                            <Select
                              labelId="imaging-study-label"
                              id="imaging-study-select"
                              value={selectedImaging}
                              label="Imaging Study"
                              onChange={e => setSelectedImaging(e.target.value)}
                            >
                              {imagingStudies.map(study => (
                                <MenuItem key={study} value={study}>{study}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Doctor ID"
                            value={doctorId}
                            onChange={e => setDoctorId(e.target.value)}
                            fullWidth
                            required
                            type="number"
                            helperText="For demo, use 1 (Jane Doe)"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={imagingOrderLoading}
                          >
                            {imagingOrderLoading ? 'Ordering...' : 'Order Imaging'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                    {imagingOrderSuccess && <Alert severity="success" sx={{ mt: 2 }}>{imagingOrderSuccess}</Alert>}
                    {imagingOrderError && <Alert severity="error" sx={{ mt: 2 }}>{imagingOrderError}</Alert>}
                  </CardContent>
                )}
                {tab === 3 && (
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Test Orders & Results
                    </Typography>
                    {historyLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    ) : historyError ? (
                      <Alert severity="error">{historyError}</Alert>
                    ) : (
                      <Box>
                        {tests.length === 0 ? <Typography color="text.secondary">No tests yet.</Typography> : (
                          tests.map(test => (
                            <Box key={test.order_id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                              <Typography variant="body1"><b>Date:</b> {new Date(test.ordered_at).toLocaleString()}</Typography>
                              <Typography variant="body2"><b>Test:</b> {test.test_name}</Typography>
                              <Typography variant="body2"><b>Status:</b> {test.status}</Typography>
                              {test.result && <Typography variant="body2"><b>Result:</b> {test.result}</Typography>}
                            </Box>
                          ))
                        )}
                      </Box>
                    )}
                  </CardContent>
                )}
                {tab === 4 && (
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Prescribe Medication
                    </Typography>
                    <form onSubmit={handleMedSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Medication Name"
                            value={medName}
                            onChange={e => setMedName(e.target.value)}
                            fullWidth
                            required
                            placeholder="Enter medication name"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Dosage"
                            value={medDosage}
                            onChange={e => setMedDosage(e.target.value)}
                            fullWidth
                            required
                            placeholder="e.g. 500mg every 8 hours"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Instructions"
                            value={medInstructions}
                            onChange={e => setMedInstructions(e.target.value)}
                            fullWidth
                            required
                            placeholder="e.g. Take after meals for 3 days"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Doctor ID"
                            value={doctorId}
                            onChange={e => setDoctorId(e.target.value)}
                            fullWidth
                            required
                            type="number"
                            helperText="For demo, use 1 (Jane Doe)"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={medLoading}
                            sx={{ minWidth: 180 }}
                          >
                            {medLoading ? 'Prescribing...' : 'Prescribe'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                    {medSuccess && <Alert severity="success" sx={{ mt: 2 }}>{medSuccess}</Alert>}
                    {medError && <Alert severity="error" sx={{ mt: 2 }}>{medError}</Alert>}
                  </CardContent>
                )}
                {tab === 5 && (
                  <CardContent sx={{ p: 0 }}>
                    {/* ... Images ... */}
                  </CardContent>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ boxShadow: 3, minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
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
          <Card sx={{ boxShadow: 3, height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'primary.main' }}>
                <AutoFixHigh sx={{ mr: 1 }} /> AI Analysis
              </Typography>
              {tab === 4 ? (
                medName.trim() === '' && medDosage.trim() === '' && medInstructions.trim() === '' ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Enter medication details to get AI analysis
                  </Typography>
                ) : aiMedLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : aiMedError ? (
                  <Alert severity="error">{aiMedError}</Alert>
                ) : aiMedResult ? (
                  <>
                    {aiMedResult.diagnosis && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                          AI Diagnosis
                        </Typography>
                        <Box sx={{ p: 1.5, mb: 1, borderRadius: 1, bgcolor: 'success.light', boxShadow: 1 }}>
                          <Typography variant="body2">{aiMedResult.diagnosis}</Typography>
                        </Box>
                      </Box>
                    )}
                    {aiMedResult.recommendations && aiMedResult.recommendations.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                          Recommendations
                        </Typography>
                        {aiMedResult.recommendations.map((rec, index) => (
                          <Box key={index} sx={{ p: 1.5, mb: 1, borderRadius: 1, bgcolor: 'warning.light', boxShadow: 1 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Info fontSize="small" sx={{ mr: 1, mt: '2px' }} />
                              {rec}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {!aiMedResult.diagnosis && !aiMedResult.recommendations && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {typeof aiMedResult === 'string' ? aiMedResult : JSON.stringify(aiMedResult)}
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
                  Select the "Prescribe Medication" tab to view AI analysis
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Outpatient;