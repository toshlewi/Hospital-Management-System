const pharmacy = require('../controllers/pharmacy.controller.js');
const router = require('express').Router();

// Get all drugs
router.get('/stock', pharmacy.getAllDrugs);
// Add a new drug
router.post('/stock', pharmacy.addDrug);
// Restock a drug
router.put('/stock/:drug_id/restock', pharmacy.restockDrug);
// Dispense a drug
router.post('/stock/:drug_id/dispense', pharmacy.dispenseDrug);
// Get all active prescriptions
router.get('/prescriptions/active', pharmacy.getActivePrescriptions);

module.exports = router; 