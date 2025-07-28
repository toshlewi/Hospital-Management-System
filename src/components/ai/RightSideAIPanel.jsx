import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Collapse,
  Fab,
  Zoom
} from '@mui/material';
import {
  Send,
  Close,
  ExpandMore,
  ExpandLess,
  Science,
  Medication,
  Warning,
  CheckCircle,
  Error,
  SmartToy,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';

const RightSideAIPanel = ({ 
  patientId, 
  patientData, 
  currentPage, 
  currentData, 
  onAnalysisUpdate,
  isOpen = true,
  onClose,
  width = 400,
  onWidthChange
}) => {
  const [notes, setNotes] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(isOpen);
  const resizeRef = useRef(null);

  // Sync with parent component
  useEffect(() => {
    setIsPanelOpen(isOpen);
  }, [isOpen]);

  // Load patient history on component mount
  useEffect(() => {
    if (patientId) {
      loadPatientHistory();
    }
  }, [patientId]);

  const loadPatientHistory = async () => {
    try {
      // This would be replaced with actual API call
      setPatientHistory([]);
    } catch (error) {
      console.error('Error loading patient history:', error);
    }
  };

  const analyzeComprehensive = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      console.log('Starting comprehensive analysis...');
      console.log('Notes:', notes);
      console.log('Patient ID:', patientId);
      
      // Call the new Medical AI comprehensive analysis API
      const apiUrl = process.env.REACT_APP_AI_SERVICE_URL 
  ? `${process.env.REACT_APP_AI_SERVICE_URL}/api/v1/comprehensive-analysis`
  : 'https://hospital-ai-service.onrender.com/api/v1/comprehensive-analysis';
      const payload = {
        symptoms: notes || JSON.stringify({ patientData, currentData, patientHistory }),
        patient_id: patientId || 1,
        patient_data: patientData
      };
      
      console.log('API URL:', apiUrl);
      console.log('Payload:', payload);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        setAnalysisResults(result);
        setSuccess('Analysis completed successfully');
        setTimeout(() => setSuccess(''), 3000);

        if (onAnalysisUpdate) {
          onAnalysisUpdate(result);
        }
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        setError(`Analysis failed: ${response.status} - ${errorText}`);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setError(`Failed to complete analysis: ${error.message}. Please check if the Medical AI API is running on https://hospital-ai-service.onrender.com`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSend = () => {
    if (notes.trim()) {
      analyzeComprehensive();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearAnalysis = () => {
    setAnalysisResults(null);
    setError('');
    setSuccess('');
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    resizeRef.current = e.clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isResizing && resizeRef.current) {
      const deltaX = resizeRef.current - e.clientX;
      const newWidth = Math.max(300, Math.min(600, width + deltaX));
      if (onWidthChange) {
        onWidthChange(newWidth);
      }
      resizeRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const togglePanel = () => {
    const newState = !isPanelOpen;
    setIsPanelOpen(newState);
    if (onClose && !newState) {
      onClose();
    }
  };

  const handleClose = () => {
    setIsPanelOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // If panel is closed, show only the toggle button
  if (!isPanelOpen) {
    return (
      <Zoom in={!isPanelOpen}>
        <Fab
          color="primary"
          aria-label="Open AI Assistant"
          onClick={togglePanel}
          sx={{
            position: 'fixed',
            top: 100, // Position below header
            right: 24,
            zIndex: 1200,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.6)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <SmartToy sx={{ fontSize: '1.5rem' }} />
        </Fab>
      </Zoom>
    );
  }

  return (
    <>
      {/* Main AI Panel */}
      <Box
        sx={{
          width: isPanelOpen ? width : 0,
          height: '100vh',
          position: 'fixed',
          right: 0,
          top: 0,
          backgroundColor: 'background.paper',
          boxShadow: 3,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease-in-out',
          overflow: 'hidden',
          borderLeft: 1,
          borderColor: 'divider'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            minHeight: 64 // Ensure consistent header height
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <SmartToy sx={{ mr: 1, fontSize: '1.2rem' }} />
            Medical AI Assistant
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
              sx={{ color: 'inherit' }}
            >
              {isMinimized ? <ExpandMore /> : <ExpandLess />}
            </IconButton>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: 'inherit' }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Input Section */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Enter Symptoms:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                size="small"
                value={notes}
                onChange={handleNotesChange}
                onKeyPress={handleKeyPress}
                placeholder="Describe the symptoms (e.g., fever, headache, cough)..."
                disabled={isAnalyzing}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSend}
                  disabled={!notes.trim() || isAnalyzing}
                  startIcon={isAnalyzing ? <CircularProgress size={16} /> : <Send />}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearAnalysis}
                  disabled={!analysisResults}
                >
                  Clear
                </Button>
              </Box>
            </Box>

            {/* Messages */}
            {error && (
              <Alert severity="error" sx={{ m: 1 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ m: 1 }}>
                {success}
              </Alert>
            )}

            {/* Results Section */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {analysisResults ? (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    🎯 AI Analysis Results
                  </Typography>
                  
                  {analysisResults.predictions && analysisResults.predictions.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        📋 Possible Diseases:
                      </Typography>
                      {analysisResults.predictions.map((prediction, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                              {prediction.disease}
                            </Typography>
                            <Chip 
                              label={`${(prediction.confidence * 100).toFixed(1)}%`}
                              color={prediction.confidence > 0.7 ? 'success' : prediction.confidence > 0.4 ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Severity: <Chip label={prediction.severity} size="small" color="primary" />
                          </Typography>

                          {/* Symptoms */}
                          {prediction.symptoms && prediction.symptoms.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                🚨 Symptoms:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {prediction.symptoms.map((symptom, idx) => (
                                  <Chip key={idx} label={symptom} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </Box>
                          )}

                          {/* Lab Tests */}
                          {prediction.lab_tests && prediction.lab_tests.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                🧪 Recommended Lab Tests:
                              </Typography>
                              <List dense>
                                {prediction.lab_tests.map((test, idx) => (
                                  <ListItem key={idx} sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={test}
                                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

                          {/* Treatments */}
                          {prediction.treatments && prediction.treatments.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                💊 Recommended Treatments:
                              </Typography>
                              <List dense>
                                {prediction.treatments.map((treatment, idx) => (
                                  <ListItem key={idx} sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={treatment}
                                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

                          {/* Drug Interactions */}
                          {prediction.drug_interactions && prediction.drug_interactions.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                ⚠️ Drug Interactions:
                              </Typography>
                              <List dense>
                                {prediction.drug_interactions.slice(0, 3).map((interaction, idx) => (
                                  <ListItem key={idx} sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={interaction.substring(0, 100) + '...'}
                                      primaryTypographyProps={{ fontSize: '0.8rem', color: 'warning.main' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* Raw Data Toggle */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowRawData(!showRawData)}
                      startIcon={showRawData ? <ExpandLess /> : <ExpandMore />}
                    >
                      {showRawData ? 'Hide' : 'Show'} Raw Data
                    </Button>
                    
                    <Collapse in={showRawData}>
                      <Paper sx={{ p: 2, mt: 1, backgroundColor: 'grey.100' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Raw API Response:
                        </Typography>
                        <pre style={{ fontSize: '0.8rem', overflow: 'auto', maxHeight: '200px' }}>
                          {JSON.stringify(analysisResults, null, 2)}
                        </pre>
                      </Paper>
                    </Collapse>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    🏥 Medical AI Assistant
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter symptoms above to get AI-powered diagnosis, lab test recommendations, and treatment suggestions.
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Resize Handle */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 4,
            height: '100%',
            cursor: 'col-resize',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'primary.main',
              opacity: 0.3
            }
          }}
          onMouseDown={handleMouseDown}
        />
      </Box>
    </>
  );
};

export default RightSideAIPanel; 