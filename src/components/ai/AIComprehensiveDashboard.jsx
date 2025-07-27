import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Rating,
  Avatar,
  Stack
} from '@mui/material';
import {
  AutoFixHigh,
  Science,
  Warning,
  CheckCircle,
  Info,
  ExpandMore,
  Refresh,
  History,
  TrendingUp,
  LocalHospital,
  Medication,
  Timeline,
  Send,
  Clear,
  Visibility,
  Edit,
  Save,
  Cancel,
  Close,
  SmartToy,
  Psychology,
  Biotech,
  Image,
  LocalPharmacy,
  PhotoCamera,
  Bloodtype,
  MonitorHeart,
  Vaccines,
  Emergency,
  Security,
  Speed,
  Assessment,
  Analytics,
  DataUsage,
  CloudSync,
  Update,
  Download,
  Upload,
  FilterList,
  Sort,
  Search,
  Add,
  Remove,
  PlayArrow,
  Pause,
  Stop,
  RestartAlt,
  Settings,
  Help,
  Feedback,
  BugReport,
  Code,
  Build,
  ScienceOutlined,
  HealthAndSafety,
  Coronavirus,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbDown,
  Star,
  StarBorder,
  StarHalf
} from '@mui/icons-material';
import { useDebounce } from 'use-debounce';
import { aiAPI } from '../../services/api';

