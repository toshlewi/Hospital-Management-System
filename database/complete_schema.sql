-- Complete Hospital Management System Database Schema
-- PostgreSQL Schema for Hospital Management System
-- This file contains the complete database schema with all tables and relationships

-- Enable UUID extension for better ID management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

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

-- ============================================================================
-- MEDICAL RECORDS
-- ============================================================================

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

-- ============================================================================
-- FACILITY MANAGEMENT
-- ============================================================================

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

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================

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

-- ============================================================================
-- LABORATORY & TESTING
-- ============================================================================

-- Test Types table
CREATE TABLE IF NOT EXISTS test_types (
    test_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    category VARCHAR(50) DEFAULT 'lab' CHECK (category IN ('lab', 'imaging', 'other')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Orders table (Enhanced with imaging fields)
CREATE TABLE IF NOT EXISTS test_orders (
    order_id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    doctor_id INTEGER,
    test_type_id INTEGER,
    test_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'in_progress', 'completed', 'cancelled')),
    result TEXT,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    -- Imaging-specific fields
    body_part VARCHAR(100),
    differential_diagnosis TEXT,
    clinical_notes TEXT,
    imaging_type VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'emergency')),
    requesting_physician VARCHAR(100),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (test_type_id) REFERENCES test_types(test_type_id)
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

-- ============================================================================
-- PHARMACY & MEDICATIONS
-- ============================================================================

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    medication_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    manufacturer VARCHAR(255),
    cost DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacy Stock table
