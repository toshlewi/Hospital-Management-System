-- Add missing columns to prescriptions table
-- This script adds the columns that the frontend expects but are missing from the schema

-- Add duration column for prescription duration
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS duration VARCHAR(50);

-- Add frequency column for prescription frequency
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS frequency VARCHAR(50);

-- Add dispensed_at column for pharmacy dispensing
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS dispensed_at TIMESTAMP;

-- Add comments to document the new columns
COMMENT ON COLUMN prescriptions.duration IS 'Duration of the prescription (e.g., "7 days", "2 weeks")';
COMMENT ON COLUMN prescriptions.frequency IS 'Frequency of medication (e.g., "twice daily", "once daily")';
COMMENT ON COLUMN prescriptions.dispensed_at IS 'Timestamp when the prescription was dispensed by pharmacy';

-- Update the database schema cache by running a simple query
SELECT 1 FROM prescriptions LIMIT 1; 