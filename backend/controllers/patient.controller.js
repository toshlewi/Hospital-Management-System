const dbService = require('../services/database.js');

// Create and Save a new Patient
exports.create = async (req, res) => {
    try {
        const patientData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            date_of_birth: req.body.date_of_birth,
            gender: req.body.gender,
            blood_type: req.body.blood_type,
            contact_number: req.body.contact_number,
            email: req.body.email,
            address: req.body.address,
            emergency_contact: req.body.emergency_contact,
            insurance_info: req.body.insurance_info
        };

        const result = await dbService.createPatient(patientData);

        res.status(201).send({
            message: "Patient created successfully",
            patient: result
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
        const patients = await dbService.getPatients();
        res.send(patients);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving patients."
        });
    }
};

// Find a single Patient with id
exports.findOne = async (req, res) => {
    try {
        const patient = await dbService.getPatientById(req.params.id);
        
        if (patient) {
            res.send(patient);
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
        const result = await dbService.updatePatient(req.params.id, req.body);

        if (result) {
            res.send({
                message: "Patient updated successfully.",
                patient: result
            });
        } else {
            res.status(404).send({
                message: `Patient not found with id ${req.params.id}`
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
        const result = await dbService.updatePatient(req.params.id, { status: 'inactive' });

        if (result) {
            res.send({
                message: "Patient marked as inactive successfully!"
            });
        } else {
            res.status(404).send({
                message: `Patient not found with id ${req.params.id}`
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
        const history = await dbService.query(
            'SELECT * FROM medical_history WHERE patient_id = $1 ORDER BY record_date DESC',
            [req.params.id]
        );
        res.send(history);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving medical history."
        });
    }
};

// Get Patient's Appointments
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await dbService.query(
            `SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name 
             FROM appointments a 
             LEFT JOIN doctors d ON a.doctor_id = d.doctor_id 
             WHERE a.patient_id = $1 
             ORDER BY a.appointment_date DESC`,
            [req.params.id]
        );
        res.send(appointments);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving appointments."
        });
    }
};

// Get Patient's Test Results
exports.getTestResults = async (req, res) => {
    try {
        const testResults = await dbService.query(
            `SELECT tr.*, tt.name as test_name, d.first_name as doctor_first_name, d.last_name as doctor_last_name 
             FROM test_results tr 
             LEFT JOIN test_types tt ON tr.test_type_id = tt.test_type_id 
             LEFT JOIN doctors d ON tr.doctor_id = d.doctor_id 
             WHERE tr.patient_id = $1 
             ORDER BY tr.test_date DESC`,
            [req.params.id]
        );
        res.send(testResults);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving test results."
        });
    }
};

// Get Patient's Prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await dbService.query(
            `SELECT p.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name 
             FROM prescriptions p 
             LEFT JOIN doctors d ON p.doctor_id = d.doctor_id 
             WHERE p.patient_id = $1 
             ORDER BY p.prescribed_date DESC`,
            [req.params.id]
        );
        res.send(prescriptions);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving prescriptions."
        });
    }
};

// --- Medical Notes ---
exports.getMedicalNotes = async (req, res) => {
    try {
        const notes = await dbService.query(
            `SELECT mn.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name 
             FROM medical_notes mn 
             LEFT JOIN doctors d ON mn.doctor_id = d.doctor_id 
             WHERE mn.patient_id = $1 
             ORDER BY mn.created_at DESC`,
            [req.params.id]
        );
        res.send(notes);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving medical notes."
        });
    }
};

