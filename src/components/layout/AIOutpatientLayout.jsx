import React, { useState } from 'react';
import AILayout from './AILayout';
import Outpatient from '../../pages/Clinicians/Outpatient';

const AIOutpatientLayout = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const handlePatientSelect = (patient) => {
    setSelectedPatientId(patient?.patient_id || null);
  };

  return (
    <AILayout 
      currentPage="outpatient" 
      patientId={selectedPatientId}
    >
      <Outpatient onPatientSelect={handlePatientSelect} />
    </AILayout>
  );
};

export default AIOutpatientLayout; 