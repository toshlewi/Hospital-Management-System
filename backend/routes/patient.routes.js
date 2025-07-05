const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller.js');

// Patient routes
router.get('/patients', patientController.getAllPatients);
router.get('/patients/:id', patientController.getPatientById);
router.get('/patients/:id/billing', patientController.getPatientBillingStatus);
router.get('/patients/:patientId/notes', patientController.getMedicalNotes);
router.get('/patients/:patientId/prescriptions', patientController.getPrescriptions);
router.post('/patients', patientController.createPatient);
router.put('/patients/:id', patientController.updatePatient);
router.delete('/patients/:id', patientController.deletePatient);

module.exports = router; 