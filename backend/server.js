const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dbService = require('./services/database.js');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test database connection
dbService.testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Database connection established successfully');
      // Try to add missing columns
      dbService.ensurePrescriptionColumns().catch(err => {
        console.log('Note: Column setup skipped - using fallback approach');
      });
    } else {
      console.warn('⚠️ Database connection failed - running in demo mode');
    }
  })
  .catch(err => {
    console.warn('⚠️ Database connection error - running in demo mode:', err.message);
  });

// Routes
app.use('/api', require('./routes/patient.routes'));
app.use('/api/pharmacy', require('./routes/pharmacy.routes'));
app.use('/api/billing', require('./routes/billing.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

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

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await dbService.close();
  process.exit(0);
});

// Set port and start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}.`);
  console.log(`📊 Database: ${dbService.useSupabase ? 'Supabase (Cloud)' : 'PostgreSQL (Local)'}`);
}); 