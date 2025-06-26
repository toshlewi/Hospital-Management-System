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

// Create and Save a new Patient
exports.create = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            date_of_birth,
            gender,
            blood_type,
            contact_number,
            email,
            address,
            emergency_contact,
            insurance_info
        } = req.body;

        const [result] = await pool.query(
            'INSERT INTO patients (first_name, last_name, date_of_birth, gender, blood_type, contact_number, email, address, emergency_contact, insurance_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, date_of_birth, gender, blood_type, contact_number, email, address, emergency_contact, insurance_info]
        );

        res.status(201).send({
            message: "Patient created successfully",
            id: result.insertId
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Patient."
        });
    }
};

// Retrieve all Patients
exports.findAll = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM patients WHERE status = 'active'");
        res.send(rows);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving patients."
        });
    }
};

// Find a single Patient with id
exports.findOne = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
        
        if (rows.length) {
            res.send(rows[0]);
        } else {
            res.status(404).send({
                message: `Patient not found with id ${req.params.id}`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving Patient with id " + req.params.id
        });
    }
};

// Update a Patient
exports.update = async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE patients SET ? WHERE patient_id = ?',
            [req.body, req.params.id]
        );

        if (result.affectedRows == 0) {
            res.status(404).send({
                message: `Patient not found with id ${req.params.id}`
            });
        } else {
            res.send({
                message: "Patient updated successfully."
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Patient with id " + req.params.id
        });
    }
};

// "Delete" a Patient (soft delete)
exports.delete = async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE patients SET status = ? WHERE patient_id = ?',
            ['inactive', req.params.id]
        );

        if (result.affectedRows == 0) {
            res.status(404).send({
                message: `Patient not found with id ${req.params.id}`
            });
        } else {
            res.send({
                message: "Patient marked as inactive successfully!"
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not update Patient status for id " + req.params.id
        });
    }
};

// Get Patient's Medical History
exports.getMedicalHistory = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM medical_history WHERE patient_id = ? ORDER BY record_date DESC',
            [req.params.id]
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving medical history."
        });
    }
};

// Get Patient's Appointments
exports.getAppointments = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name 
             FROM appointments a 
             LEFT JOIN doctors d ON a.doctor_id = d.doctor_id 
             WHERE a.patient_id = ? 
             ORDER BY a.appointment_date DESC`,
            [req.params.id]
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving appointments."
        });
    }
};

// Get Patient's Test Results
exports.getTestResults = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT tr.*, tt.name as test_name, d.first_name as doctor_first_name, d.last_name as doctor_last_name 
             FROM test_results tr 
             LEFT JOIN test_types tt ON tr.test_type_id = tt.test_type_id 
             LEFT JOIN doctors d ON tr.doctor_id = d.doctor_id 
             WHERE tr.patient_id = ? 
             ORDER BY tr.test_date DESC`,
            [req.params.id]
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving test results."
        });
    }
};

// Get Patient's Prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name 
             FROM prescriptions p 
             LEFT JOIN doctors d ON p.doctor_id = d.doctor_id 
             WHERE p.patient_id = ? 
             ORDER BY p.prescribed_date DESC`,
            [req.params.id]
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving prescriptions."
        });
    }
};

// --- Medical Notes ---
exports.getMedicalNotes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM medical_notes WHERE patient_id = ? ORDER BY created_at DESC', [req.params.id]);
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error retrieving medical notes." });
    }
};

exports.addMedicalNote = async (req, res) => {
    try {
        const { doctor_id, note_text, diagnosis, advice } = req.body;
        const [result] = await pool.query(
            'INSERT INTO medical_notes (patient_id, doctor_id, note_text, diagnosis, advice) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, doctor_id, note_text, diagnosis, advice]
        );
        res.status(201).send({ message: "Medical note added", note_id: result.insertId });
    } catch (err) {
        res.status(500).send({ message: err.message || "Error adding medical note." });
    }
};

// --- Test Orders ---
exports.getTestOrders = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT o.*, 
                CASE 
                    WHEN o.order_type = 'lab' THEN tt.name 
                    ELSE o.test_name 
                END as test_name,
                d.first_name as doctor_first_name, 
                d.last_name as doctor_last_name 
             FROM test_orders o 
             LEFT JOIN test_types tt ON o.test_type_id = tt.test_type_id 
             LEFT JOIN doctors d ON o.doctor_id = d.doctor_id 
             WHERE o.patient_id = ? 
             ORDER BY o.ordered_at DESC`,
            [req.params.id]
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error retrieving test orders." });
    }
};

