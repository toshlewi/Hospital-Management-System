-- Add imaging-specific fields to test_orders table
ALTER TABLE test_orders 
ADD COLUMN IF NOT EXISTS body_part VARCHAR(100),
ADD COLUMN IF NOT EXISTS differential_diagnosis TEXT,
ADD COLUMN IF NOT EXISTS clinical_notes TEXT,
ADD COLUMN IF NOT EXISTS imaging_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'emergency')),
ADD COLUMN IF NOT EXISTS requesting_physician VARCHAR(100);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_test_orders_status ON test_orders(status);
CREATE INDEX IF NOT EXISTS idx_test_orders_ordered_at ON test_orders(ordered_at); 