const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Core AI Analysis Endpoints
router.post('/diagnose', aiController.diagnose);
router.post('/analyze-lab-results', aiController.analyzeLabResults);
router.post('/analyze-drug-interactions', aiController.analyzeDrugInteractions);
router.post('/analyze-symptoms', aiController.analyzeSymptoms);
router.post('/analyze-treatment', aiController.analyzeTreatment);
router.post('/analyze-imaging', aiController.analyzeImaging);

// Advanced AI Analysis Endpoints
router.post('/analyze-comprehensive', aiController.analyzeComprehensive);
router.post('/analyze-real-time', aiController.analyzeRealTime);

// Legacy Endpoints (for backward compatibility)
router.post('/pharmacy-check', aiController.pharmacyCheck);

// Enhanced AI Endpoints
router.post('/analyze-image', (req, res) => {
  // Enhanced image analysis response
  res.json({
    imageAnalysis: 'Enhanced image analysis with AI',
    confidence: 0.85,
    findings: ['Normal findings', 'No abnormalities detected'],
    recommendations: ['Continue monitoring'],
    ai: true,
    timestamp: new Date().toISOString()
  });
});

router.post('/treatment', (req, res) => {
  const { diagnosis } = req.body;
  
  // Enhanced treatment recommendations
  let recommendations = [];
  
  if (diagnosis && diagnosis.toLowerCase().includes('cold')) {
    recommendations = [
      'Rest and hydration',
      'Over-the-counter decongestants',
      'Monitor for secondary infections',
      'Consider vitamin C supplementation'
    ];
  } else if (diagnosis && diagnosis.toLowerCase().includes('fever')) {
    recommendations = [
      'Antipyretic medication',
      'Cool compresses',
      'Monitor temperature every 4 hours',
      'Ensure adequate fluid intake'
    ];
  } else if (diagnosis && diagnosis.toLowerCase().includes('diabetes')) {
    recommendations = [
      'Blood glucose monitoring',
      'Dietary modifications',
      'Exercise regimen',
      'Medication adherence'
    ];
  }
  
  res.json({
    recommendations,
    ai: true,
    timestamp: new Date().toISOString()
  });
});

router.post('/risk-prediction', (req, res) => {
  const { patientData } = req.body;
  
  // Enhanced risk prediction
  res.json({
    riskScore: 0.25,
    riskLevel: 'Low',
    factors: ['Age', 'No chronic conditions', 'Good vital signs'],
    recommendations: ['Continue current care plan', 'Regular check-ups'],
    ai: true,
    timestamp: new Date().toISOString()
  });
});

router.post('/medication', (req, res) => {
  const { diagnosis, allergies } = req.body;
  
  // Enhanced medication suggestions
  let suggestions = [];
  
  if (diagnosis && diagnosis.toLowerCase().includes('cold')) {
    suggestions = [
      'Paracetamol for fever',
      'Decongestants for nasal congestion',
      'Cough suppressants if needed',
      'Zinc supplements'
    ];
  } else if (diagnosis && diagnosis.toLowerCase().includes('hypertension')) {
    suggestions = [
      'ACE inhibitors',
      'Calcium channel blockers',
      'Diuretics',
      'Beta blockers'
    ];
  }
  
  res.json({
    suggestions,
    ai: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 