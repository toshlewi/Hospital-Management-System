module.exports = app => {
    const patients = require("../controllers/patient.controller.js");
    const ai = require("../controllers/ai.controller.js");
    const router = require("express").Router();
    const multer = require('multer');
    const upload = multer({ dest: 'uploads/' });
    const procedures = require('../controllers/procedures.controller');
  
    // Create a new Patient
    router.post("/", patients.create);
  
    // Retrieve all Patients
    router.get("/", patients.findAll);
  
    // Retrieve a single Patient with id
    router.get("/:id", patients.findOne);
  
    // Update a Patient with id
    router.put("/:id", patients.update);
  
    // Delete a Patient with id
    router.delete("/:id", patients.delete);
  
    // Get Patient's medical history
    router.get("/:id/history", patients.getMedicalHistory);
  
    // Get Patient's appointments
    router.get("/:id/appointments", patients.getAppointments);
  
    // Get Patient's test results
    router.get("/:id/tests", patients.getTestResults);
  
    // Get Patient's prescriptions
    router.get("/:id/prescriptions", patients.getPrescriptions);

    // --- New routes for clinician workflow ---
    // Medical notes
    router.get('/:id/notes', patients.getMedicalNotes);
    router.post('/:id/notes', patients.addMedicalNote);

    // Test orders
    router.get('/:id/test-orders', patients.getTestOrders);
    router.post('/:id/test-orders', patients.addTestOrder);
    router.put('/test-orders/:orderId', patients.updateTestOrder);

    // Medications
    router.get('/:id/medications', patients.getMedications);
    router.post('/:id/medications', patients.addPatientMedication);

    // Imaging (file upload)
    router.get('/:id/imaging', patients.getImaging);
    router.post('/:id/imaging', upload.single('image'), patients.addImaging);

    // Lab Results (file upload)
    router.post('/:id/lab-results', upload.single('file'), patients.addLabResult);

    // AI suggestions
    app.post('/api/ai/diagnose', ai.diagnose);
    app.post('/api/ai/pharmacy-check', ai.pharmacyCheck);

    // --- Imaging Department: Get all imaging test orders ---
    app.get('/api/test-orders', patients.getAllImagingOrders);

    // Add a new Prescription
    router.post('/:id/prescriptions', patients.addPrescription);

    // Procedures
    router.post('/:id/procedures', patients.addPatientProcedure);
    router.get('/:id/procedures', patients.getPatientProcedures);

    // Charges
    router.get('/:id/charges', patients.getPatientCharges);
    router.post('/:id/charges/pay', patients.markChargesPaid);

    // Payment history
    router.get('/:id/payment-history', patients.getPaymentHistory);

    // Per-charge payment/refund
    router.post('/:id/charge/pay', patients.markChargePaid);
    router.post('/:id/charge/refund', patients.refundCharge);

    // Analytics
    router.get('/analytics/payments', patients.getPaymentAnalytics);

    app.use('/api/patients', router);
}; 