exports.addTestOrder = async (req, res) => {
    try {
        const { doctor_id, test_type_id, test_name, order_type, is_imaging } = req.body;
        // If is_imaging or order_type is 'imaging', treat as imaging order
        const type = order_type || (is_imaging ? 'imaging' : 'lab');
        const name = type === 'imaging' ? test_name : null;
        const [result] = await pool.query(
            'INSERT INTO test_orders (patient_id, doctor_id, test_type_id, test_name, order_type) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, doctor_id, test_type_id || null, name, type]
        );
        res.status(201).send({ message: "Test order added", order_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err.message || "Error adding test order." });
    }
};

exports.updateTestOrder = async (req, res) => {
    try {
        const { result, status } = req.body;
        const { orderId } = req.params;
        const [update] = await pool.query(
            'UPDATE test_orders SET result = ?, status = ? WHERE order_id = ?',
            [result, status, orderId]
        );
        res.send({ message: 'Test order updated.' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err.message || 'Error updating test order.' });
    }
};

// --- Medications ---
exports.getMedications = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM medications WHERE patient_id = ? ORDER BY prescribed_at DESC', [req.params.id]);
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error retrieving medications." });
    }
};

exports.addMedication = async (req, res) => {
    try {
        const { doctor_id, medication_name, dosage, instructions } = req.body;
        const [result] = await pool.query(
            'INSERT INTO medications (patient_id, doctor_id, medication_name, dosage, instructions) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, doctor_id, medication_name, dosage, instructions]
        );
        res.status(201).send({ message: "Medication prescribed", medication_id: result.insertId });
    } catch (err) {
        res.status(500).send({ message: err.message || "Error prescribing medication." });
    }
};

// --- Imaging ---
exports.getImaging = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM imaging WHERE patient_id = ? ORDER BY uploaded_at DESC', [req.params.id]);
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error retrieving imaging." });
    }
};

exports.addImaging = async (req, res) => {
    try {
        const { doctor_id, description, test_order_id } = req.body;
        const image_path = req.file ? req.file.path : null;
        if (!image_path) {
            return res.status(400).send({ message: "Image file is required." });
        }
        const [result] = await pool.query(
            'INSERT INTO imaging (patient_id, doctor_id, image_path, description, test_order_id) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, doctor_id, image_path, description, test_order_id || null]
        );
        res.status(201).send({ message: "Imaging uploaded", image_id: result.insertId });
    } catch (err) {
        res.status(500).send({ message: err.message || "Error uploading imaging." });
    }
};

// Get all imaging test orders (for Imaging department)
exports.getAllImagingOrders = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT o.*, p.first_name, p.last_name, p.gender, p.date_of_birth, d.first_name as doctor_first_name, d.last_name as doctor_last_name
             FROM test_orders o
             LEFT JOIN patients p ON o.patient_id = p.patient_id
             LEFT JOIN doctors d ON o.doctor_id = d.doctor_id
             WHERE o.order_type = 'imaging'
             ORDER BY o.ordered_at DESC`
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving imaging orders.' });
    }
};

// --- Lab Results (File Upload) ---
exports.addLabResult = async (req, res) => {
    try {
        const { order_id, description } = req.body;
        const patient_id = req.params.id;
        const file = req.file;
        if (!file) {
            return res.status(400).send({ message: "File is required." });
        }
        const file_path = file.path;
        const file_type = file.mimetype;
        const [result] = await pool.query(
            'INSERT INTO lab_results (order_id, patient_id, file_path, file_type, description) VALUES (?, ?, ?, ?, ?)',
            [order_id, patient_id, file_path, file_type, description || null]
        );
        res.status(201).send({ message: "Lab result uploaded", result_id: result.insertId, file_path });
    } catch (err) {
        res.status(500).send({ message: err.message || "Error uploading lab result." });
    }
};

// Add a new Prescription
exports.addPrescription = async (req, res) => {
    try {
        console.log('Received prescription payload:', req.body);
        const { doctor_id, medications, dosage, instructions, quantity } = req.body;
        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
            return res.status(400).send({ message: 'Quantity must be a positive integer.' });
        }
        const [result] = await pool.query(
            'INSERT INTO prescriptions (patient_id, doctor_id, prescribed_date, medications, dosage, instructions, quantity, status) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
            [req.params.id, doctor_id, medications, dosage, instructions, qty, 'active']
        );
        res.status(201).send({ message: 'Prescription created', prescription_id: result.insertId });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error creating prescription.' });
    }
};

// Add a procedure to a patient
exports.addPatientProcedure = async (req, res) => {
    try {
        const { procedure_id } = req.body;
        if (!procedure_id) {
            return res.status(400).send({ message: 'procedure_id is required.' });
        }
        const [result] = await pool.query(
            'INSERT INTO patient_procedures (patient_id, procedure_id) VALUES (?, ?)',
            [req.params.id, procedure_id]
        );
        res.status(201).send({ message: 'Procedure added to patient.', id: result.insertId });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error adding procedure to patient.' });
    }
};

// Get all procedures (with charges) for a patient
exports.getPatientProcedures = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT pp.*, p.name, p.charge FROM patient_procedures pp
             JOIN procedures p ON pp.procedure_id = p.id
             WHERE pp.patient_id = ?`,
            [req.params.id]
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving patient procedures.' });
    }
};

