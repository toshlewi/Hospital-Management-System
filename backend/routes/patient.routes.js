const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller.js');

// Patient routes
router.get('/patients', patientController.getAllPatients);
router.get('/patients/:id', patientController.getPatientById);
router.get('/patients/:id/billing', patientController.getPatientBillingStatus);
router.get('/patients/:patientId/notes', patientController.getMedicalNotes);
router.get('/patients/:patientId/prescriptions', patientController.getPrescriptions);
router.get('/patients/:patientId/prescriptions/dispensed', patientController.getDispensedPrescriptions);
router.get('/patients/:patientId/tests', patientController.getTestOrders);
router.get('/patients/:patientId/imaging', patientController.getImaging);
router.post('/patients', patientController.createPatient);
router.put('/patients/:id', patientController.updatePatient);
router.delete('/patients/:id', patientController.deletePatient);

// Medical notes
router.post('/patients/:patientId/notes', patientController.addMedicalNote);

// Prescriptions
router.post('/patients/:patientId/prescriptions', patientController.createPrescription);
router.put('/prescriptions/:prescriptionId', patientController.updatePrescription);

// Test orders
router.post('/patients/:patientId/tests', patientController.addTestOrder);
router.put('/test-orders/:orderId', patientController.updateTestOrder);

// File uploads
router.post('/patients/:patientId/upload-lab-result', patientController.uploadLabResult);
router.post('/patients/:patientId/upload-imaging', patientController.uploadImaging);

module.exports = router; 