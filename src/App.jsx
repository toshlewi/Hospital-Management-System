// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/layout/Layout';
import AILayout from './components/layout/AILayout';
import Home from './pages/Home';
import Patients from './pages/Patients';
import Clinicians from './pages/Clinicians';
import Reception from './pages/Reception';
import Laboratory from './pages/Lab';
import Pharmacy from './pages/Pharmacy';
import Cashier from './pages/Cashier';
import Imaging from './pages/Imaging';
import Settings from './pages/Settings';

import Outpatient from './pages/Clinicians/Outpatient';
import AIOutpatientLayout from './components/layout/AIOutpatientLayout';
import Inpatient from './pages/Clinicians/Inpatient';
import Appointments from './pages/Appointments';

function App() {
  return (
    <>
      <CssBaseline />
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Pages with AI functionality */}
          <Route path="/outpatient" element={<AIOutpatientLayout />} />
          <Route path="/clinicians/outpatient" element={<AIOutpatientLayout />} />
          <Route path="/pharmacy" element={
            <AILayout currentPage="pharmacy">
              <Pharmacy />
            </AILayout>
          } />
          <Route path="/laboratory" element={
            <AILayout currentPage="lab">
              <Laboratory />
            </AILayout>
          } />
          <Route path="/imaging" element={
            <AILayout currentPage="imaging">
              <Imaging />
            </AILayout>
          } />


          {/* Pages without AI functionality */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/patients" element={
            <Layout>
              <Patients />
            </Layout>
          } />
          <Route path="/clinicians" element={
            <Layout>
              <Clinicians />
            </Layout>
          } />
          <Route path="/reception" element={
            <Layout>
              <Reception />
            </Layout>
          } />
          <Route path="/cashier" element={
            <Layout>
              <Cashier />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />

          <Route path="/clinicians/inpatient" element={
            <Layout>
              <Inpatient />
            </Layout>
          } />
          <Route path="/appointments" element={
            <Layout>
              <Appointments />
            </Layout>
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;
