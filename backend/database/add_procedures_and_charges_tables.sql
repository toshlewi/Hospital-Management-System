-- Add procedures table
CREATE TABLE IF NOT EXISTS procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    charge DECIMAL(10,2) NOT NULL
);

-- Add medications table
CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    charge DECIMAL(10,2) NOT NULL
);

-- Add patient_procedures table
CREATE TABLE IF NOT EXISTS patient_procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    procedure_id INT NOT NULL,
    date_performed DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'paid') DEFAULT 'pending',
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (procedure_id) REFERENCES procedures(id)
);

-- Add patient_medications table
CREATE TABLE IF NOT EXISTS patient_medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    medication_id INT NOT NULL,
    quantity INT NOT NULL,
    date_prescribed DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'paid') DEFAULT 'pending',
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (medication_id) REFERENCES medications(medication_id)
); 