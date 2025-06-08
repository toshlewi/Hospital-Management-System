import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  PersonAdd,
  Search,
  Edit,
  Delete,
  CalendarToday,
  LocalHospital,
  AssignmentInd,
  MedicalServices,
  CheckCircle,
  Schedule,
  PersonSearch
} from '@mui/icons-material';

const Receptionist = () => {
  // State management
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    insuranceProvider: '',
    insuranceNumber: '',
    doctorId: ''
  });

  // Sample data
  const doctors = [
    { id: 'D001', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', available: true },
    { id: 'D002', name: 'Dr. Michael Chen', specialty: 'Pediatrics', available: true },
    { id: 'D003', name: 'Dr. Emily Wilson', specialty: 'Neurology', available: false },
  ];

  const patients = [
    { 
      id: 'P1001', 
      firstName: 'John', 
      lastName: 'Doe', 
      dob: '1985-04-12', 
      gender: 'Male',
      insurance: { provider: 'Blue Cross', number: 'BC123456789' },
      appointments: [
        { date: '2023-06-15', time: '10:00 AM', doctor: 'Dr. Sarah Johnson', status: 'Completed' },
        { date: '2023-07-20', time: '2:30 PM', doctor: 'Dr. Michael Chen', status: 'Scheduled' }
      ]
    },
    { 
      id: 'P1002', 
      firstName: 'Jane', 
      lastName: 'Smith', 
      dob: '1990-11-25', 
      gender: 'Female',
      insurance: { provider: 'Aetna', number: 'AE987654321' },
      appointments: [
        { date: '2023-06-10', time: '9:15 AM', doctor: 'Dr. Emily Wilson', status: 'Completed' }
      ]
    },
  ];

  const appointments = [
    { id: 'A001', patientId: 'P1001', patientName: 'John Doe', date: '2023-07-20', time: '2:30 PM', doctor: 'Dr. Michael Chen', status: 'Scheduled' },
    { id: 'A002', patientId: 'P1002', patientName: 'Jane Smith', date: '2023-06-10', time: '9:15 AM', doctor: 'Dr. Emily Wilson', status: 'Completed' },
    { id: 'A003', patientId: 'P1003', patientName: 'Robert Johnson', date: '2023-06-18', time: '11:00 AM', doctor: 'Dr. Sarah Johnson', status: 'Scheduled' },
  ];

  // Handlers
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
    handleCloseDialog();
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      insuranceProvider: '',
      insuranceNumber: '',
      doctorId: ''
    });
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        color: 'primary.main'
      }}>
        <AssignmentInd fontSize="large" /> Receptionist Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Patient Management" icon={<PersonSearch />} />
        <Tab label="Appointments" icon={<CalendarToday />} />
        <Tab label="Doctors Availability" icon={<LocalHospital />} />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <TextField
              label="Search patients by name or ID"
              variant="outlined"
              size="small"
              sx={{ width: 400 }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              variant="contained" 
              startIcon={<PersonAdd />}
              onClick={handleOpenDialog}
            >
              Register New Patient
            </Button>
          </Box>

          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Patient Records
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white' }}>Patient ID</TableCell>
                      <TableCell sx={{ color: 'white' }}>Name</TableCell>
                      <TableCell sx={{ color: 'white' }}>Date of Birth</TableCell>
                      <TableCell sx={{ color: 'white' }}>Gender</TableCell>
                      <TableCell sx={{ color: 'white' }}>Insurance</TableCell>
                      <TableCell sx={{ color: 'white' }}>Appointments</TableCell>
                      <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.id}</TableCell>
                        <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                        <TableCell>{patient.dob}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>
                          {patient.insurance ? 
                            `${patient.insurance.provider} (${patient.insurance.number})` : 
                            'None'}
                        </TableCell>
                        <TableCell>
                          {patient.appointments.length} 
                          {patient.appointments.some(a => a.status === 'Scheduled') && (
                            <Chip 
                              label="Upcoming" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1 }} 
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton color="secondary">
                            <MedicalServices />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 1 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Appointments</Typography>
              <Button variant="contained" startIcon={<CalendarToday />}>
                Schedule New Appointment
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="primary" /> Today's Appointments
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {appointments.filter(a => a.date === '2023-06-10').map(app => (
                    <Card key={app.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography fontWeight="bold">{app.patientName}</Typography>
                          <Typography variant="body2">{app.time} with {app.doctor}</Typography>
                        </Box>
                        <Chip 
                          label={app.status} 
                          color={app.status === 'Completed' ? 'success' : 'primary'} 
                        />
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="primary" /> Upcoming Appointments
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {appointments.filter(a => a.date !== '2023-06-10').map(app => (
                    <Card key={app.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography fontWeight="bold">{app.patientName}</Typography>
                          <Typography variant="body2">{app.date} at {app.time}</Typography>
                          <Typography variant="body2">With {app.doctor}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Chip label={app.status} color="primary" sx={{ mb: 1 }} />
                          <Button size="small" variant="outlined">Check In</Button>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospital color="primary" /> Doctors On Duty Today
            </Typography>
            <Grid container spacing={3}>
              {doctors.map(doctor => (
                <Grid item xs={12} md={4} key={doctor.id}>
                  <Card sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${doctor.available ? '#4caf50' : '#f44336'}`,
                    opacity: doctor.available ? 1 : 0.7
                  }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="bold">{doctor.name}</Typography>
                        <Typography variant="body2">{doctor.specialty}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {doctor.available ? (
                            <>
                              <CheckCircle color="success" fontSize="small" />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>Available</Typography>
                            </>
                          ) : (
                            <>
                              <Schedule color="action" fontSize="small" />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>Not available today</Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      size="small"
                      disabled={!doctor.available}
                    >
                      View Schedule
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* New Patient Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd /> New Patient Registration
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Personal Information</Typography>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Contact & Insurance</Typography>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Insurance Number"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Register Patient</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Receptionist;