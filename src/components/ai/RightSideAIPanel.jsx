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
  DialogActions,
  Drawer,
  Fab,
  Zoom,
  Fade,
  Slide
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
  PhotoCamera
} from '@mui/icons-material';
import { useDebounce } from 'use-debounce';
import { aiAPI } from '../../services/api';

const RightSideAIPanel = ({ 
  patientId, 
  patientData, 
  currentPage, 
  currentData, 
  onAnalysisUpdate,
  isOpen = true,
  onClose
}) => {
  // State management
  const [notes, setNotes] = useState('');
  const [debouncedNotes] = useDebounce(notes, 1000); // 1 second delay
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState('analysis');
  const [aiMode, setAiMode] = useState('diagnosis'); // diagnosis, lab, imaging, pharmacy
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [urgencyLevel, setUrgencyLevel] = useState('Low');
  const [dataSources, setDataSources] = useState({
    who_data: 0,
    drug_data: 0,
    research_data: 0
  });

  // Refs
  const analysisTimeoutRef = useRef(null);

  // Import AI diagnosis service
  const aiDiagnosisService = require('../../services/aiDiagnosisService').default;

  // Initialize component
  useEffect(() => {
    if (patientId) {
      loadPatientContext();
    }
    return () => {
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

  // Auto-analyze based on current page data
  useEffect(() => {
    if (currentData && currentPage) {
      autoAnalyzeCurrentData();
    }
  }, [currentData, currentPage]);

  const loadPatientContext = async () => {
    try {
      const context = await aiDiagnosisService.getPatientContext(patientId);
      // Handle context loading
    } catch (error) {
      console.error('Error loading patient context:', error);
    }
  };

  const autoAnalyzeCurrentData = async () => {
    if (!currentData || !currentPage) return;

    setIsAnalyzing(true);
    setError('');

    try {
      let analysisData = {
        patient_id: patientId,
        page_type: currentPage,
        data: currentData
      };

      let result;
      switch (currentPage) {
        case 'outpatient':
          result = await aiDiagnosisService.analyzeNotes(patientId, currentData.notes || '');
          break;
        case 'pharmacy':
          result = await aiDiagnosisService.analyzeDrugInteractions(currentData.medications || []);
          break;
        case 'lab':
          result = await aiDiagnosisService.analyzeLabResults(currentData.labResults || []);
          break;
        case 'imaging':
          result = await aiDiagnosisService.analyzeImagingResults(currentData.imagingResults || []);
          break;
        default:
          result = await aiDiagnosisService.analyzeNotes(patientId, JSON.stringify(currentData));
      }

      setAnalysisResult(result);
      setConfidenceScore(result.confidence || 0);
      setUrgencyLevel(getUrgencyLevel(result.urgency_score || 0));
      setDataSources(result.data_sources || dataSources);

      // Update parent component
      if (onAnalysisUpdate) {
        onAnalysisUpdate(result);
      }

      setSuccess('Analysis completed successfully');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error analyzing current data:', error);
      setError('Failed to analyze data. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeNotes = async (currentNotes) => {
    if (!currentNotes.trim()) return;

    setIsAnalyzing(true);
    setError('');

    let retries = 0;
    let delay = 1000;
    while (retries < 3) {
      try {
        // Debug logging
        console.log('Analyzing notes:', { patientId, currentNotes });

        // Use the backend API instead of direct Python call
        const result = await aiAPI.diagnose({
          note_text: currentNotes,
          patient_id: patientId || 1,
          timestamp: new Date().toISOString()
        });

        setAnalysisResult(result);
        setConfidenceScore(result.confidence || 0);
        setUrgencyLevel(getUrgencyLevel(result.urgency_score || 0));
        setDataSources(result.data_sources || dataSources);

        // Update parent component
        if (onAnalysisUpdate) {
          onAnalysisUpdate(result);
        }

        setSuccess('Analysis completed successfully');
        setTimeout(() => setSuccess(''), 3000);
        setIsAnalyzing(false);
        return;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          setError('Too many requests. Retrying...');
          await new Promise(res => setTimeout(res, delay));
          retries += 1;
          delay *= 2;
          continue;
        }
        console.error('Error analyzing notes:', error);
        setError(`Failed to analyze notes: ${error.message}`);
        setIsAnalyzing(false);
        return;
      }
    }
    setError('Failed to analyze notes after multiple attempts due to rate limiting. Please try again later.');
    setIsAnalyzing(false);
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setNotes('');
    setError('');
    setSuccess('');
    setConfidenceScore(0);
    setUrgencyLevel('Low');
  };

  const getUrgencyLevel = (score) => {
    if (score >= 0.8) return 'Critical';
    if (score >= 0.6) return 'High';
    if (score >= 0.4) return 'Medium';
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
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const getPageIcon = (page) => {
    switch (page) {
      case 'outpatient': return <LocalHospital />;
      case 'pharmacy': return <LocalPharmacy />;
      case 'lab': return <Science />;
      case 'imaging': return <PhotoCamera />;
      default: return <SmartToy />;
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <Accordion 
        expanded={expandedAccordion === 'analysis'} 
        onChange={() => setExpandedAccordion(expandedAccordion === 'analysis' ? '' : 'analysis')}
        sx={{ 
          boxShadow: 2,
          borderRadius: 2,
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <AutoFixHigh sx={{ mr: 1 }} />
            <Typography variant="h6">AI Analysis Results</Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={`${Math.round(confidenceScore * 100)}% Confidence`}
                color={getConfidenceColor(confidenceScore)}
                size="small"
              />
              <Chip 
                label={urgencyLevel}
                color={getUrgencyColor(urgencyLevel)}
                size="small"
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Symptoms */}
            {analysisResult.symptoms && analysisResult.symptoms.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ boxShadow: 1, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      Detected Symptoms
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {analysisResult.symptoms.map((symptom, index) => (
                        <Chip
                          key={index}
                          label={symptom}
                          variant="outlined"
                          color="primary"
                          size="small"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Conditions */}
            {analysisResult.conditions && analysisResult.conditions.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ boxShadow: 1, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                      Potential Conditions
                    </Typography>
                    <List dense>
                      {analysisResult.conditions.map((condition, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Science color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={condition.condition}
                            secondary={`${Math.round(condition.probability * 100)}% probability - ${condition.severity} severity`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ boxShadow: 1, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      AI Recommendations
                    </Typography>
                    <List dense>
                      {analysisResult.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Data Sources */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ boxShadow: 1, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'info.main', fontWeight: 'bold' }}>
                    Data Sources Used
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip 
                      icon={<Info />}
                      label={`WHO: ${dataSources.who_data}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      icon={<Medication />}
                      label={`Drug DB: ${dataSources.drug_data}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      icon={<Science />}
                      label={`Research: ${dataSources.research_data}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: 400,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
          height: '100vh',
          top: 64, // Below header
          borderLeft: '2px solid',
          borderColor: 'primary.main',
          background: 'linear-gradient(135deg, #fafbfc 0%, #f0f2f5 100%)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white'
        }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
            <SmartToy sx={{ mr: 1.5, fontSize: '1.5rem' }} />
            AI Medical Assistant
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Clear Analysis">
              <IconButton onClick={clearAnalysis} sx={{ color: 'white' }} size="small">
                <Clear />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Close Panel">
              <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Current Page Indicator */}
        {currentPage && (
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 1, 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText',
                  mr: 1.5
                }}>
                  {getPageIcon(currentPage)}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Current Context
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Module
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

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

        {/* Notes Input */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Additional Notes
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Add additional notes for AI analysis..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isAnalyzing}
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => analyzeNotes(notes)}
              disabled={isAnalyzing || !notes.trim()}
              fullWidth
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Notes'}
            </Button>
            
            {isAnalyzing && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  AI is analyzing...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {renderAnalysisResult()}

        {/* Auto-analysis Status */}
        {currentData && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Auto-Analysis Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Fade in={isAnalyzing}>
                  <CircularProgress size={20} />
                </Fade>
                <Typography variant="body2" color="text.secondary">
                  {isAnalyzing ? 'Analyzing current data...' : 'Ready for analysis'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Drawer>
  );
};

export default RightSideAIPanel; 