import React from 'react';
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
  IconButton
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

const Cashier = () => {
  // Sample data for bills
  const bills = [
    { id: 1, patient: 'John Doe', date: '2023-05-15', amount: 150.00, status: 'Paid' },
    { id: 2, patient: 'Jane Smith', date: '2023-05-16', amount: 275.50, status: 'Pending' },
    { id: 3, patient: 'Robert Johnson', date: '2023-05-17', amount: 420.75, status: 'Paid' },
    { id: 4, patient: 'Emily Davis', date: '2023-05-17', amount: 180.00, status: 'Pending' },
  ];

  return (
    <Container maxWidth="xl" sx={{ 
      py: 3,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '"$$$"',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        color: 'rgba(33, 150, 243, 0.05)',
        fontSize: '20rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
        transform: 'rotate(-15deg)',
        userSelect: 'none'
      }
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: 'primary.main',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <AttachMoney fontSize="large" /> Cashier Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            boxShadow: 3,
            borderRadius: 2
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment /> Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<Receipt />}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' } }}
                >
                  Create New Bill
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<Print />}
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' } }}
                >
                  Print Receipt
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Search and Filter */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Search /> Search Bills
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField 
                  fullWidth 
                  label="Search by patient name or ID" 
                  variant="outlined" 
                  size="small"
                />
                <Button variant="contained" color="primary">
                  Search
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bills Table */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Bills
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white' }}>Bill ID</TableCell>
                      <TableCell sx={{ color: 'white' }}>Patient</TableCell>
                      <TableCell sx={{ color: 'white' }}>Date</TableCell>
                      <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                      <TableCell sx={{ color: 'white' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>{bill.id}</TableCell>
                        <TableCell>{bill.patient}</TableCell>
                        <TableCell>{bill.date}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoney fontSize="small" />
                            {bill.amount.toFixed(2)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: bill.status === 'Paid' ? 'success.light' : 'warning.light',
                            color: bill.status === 'Paid' ? 'success.dark' : 'warning.dark'
                          }}>
                            {bill.status}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney /> Today's Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Total Payments:</Typography>
                <Typography fontWeight="bold">$945.25</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Pending Payments:</Typography>
                <Typography fontWeight="bold" color="warning.main">$455.50</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Transactions:</Typography>
                <Typography fontWeight="bold">12</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[1, 2, 3].map((item) => (
                  <Box key={item} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'grey.100'
                  }}>
                    <Typography>Payment #{100 + item}</Typography>
                    <Typography fontWeight="bold">${150 + (item * 50)}.00</Typography>
                    <Typography variant="caption">Today, {10 + item}:30 AM</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cashier;