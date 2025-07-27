# 🤖 AI Medical Assistant - Frontend Integration Guide

This guide explains how to integrate the comprehensive AI medical assistant into your Hospital Management System frontend.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Quick Start](#quick-start)
4. [Integration Examples](#integration-examples)
5. [API Endpoints](#api-endpoints)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The AI Medical Assistant provides comprehensive medical analysis including:
- **Diagnosis Analysis** - Differential diagnosis with confidence scores
- **Lab Test Analysis** - Abnormal value detection and trends
- **Drug Interaction Analysis** - Real-time drug interaction checking
- **Symptom Analysis** - Symptom recognition and severity assessment
- **Treatment Planning** - Evidence-based treatment recommendations
- **Imaging Analysis** - Medical imaging interpretation

## 🧩 Components

### 1. RightSideAIPanel (Main Component)
The primary AI assistant panel that stays on the right side of the screen, similar to Cursor's AI panel or VS Code's Copilot.

```jsx
import RightSideAIPanel from './components/ai/RightSideAIPanel';

<RightSideAIPanel
  patientId={patientId}
  patientData={patientData}
  currentPage="outpatient"
  currentData={currentData}
  onAnalysisUpdate={handleResults}
  isOpen={isAIPanelOpen}
  onClose={() => setIsAIPanelOpen(false)}
  width={aiPanelWidth}
  onWidthChange={setAiPanelWidth}
/>
```

**Key Features:**
- **Always Visible**: Fixed position on the right side
- **Resizable**: Drag to resize from 300px to 800px
- **Collapsible**: Can be collapsed to a narrow strip
- **Minimizable**: Can be minimized to a small indicator
- **6 AI Tabs**: Diagnosis, Lab Tests, Drug Interactions, Symptoms, Treatment, Imaging
- **Real-time Analysis**: Auto-analyzes patient data
- **Patient History**: Reads and uses patient history for analysis

### 2. AIComprehensiveDashboard
A popup dialog version of the AI dashboard (alternative to RightSideAIPanel).

```jsx
import AIComprehensiveDashboard from './components/ai/AIComprehensiveDashboard';

<AIComprehensiveDashboard
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  patientId={patientId}
  patientData={patientData}
  onAnalysisUpdate={handleResults}
/>
```

### 3. AIIntegrationButton
A floating action button for easy AI access.

```jsx
import AIIntegrationButton from './components/ai/AIIntegrationButton';

<AIIntegrationButton
  patientId={patientId}
  patientData={patientData}
  position="bottom-right"
  showBadge={true}
  onAnalysisUpdate={handleResults}
/>
```

### 4. QuickAIAnalysis
A clickable card showing AI capabilities.

```jsx
import { QuickAIAnalysis } from './components/ai/AIIntegrationButton';

<QuickAIAnalysis
  patientId={patientId}
  patientData={patientData}
  title="Patient AI Analysis"
  onAnalysisUpdate={handleResults}
/>
```

### 5. AIStatusIndicator
Shows AI analysis status and count.

```jsx
import { AIStatusIndicator } from './components/ai/AIIntegrationButton';

<AIStatusIndicator
  isAnalyzing={isAnalyzing}
  analysisCount={analysisCount}
/>
```

## 🚀 Quick Start

### Step 1: Add RightSideAIPanel to Your Page Layout

```jsx
import React, { useState } from 'react';
import RightSideAIPanel from './components/ai/RightSideAIPanel';

const PatientPage = ({ patientId, patientData }) => {
  const [aiResults, setAiResults] = useState(null);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [aiPanelWidth, setAiPanelWidth] = useState(400);

  const handleAIResults = (results) => {
    setAiResults(results);
    console.log('AI Analysis:', results);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        marginRight: isAIPanelOpen ? `${aiPanelWidth}px` : 0,
        transition: 'margin-right 0.3s ease'
      }}>
        {/* Your existing page content */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h4">Patient Dashboard</Typography>
          {/* Your content here */}
        </Box>
      </Box>

      {/* AI Panel */}
      {isAIPanelOpen && (
        <RightSideAIPanel
          patientId={patientId}
          patientData={patientData}
          currentPage="outpatient"
          currentData={patientData}
          onAnalysisUpdate={handleAIResults}
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
          width={aiPanelWidth}
          onWidthChange={setAiPanelWidth}
        />
      )}
    </Box>
  );
};
```

### Step 2: Display AI Results in Main Content

```jsx
const PatientPage = ({ patientId, patientData }) => {
  const [aiResults, setAiResults] = useState(null);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [aiPanelWidth, setAiPanelWidth] = useState(400);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        marginRight: isAIPanelOpen ? `${aiPanelWidth}px` : 0,
        transition: 'margin-right 0.3s ease'
      }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4">Patient Dashboard</Typography>
          
          {/* AI Results Summary */}
          {aiResults && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">AI Analysis Summary</Typography>
                
                {aiResults.diagnosis && (
                  <Typography variant="body2">
                    Diagnosis: {aiResults.diagnosis.primary_diagnosis || 'Not determined'}
                  </Typography>
                )}
                
                {aiResults.drugInteractions && (
                  <Typography variant="body2">
                    Drug Risk: {aiResults.drugInteractions.risk_level || 'Unknown'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Your existing content */}
        </Box>
      </Box>

      {/* AI Panel */}
      {isAIPanelOpen && (
        <RightSideAIPanel
          patientId={patientId}
          patientData={patientData}
          currentPage="outpatient"
          currentData={patientData}
          onAnalysisUpdate={setAiResults}
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
          width={aiPanelWidth}
          onWidthChange={setAiPanelWidth}
        />
      )}
    </Box>
  );
};
```

## 🔧 Integration Examples

### Example 1: Patient Overview Page

```jsx
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { QuickAIAnalysis } from './components/ai/AIIntegrationButton';

const PatientOverview = ({ patient }) => {
  const [aiResults, setAiResults] = useState(null);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Patient Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Patient Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6">{patient.name}</Typography>
              <Typography>Age: {patient.age}</Typography>
              <Typography>Diagnosis: {patient.diagnosis}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* AI Analysis */}
        <Grid item xs={12} md={4}>
          <QuickAIAnalysis
            patientId={patient.id}
            patientData={patient}
            onAnalysisUpdate={setAiResults}
            title="AI Medical Analysis"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
```

### Example 2: Lab Results Page

```jsx
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Alert } from '@mui/material';
import AIIntegrationButton from './components/ai/AIIntegrationButton';

const LabResultsPage = ({ patientId, labResults }) => {
  const [aiResults, setAiResults] = useState(null);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lab Results
      </Typography>
      
      {/* AI Analysis Results */}
      {aiResults?.labTests && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">AI Lab Analysis</Typography>
          {aiResults.labTests.abnormal_values?.length > 0 && (
            <Typography>
              {aiResults.labTests.abnormal_values.length} abnormal values detected
            </Typography>
          )}
        </Alert>
      )}
      
      {/* Lab Results Display */}
      <Card>
        <CardContent>
          {/* Your lab results content */}
        </CardContent>
      </Card>
      
      {/* AI Button */}
      <AIIntegrationButton
        patientId={patientId}
        patientData={{ labResults }}
        onAnalysisUpdate={setAiResults}
        position="bottom-right"
        showBadge={true}
      />
    </Box>
  );
};
```

### Example 3: Pharmacy Page

```jsx
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Alert } from '@mui/material';
import AIIntegrationButton from './components/ai/AIIntegrationButton';

const PharmacyPage = ({ patientId, medications }) => {
  const [aiResults, setAiResults] = useState(null);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pharmacy
      </Typography>
      
      {/* Drug Interaction Warnings */}
      {aiResults?.drugInteractions && (
        <Alert 
          severity={aiResults.drugInteractions.risk_level === 'high' ? 'error' : 'warning'}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2">Drug Interaction Alert</Typography>
          <Typography>
            Risk Level: {aiResults.drugInteractions.risk_level.toUpperCase()}
          </Typography>
          {aiResults.drugInteractions.warnings?.map((warning, index) => (
            <Typography key={index} variant="body2">• {warning}</Typography>
          ))}
        </Alert>
      )}
      
      {/* Medications List */}
      <Card>
        <CardContent>
          {/* Your medications content */}
        </CardContent>
      </Card>
      
      {/* AI Button */}
      <AIIntegrationButton
        patientId={patientId}
        patientData={{ medications }}
        onAnalysisUpdate={setAiResults}
        position="bottom-right"
        showBadge={true}
      />
    </Box>
  );
};
```

## 🌐 API Endpoints

The AI system uses these backend endpoints:

### Core Analysis
- `POST /api/ai/diagnose` - Diagnosis analysis
- `POST /api/ai/analyze-lab-results` - Lab test analysis
- `POST /api/ai/analyze-drug-interactions` - Drug interaction analysis
- `POST /api/ai/analyze-symptoms` - Symptom analysis
- `POST /api/ai/analyze-treatment` - Treatment analysis
- `POST /api/ai/analyze-imaging` - Imaging analysis

### Advanced Analysis
- `POST /api/ai/analyze-comprehensive` - Comprehensive analysis
- `POST /api/ai/analyze-real-time` - Real-time analysis

### Legacy Support
- `POST /api/ai/pharmacy-check` - Legacy pharmacy check

## ⚙️ Configuration

### Environment Variables

```env
# AI Service URL (Python FastAPI)
AI_SERVICE_URL=http://localhost:8000

# Backend API URL
REACT_APP_API_URL=/api
```

### Component Props

#### AIIntegrationButton
```jsx
<AIIntegrationButton
  patientId={number}           // Required: Patient ID
  patientData={object}         // Required: Patient data
  onAnalysisUpdate={function}  // Required: Callback for results
  position="bottom-right"      // Optional: Button position
  showBadge={boolean}          // Optional: Show analysis count badge
  badgeContent={number}        // Optional: Custom badge content
  size="large"                 // Optional: Button size
  color="primary"              // Optional: Button color
  variant="extended"           // Optional: Button variant
/>
```

#### AIComprehensiveDashboard
```jsx
<AIComprehensiveDashboard
  isOpen={boolean}             // Required: Dialog open state
  onClose={function}           // Required: Close handler
  patientId={number}           // Required: Patient ID
  patientData={object}         // Required: Patient data
  onAnalysisUpdate={function}  // Required: Results callback
/>
```

## 🔍 Troubleshooting

### Common Issues

1. **AI Service Not Responding**
   - Check if Python AI service is running on port 8000
   - Verify `AI_SERVICE_URL` environment variable
   - Check network connectivity

2. **Analysis Results Not Updating**
   - Ensure `onAnalysisUpdate` callback is provided
   - Check browser console for errors
   - Verify patient data format

3. **Component Not Rendering**
   - Check import paths
   - Verify all required props are provided
   - Check for Material-UI version conflicts

### Debug Mode

Enable debug logging:

```jsx
// In your component
const handleAIResults = (results) => {
  console.log('AI Analysis Results:', results);
  setAiResults(results);
};
```

### Error Handling

```jsx
const handleAIResults = (results) => {
  if (results.error) {
    console.error('AI Analysis Error:', results.error);
    // Show error message to user
    setError(results.error);
  } else {
    setAiResults(results);
  }
};
```

## 📚 Additional Resources

- [AI Training Documentation](../python-ai-project/AI_TRAINING_README.md)
- [Backend API Documentation](../backend/README.md)
- [Python AI Service Documentation](../python-ai-project/README.md)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the example components
3. Check browser console for errors
4. Verify all services are running

---

**Note**: This AI system is designed for medical assistance and should be used in conjunction with professional medical judgment. Always verify AI recommendations with qualified healthcare providers. 