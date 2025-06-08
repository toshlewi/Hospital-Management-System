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
import Lab from './pages/Lab';
import Imaging from './pages/Imaging';
import Pharmacy from './pages/Pharmacy';
import Cashier from './pages/Cashier';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
          <div className="app">
            <Header />
            <div className="main-content">
              <Sidebar />
              <main className="content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/reception" element={<Reception />} />
                  <Route path="/clinicians/*" element={<Clinicians />} />
                  <Route path="/laboratory" element={<Lab />} />
                  <Route path="/imaging" element={<Imaging />} />
                  <Route path="/pharmacy" element={<Pharmacy />} />
                  <Route path="/cashier" element={<Cashier />} />
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