// Add Medical Note
exports.addMedicalNote = async (req, res) => {
    try {
        const noteData = {
            patient_id: req.params.id,
            doctor_id: req.body.doctor_id,
            note_text: req.body.note_text,
            diagnosis: req.body.diagnosis,
            advice: req.body.advice
        };

        const result = await dbService.query(
            `INSERT INTO medical_notes (patient_id, doctor_id, note_text, diagnosis, advice) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [noteData.patient_id, noteData.doctor_id, noteData.note_text, noteData.diagnosis, noteData.advice]
        );

        res.status(201).send({
            message: "Medical note added successfully",
            note: result[0]
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error adding medical note."
        });
    }
};

// --- Admissions ---
exports.getAdmissions = async (req, res) => {
    try {
        const admissions = await dbService.query(
            `SELECT a.*, r.room_number, r.type as room_type 
             FROM admissions a 
             LEFT JOIN rooms r ON a.room_id = r.room_id 
             WHERE a.patient_id = $1 
             ORDER BY a.admission_date DESC`,
            [req.params.id]
        );
        res.send(admissions);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving admissions."
        });
    }
};

// Add Admission
exports.addAdmission = async (req, res) => {
    try {
        const admissionData = {
            patient_id: req.params.id,
            room_id: req.body.room_id,
            admission_date: req.body.admission_date,
            notes: req.body.notes
        };

        const result = await dbService.query(
            `INSERT INTO admissions (patient_id, room_id, admission_date, notes) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [admissionData.patient_id, admissionData.room_id, admissionData.admission_date, admissionData.notes]
        );

        // Update patient status to admitted
        await dbService.updatePatient(req.params.id, { status: 'admitted' });

        res.status(201).send({
            message: "Patient admitted successfully",
            admission: result[0]
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error admitting patient."
        });
    }
};

// Discharge Patient
exports.dischargePatient = async (req, res) => {
    try {
        const result = await dbService.query(
            `UPDATE admissions 
             SET discharge_date = CURRENT_TIMESTAMP, status = 'discharged' 
             WHERE patient_id = $1 AND status = 'admitted' 
             RETURNING *`,
            [req.params.id]
        );

        if (result.length > 0) {
            // Update patient status to discharged
            await dbService.updatePatient(req.params.id, { status: 'discharged' });

            res.send({
                message: "Patient discharged successfully",
                discharge: result[0]
            });
        } else {
            res.status(404).send({
                message: "No active admission found for this patient."
            });
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error discharging patient."
        });
    }
};

// --- Search and Filter ---
exports.searchPatients = async (req, res) => {
    try {
        const { query, status, gender } = req.query;
        let sql = 'SELECT * FROM patients WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (query) {
            paramCount++;
            sql += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${query}%`);
        }

        if (status) {
            paramCount++;
            sql += ` AND status = $${paramCount}`;
            params.push(status);
        }

        if (gender) {
            paramCount++;
            sql += ` AND gender = $${paramCount}`;
            params.push(gender);
        }

        sql += ' ORDER BY created_at DESC';

        const patients = await dbService.query(sql, params);
        res.send(patients);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error searching patients."
        });
    }
};

// --- Statistics ---
exports.getPatientStats = async (req, res) => {
    try {
        const stats = await dbService.query(`
            SELECT 
                COUNT(*) as total_patients,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_patients,
                COUNT(CASE WHEN status = 'admitted' THEN 1 END) as admitted_patients,
                COUNT(CASE WHEN status = 'discharged' THEN 1 END) as discharged_patients,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_patients
            FROM patients
        `);

        res.send(stats[0]);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving patient statistics."
        });
    }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await dbService.getPatientsWithBasicInfo();
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};

// Get patient by ID with full details
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await dbService.getPatientWithDetails(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
};

// Get patient's billing status
exports.getPatientBillingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const billingStatus = await dbService.getPatientBillingStatus(id);
    res.json(billingStatus);
  } catch (error) {
    console.error('Error fetching patient billing status:', error);
    res.status(500).json({ message: 'Error fetching patient billing status', error: error.message });
  }
};

// Get patient's medical notes
exports.getMedicalNotes = async (req, res) => {
  try {
    const { patientId } = req.params;
    const notes = await dbService.getMedicalNotes(patientId);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching medical notes:', error);
    res.status(500).json({ message: 'Error fetching medical notes', error: error.message });
  }
};

// Get patient's prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await dbService.getPrescriptions(patientId);
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

// Create new patient
exports.createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    
    // Validate required fields
    if (!patientData.first_name || !patientData.last_name) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }
    
    const patient = await dbService.createPatient(patientData);
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const patient = await dbService.updatePatient(id, updateData);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
};

// Delete patient
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbService.deletePatient(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Error deleting patient', error: error.message });
  }
}; 