// Add a medication to a patient
exports.addPatientMedication = async (req, res) => {
    try {
        const { medication_id, quantity } = req.body;
        if (!medication_id || !quantity) {
            return res.status(400).send({ message: 'medication_id and quantity are required.' });
        }
        const [result] = await pool.query(
            'INSERT INTO patient_medications (patient_id, medication_id, quantity) VALUES (?, ?, ?)',
            [req.params.id, medication_id, quantity]
        );
        res.status(201).send({ message: 'Medication added to patient.', id: result.insertId });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error adding medication to patient.' });
    }
};

// Get all medications (with charges) for a patient
exports.getPatientMedications = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT pm.*, m.name, m.charge FROM patient_medications pm
             JOIN medications m ON pm.medication_id = m.medication_id
             WHERE pm.patient_id = ?`,
            [req.params.id]
        );
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving patient medications.' });
    }
};

// Get all outstanding charges for a patient (procedures + medications + tests)
exports.getPatientCharges = async (req, res) => {
    try {
        // Procedures
        const [procedures] = await pool.query(
            `SELECT 'procedure' as type, pp.id, p.name, p.charge, pp.status, pp.date_performed as date, NULL as quantity
             FROM patient_procedures pp
             JOIN procedures p ON pp.procedure_id = p.id
             WHERE pp.patient_id = ? AND pp.status = 'pending'`,
            [req.params.id]
        );
        // Medications
        const [medications] = await pool.query(
            `SELECT 'medication' as type, pm.id, m.name, m.charge, pm.status, pm.date_prescribed as date, pm.quantity
             FROM patient_medications pm
             JOIN medications m ON pm.medication_id = m.medication_id
             WHERE pm.patient_id = ? AND pm.status = 'pending'`,
            [req.params.id]
        );
        // Tests (Lab & Imaging)
        const [tests] = await pool.query(
            `SELECT 'test' as type, o.order_id as id, 
                    COALESCE(tt.name, o.test_name) as name, 
                    COALESCE(tt.cost, 0) as charge, 
                    o.status, o.ordered_at as date, 1 as quantity
             FROM test_orders o
             LEFT JOIN test_types tt ON o.test_type_id = tt.test_type_id
             WHERE o.patient_id = ? AND o.status = 'ordered'`,
            [req.params.id]
        );
        res.send([...procedures, ...medications, ...tests]);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving patient charges.' });
    }
};

// Mark all charges as paid for a patient (including tests)
exports.markChargesPaid = async (req, res) => {
    try {
        await pool.query(
            `UPDATE patient_procedures SET status = 'paid' WHERE patient_id = ? AND status = 'pending'`,
            [req.params.id]
        );
        await pool.query(
            `UPDATE patient_medications SET status = 'paid' WHERE patient_id = ? AND status = 'pending'`,
            [req.params.id]
        );
        await pool.query(
            `UPDATE test_orders SET status = 'paid' WHERE patient_id = ? AND status = 'ordered'`,
            [req.params.id]
        );
        res.send({ message: 'All charges marked as paid for patient.' });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error marking charges as paid.' });
    }
};

// Get payment history (paid charges) for a patient, with optional date range filtering (including tests)
exports.getPaymentHistory = async (req, res) => {
    try {
        const { start, end } = req.query;
        let proceduresQuery = `SELECT 'procedure' as type, pp.id, p.name, p.charge, pp.status, pp.date_performed as date, NULL as quantity
            FROM patient_procedures pp
            JOIN procedures p ON pp.procedure_id = p.id
            WHERE pp.patient_id = ? AND pp.status = 'paid'`;
        let medicationsQuery = `SELECT 'medication' as type, pm.id, m.name, m.charge, pm.status, pm.date_prescribed as date, pm.quantity
            FROM patient_medications pm
            JOIN medications m ON pm.medication_id = m.medication_id
            WHERE pm.patient_id = ? AND pm.status = 'paid'`;
        let testsQuery = `SELECT 'test' as type, o.order_id as id, COALESCE(tt.name, o.test_name) as name, COALESCE(tt.cost, 0) as charge, o.status, o.ordered_at as date, 1 as quantity
            FROM test_orders o
            LEFT JOIN test_types tt ON o.test_type_id = tt.test_type_id
            WHERE o.patient_id = ? AND o.status = 'paid'`;
        const params = [req.params.id];
        if (start && end) {
            proceduresQuery += ' AND pp.date_performed BETWEEN ? AND ?';
            medicationsQuery += ' AND pm.date_prescribed BETWEEN ? AND ?';
            testsQuery += ' AND o.ordered_at BETWEEN ? AND ?';
            params.push(start, end);
        }
        const [procedures] = await pool.query(proceduresQuery, params);
        const [medications] = await pool.query(medicationsQuery, params);
        const [tests] = await pool.query(testsQuery, params);
        res.send([...procedures, ...medications, ...tests]);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving payment history.' });
    }
};

// Mark a single charge as paid (including tests)
exports.markChargePaid = async (req, res) => {
    try {
        const { type, id } = req.body;
        if (type === 'procedure') {
            await pool.query('UPDATE patient_procedures SET status = "paid" WHERE id = ?', [id]);
        } else if (type === 'medication') {
            await pool.query('UPDATE patient_medications SET status = "paid" WHERE id = ?', [id]);
        } else if (type === 'test') {
            await pool.query('UPDATE test_orders SET status = "paid" WHERE order_id = ?', [id]);
        } else {
            return res.status(400).send({ message: 'Invalid charge type.' });
        }
        res.send({ message: 'Charge marked as paid.' });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error marking charge as paid.' });
    }
};

// Refund a single charge (including tests)
exports.refundCharge = async (req, res) => {
    try {
        const { type, id } = req.body;
        if (type === 'procedure') {
            await pool.query('UPDATE patient_procedures SET status = "pending" WHERE id = ?', [id]);
        } else if (type === 'medication') {
            await pool.query('UPDATE patient_medications SET status = "pending" WHERE id = ?', [id]);
        } else if (type === 'test') {
            await pool.query('UPDATE test_orders SET status = "ordered" WHERE order_id = ?', [id]);
        } else {
            return res.status(400).send({ message: 'Invalid charge type.' });
        }
        res.send({ message: 'Charge refunded.' });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error refunding charge.' });
    }
};

// Get payment analytics (totals by day/week/month)
exports.getPaymentAnalytics = async (req, res) => {
    try {
        const { period } = req.query; // 'day', 'week', 'month'
        let groupBy = 'DATE(date)';
        if (period === 'week') groupBy = 'YEARWEEK(date)';
        if (period === 'month') groupBy = 'YEAR(date), MONTH(date)';
        const [rows] = await pool.query(`
            SELECT ${groupBy} as period, SUM(charge * IFNULL(quantity,1)) as total
            FROM (
                SELECT pp.date_performed as date, p.charge, NULL as quantity
                FROM patient_procedures pp JOIN procedures p ON pp.procedure_id = p.id
                WHERE pp.status = 'paid'
                UNION ALL
                SELECT pm.date_prescribed as date, m.charge, pm.quantity
                FROM patient_medications pm JOIN medications m ON pm.medication_id = m.medication_id
                WHERE pm.status = 'paid'
            ) as charges
            GROUP BY period
            ORDER BY period DESC
            LIMIT 30
        `);
        res.send(rows);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving analytics.' });
    }
}; 