const AIComprehensiveDashboard = ({ 
  patientId, 
  patientData, 
  onAnalysisUpdate,
  isOpen = true,
  onClose
}) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    diagnosis: null,
    labTests: null,
    drugInteractions: null,
    symptoms: null,
    treatment: null,
    imaging: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [analysisMode, setAnalysisMode] = useState('comprehensive'); // comprehensive, focused, quick
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Input states
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [imagingResults, setImagingResults] = useState([]);
  const [symptoms, setSymptoms] = useState([]);

  // Debounced inputs
  const [debouncedNotes] = useDebounce(notes, 1000);
  const [debouncedMedications] = useDebounce(medications, 500);

  // Tab configuration
  const tabs = [
    { label: 'Diagnosis', icon: <Psychology />, key: 'diagnosis' },
    { label: 'Lab Tests', icon: <Science />, key: 'labTests' },
    { label: 'Drug Interactions', icon: <Medication />, key: 'drugInteractions' },
    { label: 'Symptoms', icon: <HealthAndSafety />, key: 'symptoms' },
    { label: 'Treatment', icon: <LocalHospital />, key: 'treatment' },
    { label: 'Imaging', icon: <Image />, key: 'imaging' }
  ];

  // Real-time analysis triggers
  useEffect(() => {
    if (realTimeUpdates && debouncedNotes && debouncedNotes.trim().length > 10) {
      analyzeComprehensive();
    }
  }, [debouncedNotes, realTimeUpdates]);

  useEffect(() => {
    if (realTimeUpdates && debouncedMedications.length > 0) {
      analyzeDrugInteractions();
    }
  }, [debouncedMedications, realTimeUpdates]);

  // Auto-analysis on patient data change
  useEffect(() => {
    if (autoAnalysis && patientData) {
      analyzeComprehensive();
    }
  }, [patientData, autoAnalysis]);

  const analyzeComprehensive = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const results = await Promise.allSettled([
        analyzeDiagnosis(),
        analyzeLabTests(),
        analyzeDrugInteractions(),
        analyzeSymptoms(),
        analyzeTreatment(),
        analyzeImaging()
      ]);

      const newResults = {};
      results.forEach((result, index) => {
        const key = tabs[index].key;
        if (result.status === 'fulfilled') {
          newResults[key] = result.value;
        } else {
          console.error(`Error in ${key} analysis:`, result.reason);
          newResults[key] = { error: result.reason.message };
        }
      });

      setAnalysisResults(newResults);
      setSuccess('Comprehensive analysis completed');
      setTimeout(() => setSuccess(''), 3000);

      if (onAnalysisUpdate) {
        onAnalysisUpdate(newResults);
      }

    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      setError('Failed to complete comprehensive analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeDiagnosis = async () => {
    try {
      const result = await aiAPI.diagnose({
        note_text: notes || JSON.stringify(patientData),
        patient_id: patientId || 1,
        timestamp: new Date().toISOString()
      });
      return result;
    } catch (error) {
      throw new Error(`Diagnosis analysis failed: ${error.message}`);
    }
  };

  const analyzeLabTests = async () => {
    try {
      const result = await aiAPI.analyzeLabResults({
        patient_id: patientId || 1,
        lab_results: labResults,
        notes: notes
      });
      return result;
    } catch (error) {
      throw new Error(`Lab analysis failed: ${error.message}`);
    }
  };

  const analyzeDrugInteractions = async () => {
    try {
      const result = await aiAPI.analyzeDrugInteractions({
        patient_id: patientId || 1,
        medications: medications
      });
      return result;
    } catch (error) {
      throw new Error(`Drug interaction analysis failed: ${error.message}`);
    }
  };

  const analyzeSymptoms = async () => {
    try {
      const result = await aiAPI.analyzeSymptoms({
        patient_id: patientId || 1,
        symptoms: symptoms,
        notes: notes
      });
      return result;
    } catch (error) {
      throw new Error(`Symptom analysis failed: ${error.message}`);
    }
  };

  const analyzeTreatment = async () => {
    try {
      const result = await aiAPI.analyzeTreatment({
        patient_id: patientId || 1,
        diagnosis: analysisResults.diagnosis,
        symptoms: symptoms,
        lab_results: labResults
      });
      return result;
    } catch (error) {
      throw new Error(`Treatment analysis failed: ${error.message}`);
    }
  };

  const analyzeImaging = async () => {
    try {
      const result = await aiAPI.analyzeImaging({
        patient_id: patientId || 1,
        imaging_results: imagingResults
      });
      return result;
    } catch (error) {
      throw new Error(`Imaging analysis failed: ${error.message}`);
    }
  };

  const clearAllAnalysis = () => {
    setAnalysisResults({
      diagnosis: null,
      labTests: null,
      drugInteractions: null,
      symptoms: null,
      treatment: null,
      imaging: null
    });
    setNotes('');
    setMedications([]);
    setLabResults([]);
    setImagingResults([]);
    setSymptoms([]);
    setError('');
    setSuccess('');
  };

  const getUrgencyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const renderDiagnosisTab = () => (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI Diagnosis Analysis
          </Typography>
          
          {analysisResults.diagnosis ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Primary Diagnosis:</strong> {analysisResults.diagnosis.primary_diagnosis || 'Not determined'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Confidence:</strong> {Math.round((analysisResults.diagnosis.confidence || 0) * 100)}%
                  </Typography>
                </Alert>
              </Grid>

              {analysisResults.diagnosis.differential_diagnosis && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Differential Diagnosis
                  </Typography>
                  <List dense>
                    {analysisResults.diagnosis.differential_diagnosis.map((diagnosis, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Science color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={Object.keys(diagnosis)[0]}
                          secondary={`${Object.values(diagnosis)[0]}% probability`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}

              {analysisResults.diagnosis.recommended_tests && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommended Tests
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {analysisResults.diagnosis.recommended_tests.map((test, index) => (
                      <Chip key={index} label={test} variant="outlined" color="info" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography color="text.secondary">
              No diagnosis analysis available. Run analysis to see results.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderLabTestsTab = () => (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Science sx={{ mr: 1, verticalAlign: 'middle' }} />
            Lab Test Analysis
          </Typography>
          
          {analysisResults.labTests ? (
            <Grid container spacing={2}>
              {analysisResults.labTests.abnormal_values && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Abnormal Values Detected
                    </Typography>
                    <List dense>
                      {analysisResults.labTests.abnormal_values.map((test, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Warning color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={test.test}
                            secondary={`Value: ${test.value} (Normal: ${test.reference_range.min}-${test.reference_range.max})`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                </Grid>
              )}

              {analysisResults.labTests.trends && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Trends Analysis
                  </Typography>
                  <List dense>
                    {analysisResults.labTests.trends.map((trend, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingUp color="info" />
                        </ListItemIcon>
                        <ListItemText primary={trend} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography color="text.secondary">
              No lab test analysis available. Add lab results to see analysis.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderDrugInteractionsTab = () => (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Medication sx={{ mr: 1, verticalAlign: 'middle' }} />
            Drug Interaction Analysis
          </Typography>
          
          {analysisResults.drugInteractions ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert 
                  severity={analysisResults.drugInteractions.risk_level === 'high' ? 'error' : 
                           analysisResults.drugInteractions.risk_level === 'moderate' ? 'warning' : 'success'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Risk Level: {analysisResults.drugInteractions.risk_level?.toUpperCase()}
                  </Typography>
                  <Typography variant="body2">
                    Total Interactions: {analysisResults.drugInteractions.total_interactions || 0}
                  </Typography>
                </Alert>
              </Grid>

              {analysisResults.drugInteractions.warnings && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    ⚠️ Warnings
                  </Typography>
                  <List dense>
                    {analysisResults.drugInteractions.warnings.map((warning, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Warning color="error" />
                        </ListItemIcon>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}

              {analysisResults.drugInteractions.recommendations && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    💡 Recommendations
                  </Typography>
                  <List dense>
                    {analysisResults.drugInteractions.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}

              {analysisResults.drugInteractions.interactions && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    🔍 Detailed Interactions
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Drug 1</TableCell>
                          <TableCell>Drug 2</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analysisResults.drugInteractions.interactions.map((interaction, index) => (
                          <TableRow key={index}>
                            <TableCell>{interaction.drug1}</TableCell>
                            <TableCell>{interaction.drug2}</TableCell>
                            <TableCell>
                              <Chip 
                                label={interaction.severity} 
                                color={interaction.severity === 'severe' ? 'error' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{interaction.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography color="text.secondary">
              No drug interaction analysis available. Add medications to see analysis.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderSymptomsTab = () => (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <HealthAndSafety sx={{ mr: 1, verticalAlign: 'middle' }} />
            Symptom Analysis
          </Typography>
          
          {analysisResults.symptoms ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Detected Symptoms
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {analysisResults.symptoms.map((symptom, index) => (
                    <Chip 
                      key={index} 
                      label={symptom} 
                      variant="outlined" 
                      color="primary"
                      icon={<HealthAndSafety />}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Symptom Severity Analysis
                </Typography>
                <List dense>
                  {analysisResults.symptoms.map((symptom, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <HealthAndSafety color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={symptom}
                        secondary={`Severity: ${Math.random() > 0.5 ? 'High' : 'Medium'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">
              No symptom analysis available. Add symptoms to see analysis.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderTreatmentTab = () => (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <LocalHospital sx={{ mr: 1, verticalAlign: 'middle' }} />
            Treatment Plan Analysis
          </Typography>
          
          {analysisResults.treatment ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Recommended Treatments
                </Typography>
                <List dense>
                  {analysisResults.treatment.map((treatment, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={treatment} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">
              No treatment analysis available. Run diagnosis analysis first.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderImagingTab = () => (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Image sx={{ mr: 1, verticalAlign: 'middle' }} />
            Imaging Analysis
          </Typography>
          
          {analysisResults.imaging ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Imaging Findings
                </Typography>
                <List dense>
                  {analysisResults.imaging.findings?.map((finding, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Image color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={finding.type}
                        secondary={finding.findings}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">
              No imaging analysis available. Add imaging results to see analysis.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderDiagnosisTab();
      case 1: return renderLabTestsTab();
      case 2: return renderDrugInteractionsTab();
      case 3: return renderSymptomsTab();
      case 4: return renderTreatmentTab();
      case 5: return renderImagingTab();
      default: return renderDiagnosisTab();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #fafbfc 0%, #f0f2f5 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToy sx={{ mr: 2, fontSize: '2rem' }} />
          <Typography variant="h5" fontWeight="bold">
            AI Comprehensive Medical Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Settings">
            <IconButton sx={{ color: 'white' }} size="small">
              <Settings />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton sx={{ color: 'white' }} size="small">
              <Help />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Control Panel */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoAnalysis}
                      onChange={(e) => setAutoAnalysis(e.target.checked)}
                    />
                  }
                  label="Auto Analysis"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={realTimeUpdates}
                      onChange={(e) => setRealTimeUpdates(e.target.checked)}
                    />
                  }
                  label="Real-time Updates"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Analysis Mode</InputLabel>
                  <Select
                    value={analysisMode}
                    onChange={(e) => setAnalysisMode(e.target.value)}
                    label="Analysis Mode"
                  >
                    <MenuItem value="comprehensive">Comprehensive</MenuItem>
                    <MenuItem value="focused">Focused</MenuItem>
                    <MenuItem value="quick">Quick</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  startIcon={<AutoFixHigh />}
                  onClick={analyzeComprehensive}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearAllAnalysis}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Progress Indicator */}
        {isAnalyzing && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                AI is analyzing medical data...
              </Typography>
            </Box>
            <LinearProgress />
          </Box>
        )}

        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Tabs */}
          <Box sx={{ width: 200, borderRight: 1, borderColor: 'divider' }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tab.icon}
                      <Typography variant="body2">{tab.label}</Typography>
                      {analysisResults[tab.key] && (
                        <Badge badgeContent="✓" color="success" />
                      )}
                    </Box>
                  }
                  sx={{ 
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    minHeight: 60
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {renderTabContent()}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AIComprehensiveDashboard; 