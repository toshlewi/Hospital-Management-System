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
  Search,
  Refresh as RefreshIcon,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import pharmacyService from '../services/pharmacyService';

import Collapse from '@mui/material/Collapse';
import { patientAPI } from '../services/api';

const Pharmacy = () => {
  // State
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [newDrug, setNewDrug] = useState({ name: '', description: '', quantity: 0, unit: '', price: 0 });
  const [restockDrugId, setRestockDrugId] = useState(null);
  const [restockQty, setRestockQty] = useState(0);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(true);
  const [prescError, setPrescError] = useState('');
  const [dispenseLoading, setDispenseLoading] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [dispenseQuantities, setDispenseQuantities] = useState({});
  const [dispensedHistory, setDispensedHistory] = useState([]);
  const [showStock, setShowStock] = useState(true); // Start with stock visible
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
      let allPrescriptions = [];
      
      for (const patient of allPatients) {
        try {
          const patientPrescriptions = await patientAPI.getPrescriptions(patient.patient_id);
          
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
      
      setPrescriptions(allPrescriptions);
      setPrescError('');
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setPrescError('Failed to load prescriptions');
    } finally {
      setPrescLoading(false);
    }
  };

  // Load dispensed prescriptions for history
  const loadDispensedHistory = async () => {
    try {
      const allPatients = await patientAPI.getAllPatients();
      let allDispensedPrescriptions = [];
      
      for (const patient of allPatients) {
        try {
          const dispensedPrescriptions = await patientAPI.getDispensedPrescriptions(patient.patient_id);
          if (dispensedPrescriptions && dispensedPrescriptions.length > 0) {
            dispensedPrescriptions.forEach(prescription => {
              prescription.patient = patient;
              prescription.patient_first_name = patient.first_name;
              prescription.patient_last_name = patient.last_name;
              prescription.dispensedAt = prescription.dispensed_at ? new Date(prescription.dispensed_at).toLocaleString() : 'Unknown';
              prescription.quantityDispensed = prescription.quantity || 1;
            });
            allDispensedPrescriptions = allDispensedPrescriptions.concat(dispensedPrescriptions);
          }
        } catch (error) {
          console.error(`Error fetching dispensed prescriptions for patient ${patient.patient_id}:`, error);
        }
      }
      
      setDispensedHistory(allDispensedPrescriptions);
    } catch (err) {
      console.error('Error loading dispensed history:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDrugs();
    fetchPrescriptions();
    loadDispensedHistory();
  }, []);

  // Group prescriptions by patient and deduplicate by medication
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
    // Only add if not a duplicate medication for this patient (dispensed prescriptions are filtered by backend)
    const alreadyExists = acc[pid].prescriptions.some(p => (p.medications || p.medication_name) === (presc.medications || presc.medication_name));
    if (!alreadyExists) {
      acc[pid].prescriptions.push(presc);
    }
    return acc;
  }, {});
  // Sort prescriptions by most recent (descending by prescription_id or date)
  Object.values(patientsWithPrescriptions).forEach(p => {
    p.prescriptions.sort((a, b) => (b.prescription_id || 0) - (a.prescription_id || 0));
  });
  const patientList = Object.values(patientsWithPrescriptions);
  
  console.log('Patients with prescriptions grouped:', patientsWithPrescriptions);
  console.log('Patient list for display:', patientList);

  // Add new drug
  const handleAddDrug = async () => {
    // Validation
    if (!newDrug.name.trim()) {
      setError('Drug name is required');
      return;
    }
    if (!newDrug.description.trim()) {
      setError('Drug description is required');
      return;
    }
    if (newDrug.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (!newDrug.unit.trim()) {
      setError('Unit is required');
      return;
    }
    
    try {
      await pharmacyService.addDrug(newDrug);
      setOpenAdd(false);
      setNewDrug({ name: '', description: '', quantity: 0, unit: '', price: 0 });
      setSuccess('Drug added successfully!');
      setError('');
      fetchDrugs();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add drug: ' + (err.message || 'Unknown error'));
      setSuccess('');
    }
  };

  // Restock
  const handleRestock = async () => {
    // Validation
    if (restockQty <= 0) {
      setError('Restock quantity must be greater than 0');
      return;
    }
    
    try {
      await pharmacyService.restockDrug(restockDrugId, restockQty);
      setRestockDrugId(null);
      setRestockQty(0);
      setSuccess('Drug restocked successfully!');
      setError('');
      fetchDrugs();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to restock drug: ' + (err.message || 'Unknown error'));
      setSuccess('');
    }
  };

  // Dispense
  const handleDispense = async (prescription) => {
    setDispenseLoading(true);
    try {
      // Try all possible fields for medication name
      const medName = prescription.medications || prescription.medication_name || '';
      
      let drug = drugs.find(d => d.name.trim().toLowerCase() === medName.trim().toLowerCase());
      if (!drug) drug = drugs.find(d => d.name.toLowerCase().includes(medName.trim().toLowerCase()));
      if (!drug && medName) drug = drugs.find(d => medName.toLowerCase().startsWith(d.name.toLowerCase()));
      
      if (!drug) throw new Error(`Drug '${medName}' not found in stock. Please check the stock list or restock.`);

      const quantityToDispense = dispenseQuantities[prescription.prescription_id] || prescription.quantity || 1;
      
      await pharmacyService.dispenseDrug(drug.drug_id, quantityToDispense, prescription.prescription_id);
      
      setDispensedHistory(hist => [
        {
          ...prescription,
          dispensedAt: new Date().toLocaleString(),
          quantityDispensed: quantityToDispense
        },
        ...hist
      ]);
      // Refresh prescriptions to get updated list (dispensed ones will be filtered out by backend)
      await fetchPrescriptions();
      await fetchDrugs();
      await loadDispensedHistory(); // Refresh dispensed history
      
      setSuccess('Drug dispensed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to dispense drug');
    } finally {
      setDispenseLoading(false);
    }
  };



  // Get prescriptions for selected patient (dispensed prescriptions are filtered by backend)
  const selectedPatientPrescriptions = selectedPatientId && patientsWithPrescriptions[selectedPatientId]
    ? patientsWithPrescriptions[selectedPatientId].prescriptions
    : [];

  // Filter patient list based on search
  const filteredPatientList = patientList.filter(patient =>
    `${patient.patient_first_name} ${patient.patient_last_name}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    String(patient.patient_id).includes(patientSearch)
  );

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      overflowX: 'hidden',
      p: 0
    }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalPharmacy fontSize="large" /> Pharmacy Department
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { fetchDrugs(); fetchPrescriptions(); }}
            disabled={loading || prescLoading}
            sx={{ minWidth: 120 }}
          >
            {loading || prescLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            color="primary"
            onClick={() => setOpenAdd(true)}
            sx={{ minWidth: 120 }}
          >
            Add Drug
          </Button>
        </Box>
      </Box>

      {/* Success and Error Alerts */}
      {success && (
        <Box sx={{ px: 4, mb: 2 }}>
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Box>
      )}
      {error && (
        <Box sx={{ px: 4, mb: 2 }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Stock Section - Collapsible */}
      <Box sx={{ mb: 3, px: 4 }}>
        <Card sx={{ boxShadow: 3, mb: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {/* Stock Header - Clickable to toggle */}
            <Box 
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: showStock ? '1px solid' : 'none',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              onClick={() => setShowStock(!showStock)}
            >
              <Typography variant="h5" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                mb: 0
              }}>
                <Inventory sx={{ mr: 1 }} /> Pharmacy Stock
                <Chip 
                  label={`${drugs.length} items`} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 2 }}
                />
              </Typography>
              <IconButton size="small">
                {showStock ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            
            {/* Stock Content - Collapsible */}
            <Collapse in={showStock}>
              <Box sx={{ p: 2 }}>
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
                            <Button 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setRestockDrugId(drug.drug_id);
                              }}
                            >
                              Restock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 300px)', width: '100%', px: 4, m: 0 }}>
        {/* Left Sidebar - Pending Prescriptions */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Card sx={{ 
            boxShadow: 3,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
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
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          {selectedPatientId && patientsWithPrescriptions[selectedPatientId] ? (
            <Card sx={{ 
              boxShadow: 3, 
              mb: 3,
              height: '100%',
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
                          <TableCell>{presc.medications || presc.medication_name}</TableCell>
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
                              <Button variant="contained" size="small" disabled={dispenseLoading} onClick={() => handleDispense(presc)}>
                                Dispense
                              </Button>
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
          <TextField label="Price" type="number" fullWidth margin="dense" value={newDrug.price || 0} onChange={e => setNewDrug({ ...newDrug, price: Number(e.target.value) })} />
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
                    <TableCell>{item.medications || item.medication_name}</TableCell>
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
    </Box>
  );
};

export default Pharmacy;