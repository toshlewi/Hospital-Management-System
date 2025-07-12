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
        const patients = await dbService.getPatientsWithBasicInfo();
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
        const patient = await dbService.getPatientWithDetails(req.params.id);
        
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
        const patient = await dbService.getPatientWithDetails(req.params.id);
        res.send(patient.medical_history || []);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving medical history."
        });
    }
};

// Get Patient's Appointments
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await dbService.getAppointments();
        const patientAppointments = appointments.filter(apt => apt.patient_id == req.params.id);
        res.send(patientAppointments);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving appointments."
        });
    }
};

// Get Patient's Test Results
exports.getTestResults = async (req, res) => {
    try {
        const testOrders = await dbService.getTestOrders(req.params.id);
        res.send(testOrders);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving test results."
        });
    }
};

// Get Patient's Prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await dbService.getPrescriptions(req.params.id);
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
        const notes = await dbService.getMedicalNotes(req.params.patientId);
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
            patient_id: req.params.patientId,
            doctor_id: req.body.doctor_id || 1,
            note_text: req.body.notes || req.body.note_text,
            diagnosis: req.body.diagnosis,
            advice: req.body.advice
        };

        const result = await dbService.addMedicalNote(req.params.patientId, noteData);

        res.status(201).send({
            message: "Medical note added successfully",
            note: result
        });
    } catch (err) {
        console.error('Error adding medical note:', err);
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

// Add medical note
exports.addMedicalNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const noteData = req.body;
    
    // Validate required fields
    if (!noteData.note_text && !noteData.notes) {
      return res.status(400).json({ message: 'Note content is required' });
    }
    
    const note = await dbService.addMedicalNote(patientId, noteData);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error adding medical note:', error);
    res.status(500).json({ message: 'Error adding medical note', error: error.message });
  }
};

// Create prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptionData = req.body;
    
    // Validate required fields
    if (!prescriptionData.medication_name || !prescriptionData.dosage) {
      return res.status(400).json({ message: 'Medication name and dosage are required' });
    }
    
    const prescription = await dbService.createPrescription(patientId, prescriptionData);
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
};

// Get test orders
exports.getTestOrders = async (req, res) => {
  try {
    const { patientId } = req.params;
    const orders = await dbService.getTestOrders(patientId);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching test orders:', error);
    res.status(500).json({ message: 'Error fetching test orders', error: error.message });
  }
};

// Add test order
exports.addTestOrder = async (req, res) => {
  try {
    const { patientId } = req.params;
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.test_name) {
      return res.status(400).json({ message: 'Test name is required' });
    }
    
    const order = await dbService.addTestOrder(patientId, orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error adding test order:', error);
    res.status(500).json({ message: 'Error adding test order', error: error.message });
  }
};

// Update test order
exports.updateTestOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;
    
    const result = await dbService.updateTestOrder(orderId, updateData);
    res.json(result);
  } catch (error) {
    console.error('Error updating test order:', error);
    res.status(500).json({ message: 'Error updating test order', error: error.message });
  }
};

// Update prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const updateData = req.body;
    
    const result = await dbService.updatePrescription(prescriptionId, updateData);
    res.json(result);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ message: 'Error updating prescription', error: error.message });
  }
};

// Upload lab result
exports.uploadLabResult = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // In a real app, you would save the file to cloud storage
    const filePath = `/uploads/lab-results/${Date.now()}-${file.originalname}`;
    
    const result = await dbService.addLabResult(patientId, {
      file_path: filePath,
      description: req.body.description || 'Lab result upload',
      order_id: req.body.order_id
    });
    
    res.json({ ...result, file_path: filePath });
  } catch (error) {
    console.error('Error uploading lab result:', error);
    res.status(500).json({ message: 'Error uploading lab result', error: error.message });
  }
};

// Upload imaging
exports.uploadImaging = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // In a real app, you would save the file to cloud storage
    const filePath = `/uploads/imaging/${Date.now()}-${file.originalname}`;
    
    const result = await dbService.addImaging(patientId, {
      image_url: filePath,
      image_type: req.body.image_type || 'X-Ray',
      notes: req.body.notes || 'Imaging upload',
      order_id: req.body.order_id
    });
    
    res.json({ ...result, image_url: filePath });
  } catch (error) {
    console.error('Error uploading imaging:', error);
    res.status(500).json({ message: 'Error uploading imaging', error: error.message });
  }
};

// Get imaging
exports.getImaging = async (req, res) => {
  try {
    const { patientId } = req.params;
    const imaging = await dbService.getImaging(patientId);
    res.json(imaging);
  } catch (error) {
    console.error('Error fetching imaging:', error);
    res.status(500).json({ message: 'Error fetching imaging', error: error.message });
  }
}; 