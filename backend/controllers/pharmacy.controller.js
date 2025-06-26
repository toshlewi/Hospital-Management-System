const mysql = require('mysql2');
const dbConfig = require('../config/db.config.js');

const pool = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Get all drugs in stock
exports.getAllDrugs = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pharmacy_stock');
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving drugs.' });
    }
};

// Add a new drug
exports.addDrug = async (req, res) => {
    try {
        const { name, description, quantity, unit } = req.body;
        const [result] = await pool.query(
            'INSERT INTO pharmacy_stock (name, description, quantity, unit) VALUES (?, ?, ?, ?)',
            [name, description, quantity, unit]
        );
        res.status(201).send({ message: 'Drug added', drug_id: result.insertId });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error adding drug.' });
    }
};

// Restock a drug
exports.restockDrug = async (req, res) => {
    try {
        const { drug_id } = req.params;
        const { quantity_added } = req.body;
        // Update stock
        await pool.query(
            'UPDATE pharmacy_stock SET quantity = quantity + ?, last_restocked = CURRENT_TIMESTAMP WHERE drug_id = ?',
            [quantity_added, drug_id]
        );
        // Log restock
        await pool.query(
            'INSERT INTO pharmacy_stock_log (drug_id, quantity_added) VALUES (?, ?)',
            [drug_id, quantity_added]
        );
        res.send({ message: 'Drug restocked' });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error restocking drug.' });
    }
};

// Dispense a drug (decrement stock)
exports.dispenseDrug = async (req, res) => {
    try {
        const { drug_id } = req.params;
        const { quantity_dispensed, prescription_id } = req.body;
        // Defensive checks
        const qtyDisp = Number(quantity_dispensed);
        if (!Number.isInteger(qtyDisp) || qtyDisp <= 0) {
            return res.status(400).send({ message: 'Dispensed quantity must be a positive integer.' });
        }
        if (!prescription_id) {
            return res.status(400).send({ message: 'Prescription ID is required.' });
        }
        // Decrement stock
        const [result] = await pool.query(
            'UPDATE pharmacy_stock SET quantity = quantity - ? WHERE drug_id = ? AND quantity >= ?',
            [qtyDisp, drug_id, qtyDisp]
        );
        if (result.affectedRows === 0) {
            return res.status(400).send({ message: 'Not enough stock or drug not found.' });
        }
        // Update prescription status and log dispensed quantity and time
        await pool.query(
            "UPDATE prescriptions SET status = 'completed', quantity = ?, dispensed_at = NOW() WHERE prescription_id = ?",
            [qtyDisp, prescription_id]
        );
        res.send({ message: 'Drug dispensed and prescription updated.' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err.message || 'Error dispensing drug.' });
    }
};

// Get all active prescriptions (to be filled by pharmacy)
exports.getActivePrescriptions = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, pa.first_name as patient_first_name, pa.last_name as patient_last_name, d.first_name as doctor_first_name, d.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN patients pa ON p.patient_id = pa.patient_id
            LEFT JOIN doctors d ON p.doctor_id = d.doctor_id
            WHERE p.status = 'active'
            ORDER BY p.prescribed_date DESC
        `);
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving active prescriptions.' });
    }
}; 