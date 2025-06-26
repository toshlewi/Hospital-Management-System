-- If the column already exists and is wrong, run:
-- ALTER TABLE prescriptions DROP COLUMN quantity;
-- Then run:
ALTER TABLE prescriptions ADD COLUMN quantity INT NOT NULL; 