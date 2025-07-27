import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
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

  const handleAIPanelClose = () => {
    setIsAIPanelOpen(false);
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
          onClose={handleAIPanelClose}
        />
      </Box>
    </Layout>
  );
};

export default AILayout; 