import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Collapse,
  IconButton,
  Tooltip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Badge
} from '@mui/material';
import {
  MedicalInformation as MedicalIcon,
  LocalHospital as HospitalIcon,
  Science as LabIcon,
  Medication as MedsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as IdeaIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  History as HistoryIcon
} from '@mui/icons-material';

const AIDiagnosis = ({ patientId, patientData }) => {
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [realtimeSuggestions, setRealtimeSuggestions] = useState([]);

  const steps = ['Enter Symptoms', 'Review AI Analysis', 'Confirm Diagnosis'];

  // Simulate real-time suggestions as doctor types
  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    if (symptoms.trim().length > 3) {
      const timeout = setTimeout(() => {
        // Simulate API call for real-time suggestions
        const mockRealtimeSuggestions = [
          { term: 'fever', type: 'symptom' },
          { term: 'headache', type: 'symptom' },
          { term: 'influenza', type: 'condition' },
          { term: 'common cold', type: 'condition' },
        ].filter(item => 
          item.term.toLowerCase().includes(symptoms.toLowerCase().slice(-5))
        );
        
        setRealtimeSuggestions(mockRealtimeSuggestions);
      }, 500);
      
      setTypingTimeout(timeout);
    } else {
      setRealtimeSuggestions([]);
    }
    
    return () => clearTimeout(typingTimeout);
  }, [symptoms]);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    setActiveStep(1);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response from AI
      const mockResponse = {
        possibleDiagnoses: [
          { 
            condition: 'Upper Respiratory Infection', 
            confidence: 0.87,
            icd10: 'J06.9',
            description: 'Acute upper respiratory infection, unspecified',
            symptoms: ['cough', 'sore throat', 'nasal congestion'],
            treatments: [
              { name: 'Rest', type: 'general' },
              { name: 'Hydration', type: 'general' },
              { name: 'Acetaminophen', type: 'medication' },
              { name: 'Ibuprofen', type: 'medication' },
            ]
          },
          { 
            condition: 'Allergic Rhinitis', 
            confidence: 0.72,
            icd10: 'J30.9',
            description: 'Allergic rhinitis, unspecified',
            symptoms: ['sneezing', 'itchy eyes', 'nasal congestion'],
            treatments: [
              { name: 'Antihistamines', type: 'medication' },
              { name: 'Nasal corticosteroids', type: 'medication' },
              { name: 'Allergen avoidance', type: 'general' },
            ]
          },
          { 
            condition: 'Influenza', 
            confidence: 0.65,
            icd10: 'J11.1',
            description: 'Influenza with other respiratory manifestations, virus not identified',
            symptoms: ['fever', 'body aches', 'fatigue'],
            treatments: [
              { name: 'Oseltamivir', type: 'medication' },
              { name: 'Rest', type: 'general' },
              { name: 'Hydration', type: 'general' },
            ]
          }
        ],
        recommendedTests: [
          { name: 'Complete Blood Count', code: 'CBC', reason: 'Check for infection' },
          { name: 'Rapid Strep Test', code: 'STREP', reason: 'Rule out streptococcal pharyngitis' },
          { name: 'Influenza Test', code: 'FLU', reason: 'If influenza suspected' },
        ],
        differentialDiagnosis: [
          { condition: 'COVID-19', confidence: 0.45, reason: 'Consider if recent exposure' },
          { condition: 'Strep Throat', confidence: 0.38, reason: 'Consider if severe sore throat present' },
        ],
        clinicalGuidelines: [
          {
            title: 'CDC Guidelines for URI',
            url: 'https://www.cdc.gov/antibiotic-use/community/for-patients/common-illnesses/uri.html',
            summary: 'Most URIs are viral and do not require antibiotics'
          }
        ],
        riskFactors: [
          { factor: 'Recent exposure to sick contacts', relevance: 'high' },
          { factor: 'Seasonal allergies', relevance: 'medium' },
          { factor: 'Smoking history', relevance: 'low' },
        ],
        confidenceScore: 0.82,
        nextSteps: [
          'Monitor for fever progression',
          'Follow up in 3 days if symptoms worsen',
          'Consider chest X-ray if cough persists beyond 10 days'
        ]
      };
      
      setSuggestions(mockResponse);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSuggestions(null);
  };

  const handleSuggestionClick = (term) => {
    setSymptoms(prev => `${prev}${prev ? ', ' : ''}${term}`);
    setRealtimeSuggestions([]);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }} className="fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <MedicalIcon color="primary" sx={{ fontSize: 32, mr: 1.5 }} />
        <Typography variant="h5" component="h2">
          AI Diagnostic Assistant
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          {patientData && (
            <Alert 
              severity="info" 
              icon={<HistoryIcon />}
              sx={{ mb: 2 }}
            >
              <strong>Patient History:</strong> {patientData.conditions?.join(', ') || 'No significant history'}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Patient Symptoms"
            placeholder="Describe the patient's symptoms in detail (e.g., fever, headache, cough)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            sx={{ mb: 2 }}
          />

          {realtimeSuggestions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Quick suggestions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {realtimeSuggestions.map((item, index) => (
                  <Chip
                    key={index}
                    label={item.term}
                    size="small"
                    onClick={() => handleSuggestionClick(item.term)}
                    icon={item.type === 'condition' ? <HospitalIcon fontSize="small" /> : <MedicalIcon fontSize="small" />}
                    color={item.type === 'condition' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Clinical Notes"
            placeholder="Additional observations, vital signs, or relevant information..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !symptoms.trim()}
              startIcon={isAnalyzing ? null : <IdeaIcon />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 1 && suggestions && (
        <Box className="slide-up">
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
            AI Analysis Results
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            AI confidence score: <strong>{Math.round(suggestions.confidenceScore * 100)}%</strong>
          </Alert>

          {/* Possible Diagnoses */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => handleSectionToggle('diagnoses')}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                <Badge badgeContent={suggestions.possibleDiagnoses.length} color="primary" sx={{ mr: 1 }}>
                  Possible Diagnoses
                </Badge>
              </Typography>
              <IconButton size="small">
                {expandedSection === 'diagnoses' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSection === 'diagnoses'}>
              <List dense sx={{ mt: 1 }}>
                {suggestions.possibleDiagnoses.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, flexGrow: 1 }}>
                              {item.condition} ({item.icd10})
                            </span>
                            <Chip 
                              label={`${Math.round(item.confidence * 100)}%`} 
                              size="small" 
                              color={
                                item.confidence > 0.8 ? 'success' : 
                                item.confidence > 0.6 ? 'warning' : 'error'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                <strong>Symptoms:</strong> {item.symptoms.join(', ')}
                              </Typography>
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              {item.treatments.map((treatment, tIdx) => (
                                <Chip
                                  key={tIdx}
                                  label={treatment.name}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                  variant={treatment.type === 'medication' ? 'filled' : 'outlined'}
                                  color={treatment.type === 'medication' ? 'primary' : 'default'}
                                />
                              ))}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                    {index < suggestions.possibleDiagnoses.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </Paper>

          {/* Recommended Tests */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
            <Box 
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleSectionToggle('tests')}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Recommended Tests
              </Typography>
              <IconButton size="small">
                {expandedSection === 'tests' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSection === 'tests'}>
              <List dense sx={{ mt: 1 }}>
                {suggestions.recommendedTests.map((test, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LabIcon color="action" sx={{ mr: 1.5, fontSize: 20 }} />
                          <span style={{ fontWeight: 500 }}>
                            {test.name} ({test.code})
                          </span>
                        </Box>
                      }
                      secondary={test.reason}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>

          {/* Differential Diagnosis */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
            <Box 
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleSectionToggle('differential')}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Differential Diagnosis
              </Typography>
              <IconButton size="small">
                {expandedSection === 'differential' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSection === 'differential'}>
              <List dense sx={{ mt: 1 }}>
                {suggestions.differentialDiagnosis.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WarningIcon color="warning" sx={{ mr: 1.5, fontSize: 20 }} />
                          <span style={{ fontWeight: 500 }}>
                            {item.condition}
                          </span>
                          <Chip 
                            label={`${Math.round(item.confidence * 100)}%`} 
                            size="small" 
                            color="default"
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      }
                      secondary={item.reason}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>

          {/* Next Steps */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            <Box 
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleSectionToggle('nextSteps')}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Recommended Next Steps
              </Typography>
              <IconButton size="small">
                {expandedSection === 'nextSteps' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSection === 'nextSteps'}>
              <List dense sx={{ mt: 1 }}>
                {suggestions.nextSteps.map((step, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckIcon color="success" sx={{ mr: 1.5, fontSize: 20 }} />
                          {step}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Button 
              variant="contained" 
              onClick={handleNext}
              endIcon={<MedicalIcon />}
            >
              Continue to Diagnosis
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <Box className="slide-up">
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
            Confirm Final Diagnosis
          </Typography>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            Review and confirm the diagnosis to add to the patient's medical record
          </Alert>

          <TextField
            select
            fullWidth
            label="Select Primary Diagnosis"
            defaultValue=""
            sx={{ mb: 3 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            {suggestions?.possibleDiagnoses.map((option, index) => (
              <option key={index} value={option.condition}>
                {option.condition} ({option.icd10}) - {Math.round(option.confidence * 100)}% confidence
              </option>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Treatment Plan"
            placeholder="Enter the treatment plan based on the diagnosis..."
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined"
                onClick={handleReset}
              >
                Start Over
              </Button>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<CheckIcon />}
              >
                Confirm Diagnosis
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default AIDiagnosis;