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
  ListItemButton,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  LocalPharmacy,
  Medication,
  Inventory,
  History,
  CheckCircle,
  Warning,
  Info,
  Add,
  Remove,
  Search
} from '@mui/icons-material';
import pharmacyService from '../services/pharmacyService';

import Collapse from '@mui/material/Collapse';
import { patientAPI } from '../services/api';

const Pharmacy = () => {
  // State
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [newDrug, setNewDrug] = useState({ name: '', description: '', quantity: 0, unit: '' });
  const [restockDrugId, setRestockDrugId] = useState(null);
  const [restockQty, setRestockQty] = useState(0);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(true);
  const [prescError, setPrescError] = useState('');
  const [dispenseLoading, setDispenseLoading] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [dispensedIds, setDispensedIds] = useState([]);
  const [dispenseQuantities, setDispenseQuantities] = useState({});
  const [dispensedHistory, setDispensedHistory] = useState([]);
  const [showStock, setShowStock] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  // Fetch stock
  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.getAllDrugs();
      setDrugs(data);
      setError('');
    } catch (err) {
      setError('Failed to load drugs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    setPrescLoading(true);
    try {
      const allPatients = await patientAPI.getAllPatients();
      console.log('All patients:', allPatients);
      let allPrescriptions = [];
      
      for (const patient of allPatients) {
        try {
          console.log(`Fetching prescriptions for patient ${patient.patient_id} (${patient.first_name} ${patient.last_name})`);
          const patientPrescriptions = await patientAPI.getPrescriptions(patient.patient_id);
          console.log(`Prescriptions for ${patient.first_name}:`, patientPrescriptions);
          
          if (patientPrescriptions && patientPrescriptions.length > 0) {
            patientPrescriptions.forEach(prescription => {
              prescription.patient = patient;
              prescription.patient_first_name = patient.first_name;
              prescription.patient_last_name = patient.last_name;
            });
            allPrescriptions = allPrescriptions.concat(patientPrescriptions);
          }
        } catch (error) {
          console.error(`Error fetching prescriptions for patient ${patient.patient_id}:`, error);
        }
      }
      
      console.log('All prescriptions fetched:', allPrescriptions);
      setPrescriptions(allPrescriptions);
      setPrescError('');
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setPrescError('Failed to load prescriptions');
    } finally {
      setPrescLoading(false);
    }
  };

  useEffect(() => { fetchDrugs(); fetchPrescriptions(); }, []);

  // Group prescriptions by patient
  const patientsWithPrescriptions = prescriptions.reduce((acc, presc) => {
    const pid = presc.patient_id;
    if (!acc[pid]) {
      acc[pid] = {
        patient_id: pid,
        patient_first_name: presc.patient_first_name,
        patient_last_name: presc.patient_last_name,
        prescriptions: []
      };
    }
    acc[pid].prescriptions.push(presc);
    return acc;
  }, {});
  const patientList = Object.values(patientsWithPrescriptions);
  
  console.log('Patients with prescriptions grouped:', patientsWithPrescriptions);
  console.log('Patient list for display:', patientList);

  // Add new drug
  const handleAddDrug = async () => {
    try {
      await pharmacyService.addDrug(newDrug);
      setOpenAdd(false);
      setNewDrug({ name: '', description: '', quantity: 0, unit: '' });
      fetchDrugs();
    } catch (err) {
      setError('Failed to add drug');
    }
  };

  // Restock
  const handleRestock = async () => {
    try {
      await pharmacyService.restockDrug(restockDrugId, restockQty);
      setRestockDrugId(null);
      setRestockQty(0);
      fetchDrugs();
    } catch (err) {
      setError('Failed to restock drug');
    }
  };

  // Dispense
  const handleDispense = async (prescription) => {
    setDispenseLoading(true);
    try {
      // Try exact match first
      let drug = drugs.find(d => d.name.trim().toLowerCase() === prescription.medications.trim().toLowerCase());
      // Then try includes
      if (!drug) drug = drugs.find(d => d.name.toLowerCase().includes(prescription.medications.trim().toLowerCase()));
      // Then try startsWith (for cases like 'Paracetamol 500mg')
      if (!drug) drug = drugs.find(d => prescription.medications.toLowerCase().startsWith(d.name.toLowerCase()));

      if (!drug) throw new Error(`Drug '${prescription.medications}' not found in stock. Please check the stock list or restock.`);

      const quantityToDispense = dispenseQuantities[prescription.prescription_id] || prescription.quantity || 1;
      await pharmacyService.dispenseDrug(drug.drug_id, quantityToDispense, prescription.prescription_id);
      setDispensedIds(ids => [...ids, prescription.prescription_id]);
      setDispensedHistory(hist => [
        {
          ...prescription,
          dispensedAt: new Date().toLocaleString(),
          quantityDispensed: quantityToDispense
        },
        ...hist
      ]);
      await fetchDrugs();
      await fetchPrescriptions(); // Always refresh after dispensing
      setError('');
    } catch (err) {
      setError('Failed to dispense drug: ' + (err.message || ''));
      alert('Failed to dispense drug: ' + (err.message || ''));
    } finally {
      setDispenseLoading(false);
    }
  };



  // Get prescriptions for selected patient
  const selectedPatientPrescriptions = selectedPatientId && patientsWithPrescriptions[selectedPatientId]
    ? patientsWithPrescriptions[selectedPatientId].prescriptions.filter(p => !dispensedIds.includes(p.prescription_id))
    : [];

  // Filter patient list based on search
  const filteredPatientList = patientList.filter(patient =>
    `${patient.patient_first_name} ${patient.patient_last_name}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    String(patient.patient_id).includes(patientSearch)
  );

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 3,
        mt: 8, // Add margin top to account for fixed header
        minHeight: '100vh', // Full screen height
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
        <Grid item xs={12} md={4}>
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
                <Badge badgeContent={filteredPatientList.length} color="primary">
                  <Medication sx={{ mr: 1 }} /> Pending Prescriptions
                </Badge>
              </Typography>
              <TextField
                label="Search patients by name or ID"
                variant="outlined"
                size="small"
                fullWidth
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>Pending Prescriptions</Typography>
                {prescError && <Alert severity="error">{prescError}</Alert>}
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Prescriptions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prescLoading ? (
                        <TableRow><TableCell colSpan={2}>Loading...</TableCell></TableRow>
                      ) : filteredPatientList.length === 0 ? (
                        <TableRow><TableCell colSpan={2}>No patients with pending prescriptions</TableCell></TableRow>
                      ) : (
                        <List>
                          {filteredPatientList.map(patient => (
                            <React.Fragment key={patient.patient_id}>
                              <ListItem disablePadding>
                                <ListItemButton
                                  selected={selectedPatientId === patient.patient_id}
                                  onClick={() => setSelectedPatientId(patient.patient_id)}
                                >
                                  <ListItemText primary={`${patient.patient_first_name} ${patient.patient_last_name}`} />
                                </ListItemButton>
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))}
                        </List>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content - Patient Prescription Details */}
        <Grid item xs={12} md={8}>
          {selectedPatientId && patientsWithPrescriptions[selectedPatientId] ? (
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
                    {patientsWithPrescriptions[selectedPatientId].patient_first_name} {patientsWithPrescriptions[selectedPatientId].patient_last_name} (Age: {patientsWithPrescriptions[selectedPatientId].patient_age})
                  </Typography>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main',
                  mb: 2
                }}>
                  <LocalPharmacy sx={{ mr: 1 }} /> Prescribed Medications
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 2, borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'primary.light' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Medication</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dosage</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Frequency</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity Prescribed</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPatientPrescriptions.length === 0 ? (
                        <TableRow><TableCell colSpan={6}>No pending prescriptions for this patient.</TableCell></TableRow>
                      ) : selectedPatientPrescriptions.map(presc => (
                        <TableRow key={presc.prescription_id}>
                          <TableCell>{presc.medications}</TableCell>
                          <TableCell>{presc.dosage}</TableCell>
                          <TableCell>{presc.frequency || '-'}</TableCell>
                          <TableCell>{presc.duration || '-'}</TableCell>
                          <TableCell>{presc.quantity}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                label="Qty"
                                type="number"
                                size="small"
                                value={dispenseQuantities[presc.prescription_id] ?? presc.quantity}
                                onChange={e => setDispenseQuantities(q => ({ ...q, [presc.prescription_id]: Number(e.target.value) }))}
                                inputProps={{ min: 1, style: { width: 60 } }}
                                sx={{ mr: 1 }}
                              />
                              {dispensedIds.includes(presc.prescription_id) ? (
                                <Alert severity="success" sx={{ p: 0.5, m: 0 }}>Dispensed</Alert>
                              ) : (
                                <>
                                  <Button variant="contained" size="small" disabled={dispenseLoading} onClick={() => handleDispense(presc)}>
                                    Dispense
                                  </Button>

                                </>
                              )}
                            </Box>
                          </TableCell>
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
                
                {/* Add medication history display */}

                {/* Stock Update Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main',
                    mb: 2
                  }}>
                    <LocalPharmacy sx={{ mr: 1 }} /> Pharmacy Stock
                  </Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'primary.light' }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Unit</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Restocked</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                        ) : drugs.length === 0 ? (
                          <TableRow><TableCell colSpan={6}>No drugs in stock. (Check backend data and API mapping.)</TableCell></TableRow>
                        ) : drugs.map(drug => (
                          <TableRow key={drug.drug_id}>
                            <TableCell>{drug.name}</TableCell>
                            <TableCell>{drug.description}</TableCell>
                            <TableCell>{drug.quantity}</TableCell>
                            <TableCell>{drug.unit}</TableCell>
                            <TableCell>{new Date(drug.last_restocked).toLocaleString()}</TableCell>
                            <TableCell>
                              <Button size="small" onClick={() => setRestockDrugId(drug.drug_id)}>Restock</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                
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
                    value={newDrug.name}
                    onChange={(e) => setNewDrug({...newDrug, name: e.target.value})}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Quantity"
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    value={newDrug.quantity}
                    onChange={(e) => setNewDrug({...newDrug, quantity: parseInt(e.target.value) || 0})}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setOpenAdd(true)}
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
                  {selectedPatientId ? "No pending prescriptions for this patient." : "Select a patient from the left to view their prescriptions"}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Add Drug Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add New Drug</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense" value={newDrug.name} onChange={e => setNewDrug({ ...newDrug, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="dense" value={newDrug.description} onChange={e => setNewDrug({ ...newDrug, description: e.target.value })} />
          <TextField label="Quantity" type="number" fullWidth margin="dense" value={newDrug.quantity} onChange={e => setNewDrug({ ...newDrug, quantity: Number(e.target.value) })} />
          <TextField label="Unit" fullWidth margin="dense" value={newDrug.unit} onChange={e => setNewDrug({ ...newDrug, unit: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddDrug} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={!!restockDrugId} onClose={() => setRestockDrugId(null)}>
        <DialogTitle>Restock Drug</DialogTitle>
        <DialogContent>
          <TextField label="Quantity to Add" type="number" fullWidth margin="dense" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestockDrugId(null)}>Cancel</Button>
          <Button onClick={handleRestock} variant="contained">Restock</Button>
        </DialogActions>
      </Dialog>



      {/* Dispensed History Section */}
      {dispensedHistory.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Dispensed History</Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.200' }}>
                <TableRow>
                  <TableCell>Medication</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Quantity Dispensed</TableCell>
                  <TableCell>Dispensed At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dispensedHistory.map((item, idx) => (
                  <TableRow key={item.prescription_id + '-' + idx}>
                    <TableCell>{item.medications}</TableCell>
                    <TableCell>{item.dosage}</TableCell>
                    <TableCell>{item.frequency || '-'}</TableCell>
                    <TableCell>{item.duration || '-'}</TableCell>
                    <TableCell>{item.quantityDispensed}</TableCell>
                    <TableCell>{item.dispensedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

export default Pharmacy;