CREATE TABLE IF NOT EXISTS pharmacy_stock (
    stock_id SERIAL PRIMARY KEY,
    medication_id INTEGER REFERENCES medications(medication_id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    expiry_date DATE,
    batch_number VARCHAR(100),
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- ============================================================================
-- PROCEDURES & SERVICES
-- ============================================================================

-- Procedures table
CREATE TABLE IF NOT EXISTS procedures (
    procedure_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    charge DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient Procedures table
CREATE TABLE IF NOT EXISTS patient_procedures (
    patient_procedure_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    procedure_id INTEGER NOT NULL,
    doctor_id INTEGER,
    date_performed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'paid')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (procedure_id) REFERENCES procedures(procedure_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- ============================================================================
-- IMAGING
-- ============================================================================

-- Imaging table
CREATE TABLE IF NOT EXISTS imaging (
    imaging_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    image_type VARCHAR(100) NOT NULL,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- ============================================================================
-- BILLING SYSTEM
-- ============================================================================

-- Billing Items Table (Master list of all billable items)
CREATE TABLE IF NOT EXISTS billing_items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN ('consultation', 'medication', 'lab_test', 'procedure', 'imaging', 'room', 'other')),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bills Table (Main billing records)
CREATE TABLE IF NOT EXISTS bills (
    bill_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(patient_id) ON DELETE CASCADE,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    bill_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled', 'refunded')),
    payment_method VARCHAR(50),
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bill Items Table (Individual items in each bill)
CREATE TABLE IF NOT EXISTS bill_items (
    bill_item_id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(bill_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES billing_items(item_id),
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table (Payment records)
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(bill_id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(patient_id),
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Claims Table
CREATE TABLE IF NOT EXISTS insurance_claims (
    claim_id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(bill_id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(patient_id),
    insurance_provider VARCHAR(255),
    policy_number VARCHAR(100),
    claim_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    submitted_date DATE DEFAULT CURRENT_DATE,
    processed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AI & ANALYTICS
-- ============================================================================

-- AI Suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
    suggestion_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    suggestion_type VARCHAR(100) NOT NULL,
    suggestion_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core entity indexes
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);

-- Test indexes
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_test_results_patient ON test_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_test_orders_status ON test_orders(status);
CREATE INDEX IF NOT EXISTS idx_test_orders_ordered_at ON test_orders(ordered_at);
CREATE INDEX IF NOT EXISTS idx_test_orders_patient ON test_orders(patient_id);

-- Prescription indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(prescribed_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_bills_patient_id ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_bill_date ON bills(bill_date);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_items_category ON billing_items(category);
CREATE INDEX IF NOT EXISTS idx_billing_items_active ON billing_items(is_active);

-- Pharmacy indexes
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(is_active);
CREATE INDEX IF NOT EXISTS idx_pharmacy_stock_medication ON pharmacy_stock(medication_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_stock_quantity ON pharmacy_stock(quantity);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_types_updated_at BEFORE UPDATE ON test_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON test_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacy_stock_updated_at BEFORE UPDATE ON pharmacy_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_items_updated_at BEFORE UPDATE ON billing_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate bill numbers
CREATE OR REPLACE FUNCTION generate_bill_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bill_number := 'BILL-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEW.bill_id::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate bill numbers
CREATE TRIGGER trigger_generate_bill_number
    BEFORE INSERT ON bills
    FOR EACH ROW
    EXECUTE FUNCTION generate_bill_number();

-- Create a function to update bill totals
CREATE OR REPLACE FUNCTION update_bill_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bills 
    SET 
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM bill_items 
            WHERE bill_id = NEW.bill_id
        ),
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM bill_items 
            WHERE bill_id = NEW.bill_id
        ) + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE bill_id = NEW.bill_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update bill totals when items are added/modified
CREATE TRIGGER trigger_update_bill_total
    AFTER INSERT OR UPDATE OR DELETE ON bill_items
    FOR EACH ROW
    EXECUTE FUNCTION update_bill_total();

-- Create a function to check payment status
CREATE OR REPLACE FUNCTION check_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    total_paid DECIMAL(10,2);
    bill_total DECIMAL(10,2);
BEGIN
    -- Get total paid amount
    SELECT COALESCE(SUM(payment_amount), 0) INTO total_paid
    FROM payments 
    WHERE bill_id = NEW.bill_id AND status = 'completed';
    
    -- Get bill total
    SELECT total_amount INTO bill_total
    FROM bills 
    WHERE bill_id = NEW.bill_id;
    
    -- Update bill status based on payment
    IF total_paid >= bill_total THEN
        UPDATE bills SET status = 'paid' WHERE bill_id = NEW.bill_id;
    ELSIF total_paid > 0 THEN
        UPDATE bills SET status = 'partial' WHERE bill_id = NEW.bill_id;
    ELSE
        UPDATE bills SET status = 'pending' WHERE bill_id = NEW.bill_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update bill status when payments are made
CREATE TRIGGER trigger_check_payment_status
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION check_payment_status();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default departments
INSERT INTO departments (name, location) VALUES
('Emergency Medicine', 'Ground Floor'),
('Internal Medicine', 'First Floor'),
('Surgery', 'Second Floor'),
('Pediatrics', 'Third Floor'),
('Cardiology', 'Fourth Floor'),
('Radiology', 'Basement'),
('Laboratory', 'Basement'),
('Pharmacy', 'Ground Floor');

-- Insert default test types
INSERT INTO test_types (name, description, cost, category) VALUES
-- Lab Tests
('Complete Blood Count (CBC)', 'Blood cell count and analysis', 25.00, 'lab'),
('Blood Glucose Test', 'Diabetes screening test', 15.00, 'lab'),
('Cholesterol Panel', 'Lipid profile test', 35.00, 'lab'),
('Liver Function Test', 'Liver enzyme analysis', 40.00, 'lab'),
('Kidney Function Test', 'Creatinine and BUN test', 30.00, 'lab'),
('Urinalysis', 'Urine analysis', 20.00, 'lab'),
('Pregnancy Test', 'HCG pregnancy test', 18.00, 'lab'),
('HIV Test', 'HIV screening test', 45.00, 'lab'),
('COVID-19 PCR Test', 'Coronavirus PCR test', 60.00, 'lab'),

-- Imaging Tests
('X-Ray Chest', 'Chest X-ray examination', 80.00, 'imaging'),
('X-Ray Limb', 'Limb X-ray examination', 60.00, 'imaging'),
('ECG', 'Electrocardiogram', 75.00, 'imaging'),
('Ultrasound Abdomen', 'Abdominal ultrasound', 120.00, 'imaging'),
('CT Scan Head', 'Head CT scan', 300.00, 'imaging'),
('CT Scan Chest', 'Chest CT scan', 350.00, 'imaging'),
('MRI Brain', 'Brain MRI scan', 500.00, 'imaging'),
('MRI Spine', 'Spine MRI scan', 600.00, 'imaging'),
('Mammogram', 'Breast cancer screening', 150.00, 'imaging'),
('Bone Density Test', 'Osteoporosis screening', 200.00, 'imaging');

-- Insert default billing items
INSERT INTO billing_items (name, description, category, price) VALUES
-- Consultations
('General Consultation', 'Basic doctor consultation', 'consultation', 50.00),
('Specialist Consultation', 'Specialist doctor consultation', 'consultation', 100.00),
('Emergency Consultation', 'Emergency room consultation', 'consultation', 150.00),
('Follow-up Consultation', 'Follow-up appointment', 'consultation', 30.00),

-- Common Medications
('Paracetamol 500mg', 'Pain relief medication', 'medication', 5.00),
('Ibuprofen 400mg', 'Anti-inflammatory pain relief', 'medication', 6.00),
('Amoxicillin 500mg', 'Antibiotic medication', 'medication', 12.00),
('Omeprazole 20mg', 'Acid reflux medication', 'medication', 15.00),
('Metformin 500mg', 'Diabetes medication', 'medication', 8.00),
('Amlodipine 5mg', 'Blood pressure medication', 'medication', 10.00),
('Cetirizine 10mg', 'Allergy medication', 'medication', 7.00),
('Vitamin D3 1000IU', 'Vitamin supplement', 'medication', 9.00),
('Iron Supplement', 'Iron deficiency treatment', 'medication', 11.00),
('Calcium Carbonate', 'Calcium supplement', 'medication', 8.00),

-- Procedures
('Suturing', 'Wound suturing procedure', 'procedure', 200.00),
('Minor Surgery', 'Minor surgical procedure', 'procedure', 500.00),
('Dental Cleaning', 'Professional dental cleaning', 'procedure', 80.00),
('Dental Filling', 'Dental cavity filling', 'procedure', 150.00),
('Physical Therapy Session', 'Physical therapy treatment', 'procedure', 75.00),
('Vaccination', 'Immunization shot', 'procedure', 25.00),
('Blood Draw', 'Blood collection procedure', 'procedure', 15.00),
('IV Therapy', 'Intravenous therapy', 'procedure', 100.00),
('Dressing Change', 'Wound dressing change', 'procedure', 30.00),
('Catheter Insertion', 'Urinary catheter procedure', 'procedure', 120.00),

-- Room Charges
('General Ward (Daily)', 'General ward daily charge', 'room', 100.00),
('Private Room (Daily)', 'Private room daily charge', 'room', 200.00),
('ICU (Daily)', 'Intensive care unit daily charge', 'room', 500.00),
('Emergency Room', 'Emergency room visit charge', 'room', 250.00),

-- Other Services
('Ambulance Service', 'Emergency ambulance transport', 'other', 300.00),
('Medical Certificate', 'Medical documentation', 'other', 20.00),
('Medical Report', 'Detailed medical report', 'other', 50.00),
('Prescription Refill', 'Prescription renewal service', 'other', 15.00);

-- Insert default medications
INSERT INTO medications (name, generic_name, dosage_form, strength, manufacturer, cost) VALUES
('Paracetamol', 'Acetaminophen', 'Tablet', '500mg', 'Generic Pharma', 5.00),
('Ibuprofen', 'Ibuprofen', 'Tablet', '400mg', 'Generic Pharma', 6.00),
('Amoxicillin', 'Amoxicillin', 'Capsule', '500mg', 'Antibiotic Co', 12.00),
('Omeprazole', 'Omeprazole', 'Capsule', '20mg', 'Gastro Med', 15.00),
('Metformin', 'Metformin', 'Tablet', '500mg', 'Diabetes Care', 8.00),
('Amlodipine', 'Amlodipine', 'Tablet', '5mg', 'Cardio Pharma', 10.00),
('Cetirizine', 'Cetirizine', 'Tablet', '10mg', 'Allergy Relief', 7.00),
('Vitamin D3', 'Cholecalciferol', 'Tablet', '1000IU', 'Vitamin Plus', 9.00),
('Iron Supplement', 'Ferrous Sulfate', 'Tablet', '325mg', 'Mineral Health', 11.00),
('Calcium Carbonate', 'Calcium Carbonate', 'Tablet', '500mg', 'Bone Health', 8.00);

-- Insert default procedures
INSERT INTO procedures (name, description, charge, duration_minutes) VALUES
('Suturing', 'Wound suturing procedure', 200.00, 30),
('Minor Surgery', 'Minor surgical procedure', 500.00, 120),
('Dental Cleaning', 'Professional dental cleaning', 80.00, 45),
('Dental Filling', 'Dental cavity filling', 150.00, 60),
('Physical Therapy Session', 'Physical therapy treatment', 75.00, 60),
('Vaccination', 'Immunization shot', 25.00, 15),
('Blood Draw', 'Blood collection procedure', 15.00, 10),
('IV Therapy', 'Intravenous therapy', 100.00, 90),
('Dressing Change', 'Wound dressing change', 30.00, 20),
('Catheter Insertion', 'Urinary catheter procedure', 120.00, 45);

-- Insert initial pharmacy stock
INSERT INTO pharmacy_stock (medication_id, quantity, reorder_level, expiry_date, batch_number, supplier) VALUES
(1, 100, 20, '2024-12-31', 'BATCH001', 'Generic Pharma'),
(2, 150, 30, '2024-12-31', 'BATCH002', 'Generic Pharma'),
(3, 50, 10, '2024-06-30', 'BATCH003', 'Antibiotic Co'),
(4, 75, 15, '2024-12-31', 'BATCH004', 'Gastro Med'),
(5, 200, 40, '2024-12-31', 'BATCH005', 'Diabetes Care'),
(6, 80, 15, '2024-12-31', 'BATCH006', 'Cardio Pharma'),
(7, 120, 25, '2024-12-31', 'BATCH007', 'Allergy Relief'),
(8, 300, 50, '2024-12-31', 'BATCH008', 'Vitamin Plus'),
(9, 60, 10, '2024-12-31', 'BATCH009', 'Mineral Health'),
(10, 90, 20, '2024-12-31', 'BATCH010', 'Bone Health');

COMMIT; 