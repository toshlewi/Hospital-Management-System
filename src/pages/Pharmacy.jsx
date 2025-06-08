import React, { useState, useEffect } from 'react';
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
  Badge
} from '@mui/material';
import {
  LocalPharmacy,
  Medication,
  Inventory,
  History,
  AutoFixHigh,
  CheckCircle,
  Warning,
  Info,
  Add,
  Remove
} from '@mui/icons-material';

// Mock AI Service
const mockAIService = {
  analyzePrescription: (patientHistory, currentPrescription) => {
    // This would be replaced with actual AI calls in a real implementation
    const interactions = [];
    const suggestions = [];
    
    // Sample drug interaction check
    if (currentPrescription.some(drug => drug.name === 'Simvastatin') && 
        currentPrescription.some(drug => drug.name === 'Clarithromycin')) {
      interactions.push({
        severity: 'high',
        message: 'Simvastatin + Clarithromycin: Risk of myopathy/rhabdomyolysis',
        drugs: ['Simvastatin', 'Clarithromycin']
      });
    }
    
    // Sample dosage adjustment
    if (patientHistory.some(med => med.name === 'Warfarin')) {
      suggestions.push({
        type: 'dosage',
        message: 'Consider reduced Warfarin dosage due to potential interaction with new NSAID prescription',
        drug: 'Warfarin'
      });
    }
    
    // Sample alternative suggestion
    if (currentPrescription.some(drug => drug.name === 'Diphenhydramine' && drug.dosage > 50)) {
      suggestions.push({
        type: 'alternative',
        message: 'Consider Cetirizine as alternative to Diphenhydramine for reduced sedation',
        drugs: ['Diphenhydramine', 'Cetirizine']
      });
    }
    
    return { interactions, suggestions };
  }
};

