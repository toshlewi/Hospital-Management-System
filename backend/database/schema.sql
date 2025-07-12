-- PostgreSQL Schema for Hospital Management System
-- Create the database (run this separately in Supabase dashboard)
-- CREATE DATABASE hospital_management;

-- Enable UUID extension for better ID management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    head_doctor_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id SERIAL PRIMARY KEY,
    department_id INTEGER,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Update departments table with foreign key
ALTER TABLE departments
ADD CONSTRAINT fk_departments_head_doctor 
FOREIGN KEY (head_doctor_id) REFERENCES doctors(doctor_id);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    blood_type VARCHAR(5),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(100),
    insurance_info TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'admitted', 'discharged')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical History table
CREATE TABLE IF NOT EXISTS medical_history (
    history_id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    conditions TEXT,
    allergies TEXT,
    surgeries TEXT,
    medications TEXT,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('general', 'private', 'icu', 'operation', 'emergency')),
    floor INTEGER,
    wing VARCHAR(50),
    is_occupied BOOLEAN DEFAULT FALSE,
    capacity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admissions table
CREATE TABLE IF NOT EXISTS admissions (
    admission_id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    room_id INTEGER,
    admission_date TIMESTAMP NOT NULL,
    discharge_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'admitted' CHECK (status IN ('admitted', 'discharged', 'transferred')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- Test Types table
CREATE TABLE IF NOT EXISTS test_types (
    test_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Results table
CREATE TABLE IF NOT EXISTS test_results (
    test_id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    test_type_id INTEGER,
    doctor_id INTEGER,
    test_date TIMESTAMP NOT NULL,
    results TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (test_type_id) REFERENCES test_types(test_type_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    doctor_id INTEGER,
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    type VARCHAR(20) DEFAULT 'regular' CHECK (type IN ('regular', 'follow_up', 'emergency', 'consultation')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    doctor_id INTEGER,
    prescribed_date TIMESTAMP NOT NULL,
    medications TEXT NOT NULL,
    dosage TEXT,
    instructions TEXT,
    quantity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Medical Notes table
CREATE TABLE IF NOT EXISTS medical_notes (
    note_id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    doctor_id INTEGER,
    note_text TEXT,
    diagnosis TEXT,
    advice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Test Orders table
CREATE TABLE IF NOT EXISTS test_orders (
    order_id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    doctor_id INTEGER,
    test_type_id INTEGER,
    status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'completed', 'cancelled')),
    result TEXT,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (test_type_id) REFERENCES test_types(test_type_id)
);

-- Procedures table
CREATE TABLE IF NOT EXISTS procedures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    charge DECIMAL(10,2) NOT NULL
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    charge DECIMAL(10,2) NOT NULL
);

-- Patient Procedures table
CREATE TABLE IF NOT EXISTS patient_procedures (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    procedure_id INTEGER NOT NULL,
    date_performed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (procedure_id) REFERENCES procedures(id)
);

-- Patient Medications table
CREATE TABLE IF NOT EXISTS patient_medications (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    medication_id INTEGER NOT NULL,
    date_prescribed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id)
);

-- Imaging table
CREATE TABLE IF NOT EXISTS imaging (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    image_type VARCHAR(100) NOT NULL,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- AI Suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    suggestion_type VARCHAR(100) NOT NULL,
    suggestion_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(prescribed_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_types_updated_at BEFORE UPDATE ON test_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON test_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 