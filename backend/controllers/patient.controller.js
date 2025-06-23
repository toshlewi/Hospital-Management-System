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
        const [rows] = await pool.query('SELECT * FROM patients');
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

// Delete a Patient
exports.delete = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM patients WHERE patient_id = ?', [req.params.id]);

        if (result.affectedRows == 0) {
            res.status(404).send({
                message: `Patient not found with id ${req.params.id}`
            });
        } else {
            res.send({
                message: "Patient deleted successfully!"
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Patient with id " + req.params.id
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