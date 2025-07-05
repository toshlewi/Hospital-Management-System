const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller.js');

// Billing Items Routes
router.get('/items', billingController.getBillingItems);
router.get('/items/category/:category', billingController.getBillingItemsByCategory);
router.get('/items/popular', billingController.getPopularBillingItems);

// Bills Routes
router.get('/bills', billingController.getBills);
router.get('/bills/search', billingController.searchBills);
router.get('/bills/:billId', billingController.getBillById);
router.get('/bills/patient/:patientId', billingController.getBillsByPatient);
router.post('/bills', billingController.createBill);
router.patch('/bills/:billId/status', billingController.updateBillStatus);
router.get('/bills/:billId/pdf', billingController.generateBillPDF);

// Payments Routes
router.get('/payments', billingController.getPayments);
router.get('/payments/bill/:billId', billingController.getPaymentsByBill);
router.post('/payments', billingController.createPayment);

// Dashboard Routes
router.get('/summary', billingController.getBillingSummary);

module.exports = router; 