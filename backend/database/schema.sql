-- Create the database
CREATE DATABASE IF NOT EXISTS hospital_management;
USE hospital_management;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    head_doctor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100),
    contact_number VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Update departments table with foreign key
ALTER TABLE departments
ADD FOREIGN KEY (head_doctor_id) REFERENCES doctors(doctor_id);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    blood_type VARCHAR(5),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(100),
    insurance_info TEXT,
    status ENUM('active', 'inactive', 'admitted', 'discharged') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medical History table
CREATE TABLE IF NOT EXISTS medical_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    conditions TEXT,
    allergies TEXT,
    surgeries TEXT,
    medications TEXT,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    type ENUM('general', 'private', 'icu', 'operation', 'emergency') NOT NULL,
    floor INT,
    wing VARCHAR(50),
    is_occupied BOOLEAN DEFAULT FALSE,
    capacity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admissions table
CREATE TABLE IF NOT EXISTS admissions (
    admission_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    room_id INT,
    admission_date DATETIME NOT NULL,
    discharge_date DATETIME,
    status ENUM('admitted', 'discharged', 'transferred') DEFAULT 'admitted',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- Test Types table
CREATE TABLE IF NOT EXISTS test_types (
    test_type_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Test Results table
CREATE TABLE IF NOT EXISTS test_results (
    test_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    test_type_id INT,
    doctor_id INT,
    test_date DATETIME NOT NULL,
    results TEXT,
    notes TEXT,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (test_type_id) REFERENCES test_types(test_type_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    appointment_date DATETIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    type ENUM('regular', 'follow_up', 'emergency', 'consultation') DEFAULT 'regular',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    prescribed_date DATETIME NOT NULL,
    medications TEXT NOT NULL,
    dosage TEXT,
    instructions TEXT,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Medical Notes table
CREATE TABLE IF NOT EXISTS medical_notes (
    note_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    note_text TEXT,
    diagnosis TEXT,
    advice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Test Orders table
CREATE TABLE IF NOT EXISTS test_orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    test_type_id INT,
    status ENUM('ordered', 'completed', 'cancelled') DEFAULT 'ordered',
    result TEXT,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (test_type_id) REFERENCES test_types(test_type_id)
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    medication_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    medication_name VARCHAR(100),
    dosage VARCHAR(100),
    instructions TEXT,
    prescribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Imaging table
CREATE TABLE IF NOT EXISTS imaging (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    image_path VARCHAR(255),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- AI Suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
    suggestion_id INT PRIMARY KEY AUTO_INCREMENT,
    note_id INT,
    suggestion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES medical_notes(note_id)
);

-- DEMO DATA: Add Lewis Gitonga and common cold history
INSERT INTO patients (first_name, last_name, date_of_birth, gender, contact_number, email, address, status)
VALUES ('Lewis', 'Gitonga', '1992-03-15', 'male', '0712345678', 'lewis.gitonga@example.com', 'Nairobi, Kenya', 'active');

-- Get Lewis's patient_id (assume it's the last inserted)
SET @lewis_id = LAST_INSERT_ID();

-- Add a doctor for demo
INSERT INTO doctors (first_name, last_name, specialization, contact_number, email, status)
VALUES ('Jane', 'Doe', 'General Medicine', '0700000000', 'jane.doe@hospital.com', 'active');
SET @doctor_id = LAST_INSERT_ID();

-- Add a medical note for common cold
INSERT INTO medical_notes (patient_id, doctor_id, note_text, diagnosis, advice)
VALUES (@lewis_id, @doctor_id, 'Patient presents with runny nose, mild fever, and sore throat. No shortness of breath. Vitals stable.', 'Common Cold', 'Rest, increase fluid intake, paracetamol for fever.');

-- Add a test order (CBC)
INSERT INTO test_types (name, description, cost) VALUES ('CBC', 'Complete Blood Count', 500.00);
SET @cbc_id = LAST_INSERT_ID();
INSERT INTO test_orders (patient_id, doctor_id, test_type_id, status, result)
VALUES (@lewis_id, @doctor_id, @cbc_id, 'completed', 'Normal white cell count, no signs of bacterial infection.');

-- Add a medication
INSERT INTO medications (patient_id, doctor_id, medication_name, dosage, instructions)
VALUES (@lewis_id, @doctor_id, 'Paracetamol', '500mg every 8 hours', 'Take after meals for 3 days.');

-- Add an AI suggestion
INSERT INTO ai_suggestions (note_id, suggestion)
VALUES (LAST_INSERT_ID(), 'Diagnosis consistent with viral upper respiratory infection. No antibiotics needed. Advise on hydration and rest.'); 