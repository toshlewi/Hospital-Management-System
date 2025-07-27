import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Badge,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  SmartToy,
  Close,
  AutoFixHigh,
  Psychology,
  Science,
  Medication,
  HealthAndSafety,
  LocalHospital,
  Image
} from '@mui/icons-material';
import AIComprehensiveDashboard from './AIComprehensiveDashboard';

const AIIntegrationButton = ({ 
  patientId, 
  patientData, 
  onAnalysisUpdate,
  position = 'bottom-right', // bottom-right, bottom-left, top-right, top-left
  showBadge = false,
  badgeContent = null,
  size = 'large', // small, medium, large
  color = 'primary',
  variant = 'extended' // circular, extended
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);

  const handleAnalysisUpdate = (results) => {
    setAnalysisCount(prev => prev + 1);
    if (onAnalysisUpdate) {
      onAnalysisUpdate(results);
    }
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1000
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: 24, right: 24 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 24, left: 24 };
      case 'top-right':
        return { ...baseStyles, top: 24, right: 24 };
      case 'top-left':
        return { ...baseStyles, top: 24, left: 24 };
      default:
        return { ...baseStyles, bottom: 24, right: 24 };
    }
  };

  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { size: 'small' };
      case 'medium':
        return { size: 'medium' };
      case 'large':
        return { size: 'large' };
      default:
        return { size: 'large' };
    }
  };

  const renderFab = () => {
    if (variant === 'circular') {
      return (
        <Badge 
          badgeContent={showBadge ? (badgeContent || analysisCount) : 0} 
          color="error"
          invisible={!showBadge}
        >
          <Fab
            color={color}
            {...getSizeProps()}
            onClick={() => setIsOpen(true)}
            sx={getPositionStyles()}
          >
            <SmartToy />
          </Fab>
        </Badge>
      );
    } else {
      return (
        <Badge 
          badgeContent={showBadge ? (badgeContent || analysisCount) : 0} 
          color="error"
          invisible={!showBadge}
        >
          <Fab
            color={color}
            variant="extended"
            {...getSizeProps()}
            onClick={() => setIsOpen(true)}
            sx={getPositionStyles()}
          >
            <SmartToy sx={{ mr: 1 }} />
            AI Assistant
          </Fab>
        </Badge>
      );
    }
  };

  return (
    <>
      {renderFab()}
      
      <AIComprehensiveDashboard
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        patientId={patientId}
        patientData={patientData}
        onAnalysisUpdate={handleAnalysisUpdate}
      />
    </>
  );
};

// Quick AI Analysis Component
export const QuickAIAnalysis = ({ 
  patientId, 
  patientData, 
  onAnalysisUpdate,
  title = "Quick AI Analysis",
  showIcons = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const aiFeatures = [
    { icon: <Psychology />, label: 'Diagnosis', color: 'primary' },
    { icon: <Science />, label: 'Lab Tests', color: 'info' },
    { icon: <Medication />, label: 'Drug Interactions', color: 'warning' },
    { icon: <HealthAndSafety />, label: 'Symptoms', color: 'success' },
    { icon: <LocalHospital />, label: 'Treatment', color: 'secondary' },
    { icon: <Image />, label: 'Imaging', color: 'error' }
  ];

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          cursor: 'pointer',
          borderRadius: 2,
          border: '2px dashed',
          borderColor: 'primary.main',
          bgcolor: 'primary.50',
          '&:hover': {
            bgcolor: 'primary.100',
            borderColor: 'primary.dark'
          }
        }}
        onClick={() => setIsOpen(true)}
      >
        <AutoFixHigh sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" color="primary.main" gutterBottom>
          {title}
        </Typography>
        
        {showIcons && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {aiFeatures.map((feature, index) => (
              <Chip
                key={index}
                icon={feature.icon}
                label={feature.label}
                color={feature.color}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Click to open comprehensive AI medical analysis
        </Typography>
      </Box>

      <AIComprehensiveDashboard
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        patientId={patientId}
        patientData={patientData}
        onAnalysisUpdate={onAnalysisUpdate}
      />
    </>
  );
};

// AI Status Indicator Component
export const AIStatusIndicator = ({ 
  isAnalyzing = false, 
  lastAnalysis = null,
  analysisCount = 0 
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: isAnalyzing ? 'warning.main' : 'success.main',
          animation: isAnalyzing ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.5 },
            '100%': { opacity: 1 }
          }
        }}
      />
      <Typography variant="body2" color="text.secondary">
        AI {isAnalyzing ? 'Analyzing...' : 'Ready'}
      </Typography>
      {analysisCount > 0 && (
        <Chip 
          label={`${analysisCount} analyses`} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      )}
    </Box>
  );
};

export default AIIntegrationButton; 