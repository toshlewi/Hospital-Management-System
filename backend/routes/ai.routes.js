const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// AI Diagnosis endpoint
router.post('/diagnose', aiController.diagnose);

// AI Pharmacy Check endpoint
router.post('/pharmacy-check', aiController.pharmacyCheck);

// AI Image Analysis endpoint (for future use)
router.post('/analyze-image', (req, res) => {
  // Mock image analysis response
  res.json({
    imageAnalysis: 'Image analysis feature coming soon',
    confidence: 0.85,
    ai: true
  });
});

// AI Treatment Recommendations endpoint (for future use)
router.post('/treatment', (req, res) => {
  const { diagnosis } = req.body;
  
  // Mock treatment recommendations
  let recommendations = [];
  
  if (diagnosis && diagnosis.toLowerCase().includes('cold')) {
    recommendations = [
      'Rest and hydration',
      'Over-the-counter decongestants',
      'Monitor for secondary infections'
    ];
  } else if (diagnosis && diagnosis.toLowerCase().includes('fever')) {
    recommendations = [
      'Antipyretic medication',
      'Cool compresses',
      'Monitor temperature every 4 hours'
    ];
  }
  
  res.json({
    recommendations,
    ai: true
  });
});

// AI Risk Prediction endpoint (for future use)
router.post('/risk-prediction', (req, res) => {
  const { patientData } = req.body;
  
  // Mock risk prediction
  res.json({
    riskScore: 0.25,
    riskLevel: 'Low',
    factors: ['Age', 'No chronic conditions'],
    recommendations: ['Continue current care plan'],
    ai: true
  });
});

// AI Medication Suggestions endpoint (for future use)
router.post('/medication', (req, res) => {
  const { diagnosis, allergies } = req.body;
  
  // Mock medication suggestions
  let suggestions = [];
  
  if (diagnosis && diagnosis.toLowerCase().includes('cold')) {
    suggestions = [
      'Paracetamol for fever',
      'Decongestants for nasal congestion',
      'Cough suppressants if needed'
    ];
  }
  
  res.json({
    suggestions,
    ai: true
  });
});

module.exports = router; 