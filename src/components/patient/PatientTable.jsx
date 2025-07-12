import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { patientAPI } from '../../services/api';

const PatientTable = ({ onEdit }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getAllPatients();
      setPatients(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await patientAPI.deletePatient(selectedPatient.patient_id);
      await fetchPatients(); // Refresh the list
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting patient:', err);
      // You might want to show an error message to the user here
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'admitted':
        return 'warning';
      case 'discharged':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Loading patients...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((patient) => (
                <TableRow key={patient.patient_id}>
                  <TableCell>{patient.patient_id}</TableCell>
                  <TableCell>{`${patient.first_name} ${patient.last_name}`}</TableCell>
                  <TableCell>{patient.contact_number}</TableCell>
                  <TableCell>{new Date(patient.date_of_birth).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.status}
                      color={getStatusColor(patient.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onEdit(patient)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(patient)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Medical History">
                      <IconButton size="small">
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteClick(patient)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={patients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedPatient?.first_name} {selectedPatient?.last_name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PatientTable;