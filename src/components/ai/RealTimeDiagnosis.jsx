import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  Cancel
} from '@mui/icons-material';
import { useDebounce } from 'use-debounce';

const RealTimeDiagnosis = ({ patientId, patientData, onDiagnosisUpdate }) => {
  // State management
  const [notes, setNotes] = useState('');
  const [debouncedNotes] = useDebounce(notes, 1000); // 1 second delay
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [comprehensiveDiagnosis, setComprehensiveDiagnosis] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [streamingData, setStreamingData] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState('analysis');
  const [showDiagnosisDialog, setShowDiagnosisDialog] = useState(false);
  const [patientContext, setPatientContext] = useState([]);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [urgencyLevel, setUrgencyLevel] = useState('Low');

  // Refs
  const eventSourceRef = useRef(null);
  const analysisTimeoutRef = useRef(null);

  // Import AI diagnosis service
  const aiDiagnosisService = require('../../services/aiDiagnosisService').default;

  // Initialize component
  useEffect(() => {
    if (patientId) {
      loadPatientContext();
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [patientId]);

  // Real-time analysis when notes change
  useEffect(() => {
    if (debouncedNotes && debouncedNotes.trim().length > 10) {
      analyzeNotes(debouncedNotes);
    }
  }, [debouncedNotes]);

  const loadPatientContext = async () => {
    try {
      const context = await aiDiagnosisService.getPatientContext(patientId);
      setPatientContext(context.context || []);
    } catch (error) {
      console.error('Error loading patient context:', error);
    }
  };

  const analyzeNotes = async (currentNotes) => {
    if (!currentNotes.trim()) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await aiDiagnosisService.analyzeNotes(patientId, currentNotes);
      setAnalysisResult(result);
      setConfidenceScore(result.confidence || 0);
      setUrgencyLevel(getUrgencyLevel(result.urgency_score || 0));

      // Update parent component
      if (onDiagnosisUpdate) {
        onDiagnosisUpdate(result);
      }

      setSuccess('Analysis completed successfully');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error analyzing notes:', error);
      setError('Failed to analyze notes. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startStreamingAnalysis = async () => {
    if (!notes.trim()) return;

    setIsStreaming(true);
    setStreamingData([]);

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Start streaming using service
      const eventSource = aiDiagnosisService.startStreamingDiagnosis(
        patientId,
        notes,
        (data) => setStreamingData(prev => [...prev, data]),
        (error) => {
          console.error('EventSource error:', error);
          setIsStreaming(false);
          setError('Streaming connection failed');
        },
        () => setIsStreaming(false)
      );

      eventSourceRef.current = eventSource;

    } catch (error) {
      console.error('Error starting streaming analysis:', error);
      setError('Failed to start streaming analysis');
      setIsStreaming(false);
    }
  };

  const stopStreamingAnalysis = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  };

  const generateComprehensiveDiagnosis = async () => {
    if (!patientData) {
      setError('Patient data is required for comprehensive diagnosis');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await aiDiagnosisService.generateComprehensiveDiagnosis(patientId, {
        current_notes: notes,
        medical_history: patientData.medical_history || {},
        lab_results: patientData.lab_results || [],
        imaging_results: patientData.imaging_results || []
      });
      
      setComprehensiveDiagnosis(result);
      setShowDiagnosisDialog(true);

    } catch (error) {
      console.error('Error generating comprehensive diagnosis:', error);
      setError('Failed to generate comprehensive diagnosis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setNotes('');
    setAnalysisResult(null);
    setComprehensiveDiagnosis(null);
    setStreamingData([]);
    setError('');
    setSuccess('');
    setConfidenceScore(0);
    setUrgencyLevel('Low');
  };

  const clearPatientContext = async () => {
    try {
      await aiDiagnosisService.clearPatientContext(patientId);
      setPatientContext([]);
      setSuccess('Patient context cleared');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error clearing patient context:', error);
      setError('Failed to clear patient context');
    }
  };

  const getUrgencyLevel = (score) => {
    if (score > 0.8) return 'Critical';
    if (score > 0.6) return 'High';
    if (score > 0.4) return 'Medium';
    return 'Low';
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      default: return 'success';
    }
  };

  const getConfidenceColor = (score) => {
    if (score > 0.8) return 'success';
    if (score > 0.6) return 'warning';
    return 'error';
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoFixHigh sx={{ mr: 1 }} />
            Real-time Analysis
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Symptoms Detected
              </Typography>
              <Box sx={{ mt: 1 }}>
                {analysisResult.symptoms?.map((symptom, index) => (
                  <Chip
                    key={index}
                    label={symptom}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Medical Category
              </Typography>
              <Chip
                label={analysisResult.medical_category}
                color="primary"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Urgency Level
              </Typography>
              <Chip
                label={urgencyLevel}
                color={getUrgencyColor(urgencyLevel)}
                icon={<Warning />}
                sx={{ mt: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Confidence Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={confidenceScore * 100}
                  color={getConfidenceColor(confidenceScore)}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Typography variant="body2">
                  {Math.round(confidenceScore * 100)}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Urgency Score
              </Typography>
              <Typography variant="h6" color={getUrgencyColor(urgencyLevel)}>
                {Math.round((analysisResult.urgency_score || 0) * 100)}%
              </Typography>
            </Grid>
          </Grid>

          {analysisResult.recommendations?.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recommendations
              </Typography>
              <List dense>
                {analysisResult.recommendations.map((rec, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Info color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStreamingData = () => {
    if (streamingData.length === 0) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Timeline sx={{ mr: 1 }} />
            Streaming Analysis
          </Typography>
          
          <List dense>
            {streamingData.map((data, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {data.type === 'initial_analysis' && <Science color="primary" />}
                  {data.type === 'progressive_insight' && <TrendingUp color="secondary" />}
                  {data.type === 'final_analysis' && <CheckCircle color="success" />}
                </ListItemIcon>
                <ListItemText
                  primary={data.type.replace('_', ' ').toUpperCase()}
                  secondary={
                    data.data?.insights ? 
                    data.data.insights.join(', ') : 
                    'Analysis in progress...'
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderComprehensiveDiagnosis = () => {
    if (!comprehensiveDiagnosis) return null;

    return (
      <Dialog
        open={showDiagnosisDialog}
        onClose={() => setShowDiagnosisDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalHospital sx={{ mr: 1 }} />
            Comprehensive Diagnosis
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Primary Diagnosis */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Primary Diagnosis
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {comprehensiveDiagnosis.primary_diagnosis?.diagnosis || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confidence: {Math.round((comprehensiveDiagnosis.primary_diagnosis?.confidence || 0) * 100)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Risk Assessment */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Assessment
                  </Typography>
                  <Chip
                    label={comprehensiveDiagnosis.risk_assessment?.risk_level || 'Unknown'}
                    color={getUrgencyColor(comprehensiveDiagnosis.risk_assessment?.risk_level || 'Low')}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Risk Score: {Math.round((comprehensiveDiagnosis.risk_assessment?.risk_score || 0) * 100)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Differential Diagnosis */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Differential Diagnosis
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {comprehensiveDiagnosis.differential_diagnosis?.map((diff, index) => (
                      <Chip
                        key={index}
                        label={`${diff.condition} (${Math.round(diff.probability * 100)}%)`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Treatment Plan */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Treatment Plan
                  </Typography>
                  <List dense>
                    {comprehensiveDiagnosis.treatment_plan?.medications?.map((med, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Medication color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={med.name}
                          secondary={`${med.dosage} - ${med.duration}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Next Steps */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Next Steps
                  </Typography>
                  <List dense>
                    {comprehensiveDiagnosis.next_steps?.map((step, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={step.step}
                          secondary={`${step.priority} - ${step.timeline}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDiagnosisDialog(false)}>Close</Button>
          <Button variant="contained" color="primary">
            Save Diagnosis
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoFixHigh sx={{ mr: 1 }} />
          Real-time AI Diagnosis
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Clear Analysis">
            <IconButton onClick={clearAnalysis} color="error">
              <Clear />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Clear Patient Context">
            <IconButton onClick={clearPatientContext} color="warning">
              <History />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Generate Comprehensive Diagnosis">
            <IconButton 
              onClick={generateComprehensiveDiagnosis}
              disabled={isAnalyzing || !patientData}
              color="primary"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Notes Input */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Clinician Notes
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Enter your clinical notes here... The AI will analyze in real-time as you type."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isAnalyzing}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={() => analyzeNotes(notes)}
                  disabled={isAnalyzing || !notes.trim()}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Notes'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={isStreaming ? <Cancel /> : <Timeline />}
                  onClick={isStreaming ? stopStreamingAnalysis : startStreamingAnalysis}
                  disabled={!notes.trim()}
                >
                  {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
                </Button>
              </Box>
              
              {isAnalyzing && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    AI is analyzing your notes...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Context */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1 }} />
                Patient Context
              </Typography>
              
              <Badge badgeContent={patientContext.length} color="primary">
                <Typography variant="body2" color="text.secondary">
                  Analysis History
                </Typography>
              </Badge>
              
              {patientContext.length > 0 && (
                <List dense sx={{ mt: 1 }}>
                  {patientContext.slice(-3).map((context, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Analysis ${index + 1}`}
                        secondary={new Date(context.timestamp).toLocaleTimeString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analysis Results */}
      {renderAnalysisResult()}
      
      {/* Streaming Data */}
      {renderStreamingData()}
      
      {/* Comprehensive Diagnosis Dialog */}
      {renderComprehensiveDiagnosis()}
    </Box>
  );
};

export default RealTimeDiagnosis; 