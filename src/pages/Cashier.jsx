import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Dashboard as DashboardIcon,
  ExpandMore as ExpandMoreIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { billingService } from '../services/billingService';
import { patientAPI } from '../services/api';

const Cashier = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [billingItems, setBillingItems] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // New Bill Dialog
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [billNotes, setBillNotes] = useState('');

  // Payment Dialog
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, patientsRes, billsRes, paymentsRes, summaryRes] = await Promise.all([
        billingService.getBillingItems(),
        patientAPI.getAllPatients(),
        billingService.getBills(),
        billingService.getPayments(),
        billingService.getBillingSummary()
      ]);

      setBillingItems(itemsRes);
      setPatients(patientsRes);
      setBills(billsRes);
      setPayments(paymentsRes);
      setSummary(summaryRes);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find(i => i.item_id === item.item_id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(i => 
        i.item_id === item.item_id 
          ? { ...i, quantity: i.quantity + 1, total_price: item.price * (i.quantity + 1) }
          : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1, total_price: item.price }]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.item_id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setSelectedItems(selectedItems.map(item => 
      item.item_id === itemId 
        ? { ...item, quantity: newQuantity, total_price: item.price * newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleCreateBill = async () => {
    if (!selectedPatient || selectedItems.length === 0) {
      showSnackbar('Please select a patient and add items', 'error');
      return;
    }

    try {
      const billData = {
        patient_id: selectedPatient.patient_id,
        bill_items: selectedItems,
        notes: billNotes
      };

      await billingService.createBill(billData);
      showSnackbar('Bill created successfully');
      setSelectedPatient(null);
      setSelectedItems([]);
      setBillNotes('');
      loadData();
    } catch (error) {
      console.error('Error creating bill:', error);
      showSnackbar('Error creating bill', 'error');
    }
  };

  const handlePayment = async () => {
    if (!selectedBill || !paymentAmount || paymentAmount <= 0) {
      showSnackbar('Please enter a valid payment amount', 'error');
      return;
    }

    try {
      const paymentData = {
        bill_id: selectedBill.bill_id,
        patient_id: selectedBill.patient_id,
        payment_amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        reference_number: `PAY-${Date.now()}`
      };

      await billingService.createPayment(paymentData);
      showSnackbar('Payment processed successfully');
      setPaymentDialog(false);
      setSelectedBill(null);
      setPaymentAmount('');
      setPaymentMethod('cash');
      loadData();
    } catch (error) {
      console.error('Error processing payment:', error);
      showSnackbar('Error processing payment', 'error');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await billingService.searchBills(searchQuery);
      setSearchResults(response);
    } catch (error) {
      console.error('Error searching bills:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MoneyIcon sx={{ mr: 2, color: 'primary.main' }} />
        Cashier & Billing System
      </Typography>

      {/* Dashboard Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Bills
              </Typography>
              <Typography variant="h4">
                {summary.totalBills || 0}
              </Typography>
              <Typography variant="body2">
                This period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                {formatCurrency(summary.totalBilled || 0)}
              </Typography>
              <Typography variant="body2">
                Total billed amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Amount
              </Typography>
              <Typography variant="h4">
                {formatCurrency(summary.pendingAmount || 0)}
              </Typography>
              <Typography variant="body2">
                Outstanding payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Rate
              </Typography>
              <Typography variant="h4">
                {summary.paymentRate || 0}%
              </Typography>
              <Typography variant="body2">
                Collection rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<ReceiptIcon />} label="Bills" />
          <Tab icon={<PaymentIcon />} label="Payments" />
          <Tab icon={<AddIcon />} label="New Bill" />
        </Tabs>
      </Box>

      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Bills
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Bill #</TableCell>
                        <TableCell>Patient</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bills.slice(0, 5).map((bill) => (
                        <TableRow key={bill.bill_id}>
                          <TableCell>{bill.bill_number}</TableCell>
                          <TableCell>
                            {bill.patients?.first_name} {bill.patients?.last_name}
                          </TableCell>
                          <TableCell>{formatCurrency(bill.total_amount)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={bill.status} 
                              color={getStatusColor(bill.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(bill.bill_date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <List>
                  <ListItem button onClick={() => setActiveTab(3)}>
                    <ListItemText primary="Create New Bill" />
                    <AddIcon />
                  </ListItem>
                  <ListItem button onClick={() => setActiveTab(2)}>
                    <ListItemText primary="Process Payment" />
                    <PaymentIcon />
                  </ListItem>
                  <ListItem button onClick={() => setActiveTab(1)}>
                    <ListItemText primary="View All Bills" />
                    <ReceiptIcon />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Bills Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleSearch}>
              <SearchIcon />
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill #</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(searchResults.length > 0 ? searchResults : bills).map((bill) => (
                  <TableRow key={bill.bill_id}>
                    <TableCell>{bill.bill_number}</TableCell>
                    <TableCell>
                      {bill.patients?.first_name} {bill.patients?.last_name}
                    </TableCell>
                    <TableCell>{formatCurrency(bill.total_amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={bill.status} 
                        color={getStatusColor(bill.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(bill.bill_date)}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => {}}>
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => {}}>
                        <PrintIcon />
                      </IconButton>
                      {bill.status !== 'paid' && (
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedBill(bill);
                            setPaymentDialog(true);
                          }}
                        >
                          <PaymentIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Payments Tab */}
      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment #</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Bill #</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.payment_id}>
                  <TableCell>{payment.reference_number}</TableCell>
                  <TableCell>
                    {payment.patients?.first_name} {payment.patients?.last_name}
                  </TableCell>
                  <TableCell>{payment.bills?.bill_id}</TableCell>
                  <TableCell>{formatCurrency(payment.payment_amount)}</TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell>{formatDate(payment.payment_date)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.status} 
                      color={payment.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* New Bill Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bill Items
                </Typography>
                
                {/* Patient Selection */}
                <Autocomplete
                  options={patients}
                  getOptionLabel={(option) => `${option.first_name} ${option.last_name} (ID: ${option.patient_id})`}
                  value={selectedPatient}
                  onChange={(event, newValue) => setSelectedPatient(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Patient" fullWidth sx={{ mb: 2 }} />
                  )}
                />

                {/* Billing Items by Category */}
                {['consultation', 'lab_test', 'medication', 'procedure'].map((category) => (
                  <Accordion key={category} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                        {category.replace('_', ' ')}s
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        {billingItems
                          .filter(item => item.category === category)
                          .map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.item_id}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                                onClick={() => handleAddItem(item)}
                              >
                                <CardContent sx={{ py: 1 }}>
                                  <Typography variant="body2" fontWeight="bold">
                                    {item.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatCurrency(item.price)}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Selected Items
                </Typography>
                
                {selectedItems.length === 0 ? (
                  <Typography color="text.secondary">
                    No items selected
                  </Typography>
                ) : (
                  <List dense>
                    {selectedItems.map((item) => (
                      <ListItem key={item.item_id}>
                        <ListItemText
                          primary={item.name}
                          secondary={`${formatCurrency(item.price)} x ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value))}
                            sx={{ width: 60, mr: 1 }}
                          />
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveItem(item.item_id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6">
                  Total: {formatCurrency(calculateTotal())}
                </Typography>

                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCreateBill}
                  disabled={!selectedPatient || selectedItems.length === 0}
                  sx={{ mt: 2 }}
                >
                  Create Bill
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Bill: {selectedBill.bill_number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patient: {selectedBill.patients?.first_name} {selectedBill.patients?.last_name}
              </Typography>
              <Typography variant="h6">
                Total Amount: {formatCurrency(selectedBill.total_amount)}
              </Typography>
            </Box>
          )}
          
          <TextField
            label="Payment Amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="insurance">Insurance</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handlePayment} variant="contained">
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cashier; 