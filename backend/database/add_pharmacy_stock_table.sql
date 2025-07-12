CREATE TABLE IF NOT EXISTS pharmacy_stock (
    drug_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(20),
    last_restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pharmacy_stock_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    drug_id INT,
    quantity_added INT,
    restocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES pharmacy_stock(drug_id)
);

INSERT INTO pharmacy_stock (name, description, quantity, unit) VALUES
('Clarithromycin', 'Antibiotic for respiratory infections', 100, 'tablets'),
('Paracetamol', 'Pain reliever and fever reducer', 200, 'tablets'),
('Amoxicillin', 'Broad-spectrum antibiotic', 150, 'capsules'),
('Ibuprofen', 'Nonsteroidal anti-inflammatory drug', 120, 'tablets'),
('Ciprofloxacin', 'Antibiotic for bacterial infections', 80, 'tablets'),
('Metformin', 'Oral diabetes medicine', 90, 'tablets'),
('Amlodipine', 'Calcium channel blocker for hypertension', 60, 'tablets'); 