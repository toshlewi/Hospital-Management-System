-- Pharmacy Tables for Hospital Management System
-- Run this in your Supabase SQL Editor

-- Pharmacy Stock table
CREATE TABLE IF NOT EXISTS pharmacy_stock (
    drug_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'units',
    price DECIMAL(10,2) DEFAULT 0.00,
    last_restocked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacy Stock Log table
CREATE TABLE IF NOT EXISTS pharmacy_stock_log (
    log_id SERIAL PRIMARY KEY,
    drug_id INTEGER NOT NULL,
    quantity_added INTEGER NOT NULL,
    quantity_removed INTEGER DEFAULT 0,
    reason VARCHAR(255),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES pharmacy_stock(drug_id) ON DELETE CASCADE
);

-- Add some sample pharmacy data
INSERT INTO pharmacy_stock (name, description, quantity, unit, price) VALUES 
('Paracetamol 500mg', 'Pain reliever and fever reducer', 1000, 'tablets', 5.00),
('Amoxicillin 250mg', 'Antibiotic for bacterial infections', 500, 'capsules', 15.00),
('Ibuprofen 400mg', 'Anti-inflammatory pain reliever', 800, 'tablets', 8.00),
('Omeprazole 20mg', 'Acid reflux medication', 300, 'capsules', 25.00),
('Metformin 500mg', 'Diabetes medication', 600, 'tablets', 12.00);

-- Add sample prescriptions if they don't exist
INSERT INTO prescriptions (patient_id, doctor_id, prescribed_date, medications, dosage, instructions, quantity, status) 
SELECT 
    p.patient_id,
    d.doctor_id,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'Paracetamol 500mg',
    '1 tablet every 6 hours',
    'Take with food for fever and pain relief',
    20,
    'active'
FROM patients p, doctors d 
WHERE p.first_name = 'Lewis' AND d.first_name = 'Dr. Jane'
LIMIT 1;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacy_stock_name ON pharmacy_stock(name);
CREATE INDEX IF NOT EXISTS idx_pharmacy_stock_quantity ON pharmacy_stock(quantity);
CREATE INDEX IF NOT EXISTS idx_pharmacy_stock_log_drug_id ON pharmacy_stock_log(drug_id);

-- Enable RLS on pharmacy tables
ALTER TABLE pharmacy_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_stock_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all authenticated users" ON pharmacy_stock FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON pharmacy_stock FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON pharmacy_stock FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all authenticated users" ON pharmacy_stock_log FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON pharmacy_stock_log FOR INSERT WITH CHECK (true);

-- Success message
SELECT 'Pharmacy tables created successfully!' as status; 