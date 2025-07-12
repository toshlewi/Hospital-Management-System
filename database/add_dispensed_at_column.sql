-- Add dispensed_at column to prescriptions table
-- This column is needed for pharmacy dispensing functionality

ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS dispensed_at TIMESTAMP;

-- Add an index for better performance when querying dispensed prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_dispensed_at ON prescriptions(dispensed_at);

-- Update existing completed prescriptions to have a dispensed_at timestamp
UPDATE prescriptions 
SET dispensed_at = updated_at 
WHERE status = 'completed' AND dispensed_at IS NULL; 