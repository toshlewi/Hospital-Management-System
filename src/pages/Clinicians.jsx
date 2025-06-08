import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClinicianPortal from './Clinicians/ClinicianPortal';
import Outpatient from './Clinicians/Outpatient';
import Inpatient from './Clinicians/Inpatient';

const Clinicians = () => {
  return (
    <Routes>
      <Route index element={<ClinicianPortal />} />
      <Route path="outpatient" element={<Outpatient />} />
      <Route path="inpatient" element={<Inpatient />} />
      <Route path="*" element={<Navigate to="/clinicians" replace />} />
    </Routes>
  );
};

export default Clinicians;