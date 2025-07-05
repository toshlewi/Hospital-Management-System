-- Billing System Schema for Hospital Management System
-- This includes pricing for tests, medications, consultations, and procedures

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

-- Insert default billing items with realistic pricing
INSERT INTO billing_items (name, description, category, price) VALUES
-- Consultations
('General Consultation', 'Basic doctor consultation', 'consultation', 50.00),
('Specialist Consultation', 'Specialist doctor consultation', 'consultation', 100.00),
('Emergency Consultation', 'Emergency room consultation', 'consultation', 150.00),
('Follow-up Consultation', 'Follow-up appointment', 'consultation', 30.00),

-- Lab Tests
('Complete Blood Count (CBC)', 'Blood cell count and analysis', 'lab_test', 25.00),
('Blood Glucose Test', 'Diabetes screening test', 'lab_test', 15.00),
('Cholesterol Panel', 'Lipid profile test', 'lab_test', 35.00),
('Liver Function Test', 'Liver enzyme analysis', 'lab_test', 40.00),
('Kidney Function Test', 'Creatinine and BUN test', 'lab_test', 30.00),
('Urinalysis', 'Urine analysis', 'lab_test', 20.00),
('Pregnancy Test', 'HCG pregnancy test', 'lab_test', 18.00),
('HIV Test', 'HIV screening test', 'lab_test', 45.00),
('COVID-19 PCR Test', 'Coronavirus PCR test', 'lab_test', 60.00),
('X-Ray Chest', 'Chest X-ray examination', 'lab_test', 80.00),
('ECG', 'Electrocardiogram', 'lab_test', 75.00),
('Ultrasound Abdomen', 'Abdominal ultrasound', 'lab_test', 120.00),

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

-- Imaging
('CT Scan Head', 'Head CT scan', 'imaging', 300.00),
('CT Scan Chest', 'Chest CT scan', 'imaging', 350.00),
('MRI Brain', 'Brain MRI scan', 'imaging', 500.00),
('MRI Spine', 'Spine MRI scan', 'imaging', 600.00),
('X-Ray Limb', 'Limb X-ray examination', 'imaging', 60.00),
('Mammogram', 'Breast cancer screening', 'imaging', 150.00),
('Bone Density Test', 'Osteoporosis screening', 'imaging', 200.00),

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

-- Create indexes for better performance
CREATE INDEX idx_bills_patient_id ON bills(patient_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_bill_date ON bills(bill_date);
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_payments_bill_id ON payments(bill_id);
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_billing_items_category ON billing_items(category);
CREATE INDEX idx_billing_items_active ON billing_items(is_active);

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