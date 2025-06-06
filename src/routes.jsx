import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Reception from './pages/Reception';
import Clinicians from './pages/Clinicians';
import Laboratory from './pages/Laboratory';
import Pharmacy from './pages/Pharmacy';
import Cashier from './pages/Cashier';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reception" element={<Reception />} />
      <Route path="/clinicians" element={<Clinicians />} />
      <Route path="/laboratory" element={<Laboratory />} />
      <Route path="/pharmacy" element={<Pharmacy />} />
      <Route path="/cashier" element={<Cashier />} />
    </Routes>
  );
};

export default AppRoutes; 