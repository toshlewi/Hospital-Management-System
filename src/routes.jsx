// src/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Main Pages
import Home from './pages/Home';
import Reception from './pages/Reception';
import Clinicians from './pages/Clinicians';
import Outpatient from './pages/Outpatient';
import Inpatient from './pages/Clinicians/Inpatient';
import Lab from './pages/Lab';
import Imaging from './pages/Imaging';
import Pharmacy from './pages/Pharmacy';
import Cashier from './pages/Cashier';
import Patients from './pages/Patients';
import Diagnosis from './pages/Diagnosis';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/reception" element={<Reception />} />
      <Route path="/outpatient" element={<Outpatient />} />
      <Route path="/laboratory" element={<Lab />} />
      <Route path="/imaging" element={<Imaging />} />
      <Route path="/pharmacy" element={<Pharmacy />} />
      <Route path="/cashier" element={<Cashier />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/diagnosis" element={<Diagnosis />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/settings" element={<Settings />} />

      {/* Clinicians Module */}
      <Route path="/clinicians" element={<Clinicians />} />
      <Route path="/clinicians/outpatient" element={<Outpatient />} />
      <Route path="/clinicians/inpatient" element={<Inpatient />} />
    </Routes>
  );
};

export default AppRoutes;
