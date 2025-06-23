const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dbConfig = require('./config/db.config.js');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create MySQL connection pool
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  port: dbConfig.PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the database.');
    console.log('Database config:', {
      host: dbConfig.HOST,
      user: dbConfig.USER,
      database: dbConfig.DB,
      port: dbConfig.PORT
    });
    
    // Test query to check if patients table exists
    return connection.query('SHOW TABLES LIKE "patients"')
      .then(([rows]) => {
        if (rows.length === 0) {
          console.error('Patients table does not exist! Creating it now...');
          // Create patients table
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS patients (
              patient_id INT PRIMARY KEY AUTO_INCREMENT,
              first_name VARCHAR(50) NOT NULL,
              last_name VARCHAR(50) NOT NULL,
              date_of_birth DATE,
              gender ENUM('male', 'female', 'other'),
              blood_type VARCHAR(5),
              contact_number VARCHAR(20),
              email VARCHAR(100),
              address TEXT,
              emergency_contact VARCHAR(100),
              insurance_info TEXT,
              status ENUM('active', 'inactive', 'admitted', 'discharged') DEFAULT 'active',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`;
          return connection.query(createTableSQL);
        } else {
          console.log('Patients table exists.');
        }
      })
      .then(() => {
        connection.release();
      });
  })
  .catch(err => {
    console.error('Database connection/setup error:', err);
    process.exit(1);
  });

// Routes
require('./routes/patient.routes')(app);

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Hospital Management System API.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'An error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Set port and start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
}); 