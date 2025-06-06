import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store/store';
import theme from './styles/theme';
import Home from './pages/Home';
import Reception from './pages/Reception';
import Clinicians from './pages/Clinicians';
import Laboratory from './pages/Laboratory';
import Imaging from './pages/Imaging';
import Pharmacy from './pages/Pharmacy';
import Cashier from './pages/Cashier';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Diagnosis from './pages/Diagnosis';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="app">
            <Header />
            <div className="main-content">
              <Sidebar />
              <main className="content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/reception" element={<Reception />} />
                  <Route path="/clinicians" element={<Clinicians />} />
                  <Route path="/laboratory" element={<Laboratory />} />
                  <Route path="/imaging" element={<Imaging />} />
                  <Route path="/pharmacy" element={<Pharmacy />} />
                  <Route path="/cashier" element={<Cashier />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/diagnosis" element={<Diagnosis />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;