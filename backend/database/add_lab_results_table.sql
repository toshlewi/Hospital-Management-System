-- Create lab_results table for storing uploaded lab result files
CREATE TABLE IF NOT EXISTS lab_results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    patient_id INT,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES test_orders(order_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
); 