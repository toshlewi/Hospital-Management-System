import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItemText,
  ListItemButton,
  Divider,
  TextField,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Science as LabIcon,
  PhotoCamera as ImagingIcon,
  LocalHospital as AdmitIcon,
  Edit as EditIcon,
  Keyboard as KeyboardIcon,
} from '@mui/icons-material';

const Outpatient = () => {
  const theme = useTheme();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  // Mock patient data - replace with actual data from your backend
  const patients = [
    { id: 1, name: 'John Doe', age: 45, gender: 'Male', visitTime: '09:00 AM' },
    { id: 2, name: 'Jane Smith', age: 32, gender: 'Female', visitTime: '09:30 AM' },
    { id: 3, name: 'Robert Johnson', age: 28, gender: 'Male', visitTime: '10:00 AM' },
    { id: 4, name: 'Sarah Williams', age: 35, gender: 'Female', visitTime: '10:30 AM' },
  ];

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleAdmitPatient = () => {
    // Implement admission logic
    console.log('Admitting patient:', selectedPatient);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, color: theme.palette.primary.main }}>
        Outpatient Department
      </Typography>
      
      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Patient List - Left Column */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
              Patient Queue
            </Typography>
            <List>
              {patients.map((patient) => (
                <React.Fragment key={patient.id}>
                  <ListItemButton
                    selected={selectedPatient?.id === patient.id}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <ListItemText
                      primary={patient.name}
                      secondary={`${patient.age} years • ${patient.gender} • ${patient.visitTime}`}
                    />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Patient Details and Notes - Middle Column */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedPatient ? (
              <>
                {/* Patient Information */}
                <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
                  <Typography variant="h6">
                    {selectedPatient.name} - {selectedPatient.age} years
                  </Typography>
                </Box>

                {/* Patient History and Notes */}
                <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Patient History
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Enter patient history..."
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">Clinical Impression</Typography>
                      <IconButton onClick={() => setIsDrawingMode(!isDrawingMode)}>
                        {isDrawingMode ? <KeyboardIcon /> : <EditIcon />}
                      </IconButton>
                    </Box>
                    {isDrawingMode ? (
                      <Box
                        sx={{
                          height: 200,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        {/* Implement drawing canvas here */}
                      </Box>
                    ) : (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Enter clinical impression..."
                      />
                    )}
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<LabIcon />}
                        onClick={() => {/* Implement lab request */}}
                      >
                        Request Lab Test
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ImagingIcon />}
                        onClick={() => {/* Implement imaging request */}}
                      >
                        Request Imaging
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<AdmitIcon />}
                        onClick={handleAdmitPatient}
                      >
                        Admit Patient
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a patient to view details
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* AI Suggestions - Right Column */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Based on the patient's symptoms and history, here are some suggestions:
              </Typography>
              
              {/* Suggested Questions */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Suggested Questions
                </Typography>
                <List dense>
                  <ListItemText primary="When did the symptoms first appear?" />
                  <ListItemText primary="Have you experienced similar symptoms before?" />
                  <ListItemText primary="Are you currently taking any medications?" />
                </List>
              </Box>

              {/* Suggested Tests */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recommended Tests
                </Typography>
                <List dense>
                  <ListItemText 
                    primary="Complete Blood Count (CBC)"
                    secondary="Priority: High"
                  />
                  <ListItemText 
                    primary="Chest X-Ray"
                    secondary="Priority: Medium"
                  />
                </List>
              </Box>

              {/* Suggested Medications */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Possible Medications
                </Typography>
                <List dense>
                  <ListItemText 
                    primary="Ibuprofen 400mg"
                    secondary="Every 6 hours as needed"
                  />
                  <ListItemText 
                    primary="Amoxicillin 500mg"
                    secondary="Three times daily"
                  />
                </List>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Outpatient; 