const Pharmacy = () => {
  // State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [stock, setStock] = useState([]);
  const [newStockItem, setNewStockItem] = useState({ name: '', quantity: 0 });
  const [aiInsights, setAiInsights] = useState({ interactions: [], suggestions: [] });
  const [aiActivity, setAiActivity] = useState([]);

  // Mock data
  const pendingPrescriptions = [
    {
      id: 'RX1001',
      patient: { id: 'P1001', name: 'John Doe', age: 38 },
      date: '2023-06-15',
      doctor: 'Dr. Sarah Johnson',
      status: 'pending',
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '7 days' },
        { name: 'Ibuprofen', dosage: '400mg', frequency: 'as needed', duration: '5 days' }
      ]
    },
    {
      id: 'RX1002',
      patient: { id: 'P1002', name: 'Jane Smith', age: 32 },
      date: '2023-06-16',
      doctor: 'Dr. Michael Chen',
      status: 'pending',
      medications: [
        { name: 'Simvastatin', dosage: '20mg', frequency: 'at bedtime', duration: '30 days' },
        { name: 'Clarithromycin', dosage: '500mg', frequency: '2 times daily', duration: '14 days' }
      ]
    },
    {
      id: 'RX1003',
      patient: { id: 'P1003', name: 'Robert Johnson', age: 45 },
      date: '2023-06-17',
      doctor: 'Dr. Emily Wilson',
      status: 'pending',
      medications: [
        { name: 'Metformin', dosage: '1000mg', frequency: '2 times daily', duration: '30 days' },
        { name: 'Lisinopril', dosage: '10mg', frequency: 'daily', duration: '30 days' }
      ]
    }
  ];

  const patientHistory = {
    'P1001': [
      { name: 'Amoxicillin', date: '2023-01-10', dosage: '500mg', duration: '7 days' },
      { name: 'Ibuprofen', date: '2022-11-15', dosage: '400mg', duration: '5 days' }
    ],
    'P1002': [
      { name: 'Simvastatin', date: '2022-09-01', dosage: '20mg', duration: 'Ongoing' },
      { name: 'Warfarin', date: '2023-03-10', dosage: '5mg', duration: 'Ongoing' }
    ],
    'P1003': [
      { name: 'Metformin', date: '2022-06-01', dosage: '500mg', duration: 'Ongoing' },
      { name: 'Diphenhydramine', date: '2023-05-20', dosage: '50mg', duration: '7 days' }
    ]
  };

  // Mock initial stock
  useEffect(() => {
    setStock([
      { id: 'M001', name: 'Amoxicillin 500mg', quantity: 125, threshold: 50 },
      { id: 'M002', name: 'Ibuprofen 400mg', quantity: 89, threshold: 30 },
      { id: 'M003', name: 'Simvastatin 20mg', quantity: 42, threshold: 20 },
      { id: 'M004', name: 'Clarithromycin 500mg', quantity: 37, threshold: 15 },
      { id: 'M005', name: 'Metformin 1000mg', quantity: 68, threshold: 25 }
    ]);
  }, []);

  // Handle prescription selection
  const handleSelectPrescription = (prescription) => {
    setSelectedPatient(prescription);
    // Run AI analysis when prescription is selected
    const analysis = mockAIService.analyzePrescription(
      patientHistory[prescription.patient.id] || [],
      prescription.medications
    );
    setAiInsights(analysis);
    
    // Add to AI activity log
    const newActivity = {
      timestamp: new Date().toLocaleTimeString(),
      message: `Analyzing prescription for ${prescription.patient.name}`,
      insights: analysis
    };
    setAiActivity(prev => [newActivity, ...prev].slice(0, 5)); // Keep last 5 items
  };

  // Handle stock update
  const handleStockUpdate = (id, action) => {
    setStock(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        quantity: action === 'add' ? item.quantity + 1 : Math.max(0, item.quantity - 1) 
      } : item
    ));
  };

  // Handle new stock item
  const handleAddStockItem = () => {
    if (newStockItem.name && newStockItem.quantity > 0) {
      setStock(prev => [...prev, {
        id: `M${100 + prev.length}`,
        name: newStockItem.name,
        quantity: newStockItem.quantity,
        threshold: 10
      }]);
      setNewStockItem({ name: '', quantity: 0 });
    }
  };

  // Handle prescription fulfillment
  const handleFulfillPrescription = (prescriptionId) => {
    // In a real app, this would update the prescription status in the backend
    console.log(`Fulfilled prescription ${prescriptionId}`);
    setAiActivity(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      message: `Prescription ${prescriptionId} fulfilled`,
      type: 'fulfillment'
    }, ...prev]);
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 3,
        mt: 8, // Add margin top to account for fixed header
        minHeight: 'calc(100vh - 64px)', // Subtract header height
        backgroundColor: '#f5f5f5',
        '& .MuiCard-root': {
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        },
        '& .MuiCardContent-root': {
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Grid container spacing={3}>
        {/* Left Sidebar - Pending Prescriptions */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            boxShadow: 3,
            height: 'calc(100vh - 100px)', // Adjust height to account for header and padding
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
                <Badge badgeContent={pendingPrescriptions.length} color="primary">
                  <Medication sx={{ mr: 1 }} /> Pending Prescriptions
                </Badge>
              </Typography>
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
                {pendingPrescriptions.map((rx) => (
                  <React.Fragment key={rx.id}>
                    <ListItem 
                      button 
                      selected={selectedPatient?.id === rx.id}
                      onClick={() => handleSelectPrescription(rx)}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          '&:hover': { bgcolor: 'primary.light' }
                        }
                      }}
                    >
                      <ListItemText
                        primary={rx.patient.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" display="block">
                              {rx.date} · {rx.doctor}
                            </Typography>
                            <Typography component="span" variant="body2">
                              {rx.medications.length} medication(s)
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content - Patient Prescription Details */}
        <Grid item xs={12} md={6}>
          {selectedPatient ? (
            <Card sx={{ 
              boxShadow: 3, 
              mb: 3,
              height: 'calc(100vh - 100px)',
              overflow: 'auto'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="h5" sx={{ color: 'primary.main' }}>
                    {selectedPatient.patient.name} (Age: {selectedPatient.patient.age})
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<CheckCircle />}
                    onClick={() => handleFulfillPrescription(selectedPatient.id)}
                    sx={{
                      px: 3,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    Fulfill Prescription
                  </Button>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main',
                  mb: 2
                }}>
                  <LocalPharmacy sx={{ mr: 1 }} /> Prescribed Medications
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Medication</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dosage</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Frequency</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPatient.medications.map((med, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{med.name}</TableCell>
                          <TableCell>{med.dosage}</TableCell>
                          <TableCell>{med.frequency}</TableCell>
                          <TableCell>{med.duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="subtitle1" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main',
                  mb: 2
                }}>
                  <History sx={{ mr: 1 }} /> Medication History
                </Typography>
                
                {patientHistory[selectedPatient.patient.id]?.length > 0 ? (
                  <List dense sx={{ 
                    mb: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                  }}>
                    {patientHistory[selectedPatient.patient.id].map((med, index) => (
                      <ListItem key={index} divider={index !== patientHistory[selectedPatient.patient.id].length - 1}>
                        <ListItemText
                          primary={med.name}
                          secondary={`${med.dosage} · ${med.date} · ${med.duration}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    No previous medication history found.
                  </Typography>
                )}

                {/* Stock Update Section */}
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main',
                  mb: 2
                }}>
                  <Inventory sx={{ mr: 1 }} /> Pharmacy Stock
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'primary.light' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Medication</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stock.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            {item.name}
                            {item.quantity < item.threshold && (
                              <Chip 
                                label="Low Stock" 
                                size="small" 
                                color="warning" 
                                sx={{ ml: 1 }} 
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              onClick={() => handleStockUpdate(item.id, 'remove')}
                              sx={{ '&:hover': { color: 'error.main' } }}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleStockUpdate(item.id, 'add')}
                              sx={{ '&:hover': { color: 'success.main' } }}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 2,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1
                }}>
                  <TextField
                    label="New Medication"
                    size="small"
                    value={newStockItem.name}
                    onChange={(e) => setNewStockItem({...newStockItem, name: e.target.value})}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Quantity"
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    value={newStockItem.quantity}
                    onChange={(e) => setNewStockItem({...newStockItem, quantity: parseInt(e.target.value) || 0})}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={handleAddStockItem}
                    sx={{
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    Add
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
                  Select a prescription from the left to view details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Sidebar - AI Assistant */}
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
                <AutoFixHigh sx={{ mr: 1 }} /> AI Pharmacy Assistant
              </Typography>
              
              {selectedPatient ? (
                <>
                  {/* AI Insights */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                      Drug Interactions
                    </Typography>
                    {aiInsights.interactions.length > 0 ? (
                      aiInsights.interactions.map((interaction, index) => (
                        <Box key={index} sx={{ 
                          p: 1.5, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: interaction.severity === 'high' ? 'error.light' : 'warning.light',
                          boxShadow: 1
                        }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Warning fontSize="small" sx={{ mr: 1, mt: '2px' }} />
                            {interaction.message}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No significant interactions detected.
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                      Recommendations
                    </Typography>
                    {aiInsights.suggestions.length > 0 ? (
                      aiInsights.suggestions.map((suggestion, index) => (
                        <Box key={index} sx={{ 
                          p: 1.5, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: 'info.light',
                          boxShadow: 1
                        }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Info fontSize="small" sx={{ mr: 1, mt: '2px' }} />
                            {suggestion.message}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recommendations at this time.
                      </Typography>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                    AI Activity Log
                  </Typography>
                  <Box sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    p: 1,
                    boxShadow: 1
                  }}>
                    {aiActivity.map((activity, index) => (
                      <Box key={index} sx={{ 
                        mb: 1.5,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'grey.50'
                      }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {activity.timestamp}
                        </Typography>
                        <Typography variant="body2">{activity.message}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Select a prescription to activate AI analysis.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Pharmacy;