import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AttachMoney,
  Payment,
  Receipt,
  Print,
  Search,
  Delete,
  Edit
} from '@mui/icons-material';
import axios from 'axios';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Cashier = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [analytics, setAnalytics] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, type: '', charge: null });
  const [refundConfirm, setRefundConfirm] = useState({ open: false, charge: null });

  useEffect(() => {
    // Fetch all patients
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/patients');
        setPatients(res.data);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchCharges(selectedPatient);
    } else {
      setCharges([]);
    }
  }, [selectedPatient]);

  const fetchCharges = async (patientId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/patients/${patientId}/charges`);
      setCharges(res.data);
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await axios.post(`/api/patients/${selectedPatient}/charges/pay`);
      fetchCharges(selectedPatient);
    } catch (err) {
      // handle error
    }
    setPaying(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.first_name.toLowerCase().includes(search.toLowerCase()) ||
      p.last_name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.patient_id).includes(search)
  );

  const total = charges.reduce((sum, c) => sum + (c.charge * (c.quantity || 1)), 0);

  const fetchHistory = async (patientId, start, end) => {
    setLoadingHistory(true);
    try {
      let url = `/api/patients/${patientId}/payment-history`;
      if (start && end) {
        url += `?start=${start}&end=${end}`;
      }
      const res = await axios.get(url);
      setHistory(res.data);
    } catch (err) {
      // handle error
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchHistory(selectedPatient, startDate ? startDate.toISOString().slice(0,10) : undefined, endDate ? endDate.toISOString().slice(0,10) : undefined);
    } else {
      setHistory([]);
    }
    // eslint-disable-next-line
  }, [selectedPatient, startDate, endDate]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Payment History Receipt', 14, 16);
    doc.autoTable({
      startY: 24,
      head: [['Type', 'Name', 'Quantity', 'Charge', 'Date']],
      body: history.map(h => [h.type, h.name, h.quantity || 1, `$${(h.charge * (h.quantity || 1)).toFixed(2)}`, h.date ? new Date(h.date).toLocaleString() : ''])
    });
    doc.save('payment_history.pdf');
  };

  const fetchAnalytics = async (period = 'day') => {
    try {
      const res = await axios.get(`/api/patients/analytics/payments?period=${period}`);
      setAnalytics(res.data.reverse());
    } catch (err) {
      // handle error
    }
  };

  useEffect(() => {
    fetchAnalytics('day');
  }, []);

  const handlePayCharge = async (charge) => {
    setConfirm({ open: false, type: '', charge: null });
    await axios.post(`/api/patients/${selectedPatient}/charge/pay`, { type: charge.type, id: charge.id });
    fetchCharges(selectedPatient);
    fetchHistory(selectedPatient, startDate ? startDate.toISOString().slice(0,10) : undefined, endDate ? endDate.toISOString().slice(0,10) : undefined);
    fetchAnalytics('day');
  };

  const handleRefundCharge = async (charge) => {
    setRefundConfirm({ open: false, charge: null });
    await axios.post(`/api/patients/${selectedPatient}/charge/refund`, { type: charge.type, id: charge.id });
    fetchCharges(selectedPatient);
    fetchHistory(selectedPatient, startDate ? startDate.toISOString().slice(0,10) : undefined, endDate ? endDate.toISOString().slice(0,10) : undefined);
    fetchAnalytics('day');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, position: 'relative', overflow: 'hidden', '&::before': { content: '"$$$"', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, color: 'rgba(33, 150, 243, 0.05)', fontSize: '20rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: -1, transform: 'rotate(-15deg)', userSelect: 'none' } }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
        <AttachMoney fontSize="large" /> Cashier Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Patient Selection */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white', boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment /> Select Patient
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Search by name or ID"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
                <FormControl fullWidth>
                  <InputLabel id="patient-select-label" sx={{ color: 'white' }}>Patient</InputLabel>
                  <Select
                    labelId="patient-select-label"
                    value={selectedPatient}
                    label="Patient"
                    onChange={e => setSelectedPatient(e.target.value)}
                    sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: 1 }}
                  >
                    {filteredPatients.map((p) => (
                      <MenuItem key={p.patient_id} value={p.patient_id}>
                        {p.first_name} {p.last_name} (ID: {p.patient_id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Charges Table */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt /> Outstanding Charges
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'primary.light' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>Type</TableCell>
                        <TableCell sx={{ color: 'white' }}>Name</TableCell>
                        <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
                        <TableCell sx={{ color: 'white' }}>Charge</TableCell>
                        <TableCell sx={{ color: 'white' }}>Date</TableCell>
                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                        <TableCell sx={{ color: 'white' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {charges.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">No outstanding charges</TableCell>
                        </TableRow>
                      ) : (
                        charges.map((c) => (
                          <TableRow key={c.type + '-' + c.id}>
                            <TableCell>{c.type}</TableCell>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{c.quantity || 1}</TableCell>
                            <TableCell>${(c.charge * (c.quantity || 1)).toFixed(2)}</TableCell>
                            <TableCell>{c.date ? new Date(c.date).toLocaleString() : ''}</TableCell>
                            <TableCell>{c.status}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                disabled={c.status === 'paid'}
                                onClick={() => setConfirm({ open: true, type: 'pay', charge: c })}
                              >
                                Pay
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Payment />}
                  disabled={!selectedPatient || charges.length === 0 || paying}
                  onClick={handlePay}
                >
                  {paying ? 'Processing...' : 'Mark as Paid'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Print />}
                  disabled={!selectedPatient || charges.length === 0}
                  onClick={handlePrint}
                >
                  Print Receipt
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt /> Payment History
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Print />}
                    disabled={!selectedPatient || history.length === 0}
                    onClick={handleExportPDF}
                  >
                    Export as PDF
                  </Button>
                </Box>
              </LocalizationProvider>
              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'primary.light' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>Type</TableCell>
                        <TableCell sx={{ color: 'white' }}>Name</TableCell>
                        <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
                        <TableCell sx={{ color: 'white' }}>Charge</TableCell>
                        <TableCell sx={{ color: 'white' }}>Date</TableCell>
                        <TableCell sx={{ color: 'white' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">No payment history</TableCell>
                        </TableRow>
                      ) : (
                        history.map((h, idx) => (
                          <TableRow key={h.type + '-' + h.id + '-' + idx}>
                            <TableCell>{h.type}</TableCell>
                            <TableCell>{h.name}</TableCell>
                            <TableCell>{h.quantity || 1}</TableCell>
                            <TableCell>${(h.charge * (h.quantity || 1)).toFixed(2)}</TableCell>
                            <TableCell>{h.date ? new Date(h.date).toLocaleString() : ''}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => setRefundConfirm({ open: true, charge: h })}
                              >
                                Refund
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Analytics</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography>Total Payments Today: ${analytics.length > 0 ? analytics[analytics.length-1].total.toFixed(2) : '0.00'}</Typography>
                <Typography>Total Payments (Last 7 Days): ${analytics.slice(-7).reduce((sum, a) => sum + Number(a.total), 0).toFixed(2)}</Typography>
                <Typography>Total Payments (Last 30 Days): ${analytics.reduce((sum, a) => sum + Number(a.total), 0).toFixed(2)}</Typography>
              </Box>
              <Line
                data={{
                  labels: analytics.map(a => a.period),
                  datasets: [{
                    label: 'Payments',
                    data: analytics.map(a => a.total),
                    borderColor: 'rgba(33,150,243,1)',
                    backgroundColor: 'rgba(33,150,243,0.2)',
                    tension: 0.3
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { x: { title: { display: true, text: 'Date' } }, y: { title: { display: true, text: 'Amount ($)' } } }
                }}
                height={200}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, type: '', charge: null })}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>Are you sure you want to mark this charge as paid?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, type: '', charge: null })}>Cancel</Button>
          <Button onClick={() => handlePayCharge(confirm.charge)} color="success">Confirm</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={refundConfirm.open} onClose={() => setRefundConfirm({ open: false, charge: null })}>
        <DialogTitle>Confirm Refund</DialogTitle>
        <DialogContent>Are you sure you want to refund this charge?</DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundConfirm({ open: false, charge: null })}>Cancel</Button>
          <Button onClick={() => handleRefundCharge(refundConfirm.charge)} color="error">Refund</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cashier;