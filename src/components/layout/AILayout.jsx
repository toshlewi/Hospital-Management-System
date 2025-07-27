import React, { useState, useEffect } from 'react';
import { Box, Fab, Zoom } from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import Layout from './Layout';
import RightSideAIPanel from '../ai/RightSideAIPanel';

const AILayout = ({ children, currentPage, patientId, patientData, currentData }) => {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState(patientId);

  // Listen for patientId changes from child components
  useEffect(() => {
    if (patientId) {
      setCurrentPatientId(patientId);
    }
  }, [patientId]);

  const handleAnalysisUpdate = (analysis) => {
    setAiAnalysis(analysis);
    // You can add additional logic here to handle analysis updates
    console.log('AI Analysis updated:', analysis);
  };

  const toggleAIPanel = () => {
    setIsAIPanelOpen(!isAIPanelOpen);
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Main Content */}
        <Box 
          className="ai-layout-content"
          sx={{ 
            flexGrow: 1, 
            mr: isAIPanelOpen ? { xs: 0, md: '500px' } : 0, // Responsive margin
            transition: 'margin-right 0.3s ease-in-out',
            minHeight: '100vh',
            width: '100%',
            pr: isAIPanelOpen ? { xs: 1, md: 3 } : 0, // Responsive padding
            overflow: 'auto', // Allow vertical scroll, prevent horizontal
            maxWidth: isAIPanelOpen ? { xs: '100vw', md: 'calc(100vw - 500px)' } : '100vw' // Responsive max width
          }}
        >
          {children}
        </Box>

        {/* Right-side AI Panel */}
        <RightSideAIPanel
          patientId={currentPatientId}
          patientData={patientData}
          currentPage={currentPage}
          currentData={currentData}
          onAnalysisUpdate={handleAnalysisUpdate}
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
        />

        {/* Floating Action Button to toggle AI panel */}
        <Zoom in={!isAIPanelOpen}>
          <Fab
            color="primary"
            aria-label="AI Assistant"
            onClick={toggleAIPanel}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.6)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <SmartToy sx={{ fontSize: '1.5rem' }} />
          </Fab>
        </Zoom>
      </Box>
    </Layout>
  );
};

export default AILayout; 