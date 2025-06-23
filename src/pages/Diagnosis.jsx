import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import AIDiagnosis from '../components/ai/AIDiagnosis'; // Correct path for AIDiagnosis
import PatientForm from '../components/patient/PatientForm'; // Correct path for PatientForm

const Diagnosis = () => {
  const { patientId } = useParams();
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Patient Diagnosis
      </Typography>
      
      {patientId ? (
        <>
          <AIDiagnosis patientId={patientId} />
          <PatientForm patient={null} />
        </>
      ) : (
        <Typography>Please select a patient to begin diagnosis</Typography>
      )}
    </Container>
  );
};

export default Diagnosis;