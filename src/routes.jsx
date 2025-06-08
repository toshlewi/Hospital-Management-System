import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Main Pages
import Home from './pages/Home';
import Reception from './pages/Reception';
import Clinicians from './pages/Clinicians';
import Lab from './pages/Lab';
import Pharmacy from './pages/Pharmacy';
import Cashier from './pages/Cashier';

// Clinician Subroutes (you can add more as needed)
import Outpatient from './components/clinicians/Outpatient';
import Inpatient from './components/clinicians/Inpatient';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reception" element={<Reception />} />
      
      {/* Clinicians Module with Nested Routes */}
      <Route path="/clinicians/*" element={<Clinicians />}>
        <Route path="outpatient" element={<Outpatient />} />
        <Route path="inpatient" element={<Inpatient />} />
        {/* Add more clinician-related routes here */}
      </Route>

      <Route path="/laboratory" element={<Lab />} />
      <Route path="/pharmacy" element={<Pharmacy />} />
      <Route path="/cashier" element={<Cashier />} />
    </Routes>
  );
};

export default AppRoutes;
