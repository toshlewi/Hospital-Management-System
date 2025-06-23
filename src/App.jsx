// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store/store';
import theme from './styles/theme';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Patients from './pages/Patients';
import Clinicians from './pages/Clinicians';
import Reception from './pages/Reception';
import Laboratory from './pages/Lab';
import Pharmacy from './pages/Pharmacy';
import Cashier from './pages/Cashier';
import Imaging from './pages/Imaging';
import Settings from './pages/Settings';
import Diagnosis from './pages/Diagnosis';
import AIDiagnosis from './components/ai/AIDiagnosis';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/clinicians" element={<Clinicians />} />
              <Route path="/reception" element={<Reception />} />
              <Route path="/laboratory" element={<Laboratory />} />
              <Route path="/pharmacy" element={<Pharmacy />} />
              <Route path="/cashier" element={<Cashier />} />
              <Route path="/imaging" element={<Imaging />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/diagnosis" element={<Diagnosis />} />
              <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
