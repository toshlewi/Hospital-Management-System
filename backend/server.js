require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dbService = require('./services/database.js');

// Memory management
const v8 = require('v8');
const os = require('os');

// Set memory limits
const maxHeapSize = 512; // 512MB max heap
v8.setFlagsFromString(`--max-old-space-size=${maxHeapSize}`);

// Memory monitoring
function logMemoryUsage() {
  const memUsage = process.memoryUsage();
  const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
  const external = Math.round(memUsage.external / 1024 / 1024);
  
  console.log(`📊 Memory Usage: Heap ${heapUsed}MB/${heapTotal}MB, External: ${external}MB`);
  
  // Force garbage collection if memory usage is high
  if (heapUsed > maxHeapSize * 0.8) {
    console.log('🧹 High memory usage detected, forcing garbage collection...');
    if (global.gc) {
      global.gc();
    }
  }
}

// Log memory usage every 5 minutes
setInterval(logMemoryUsage, 5 * 60 * 1000);

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5000',
  'https://hospital-frontend-5na8.onrender.com', // deployed frontend
  'https://hospital-backend-771y.onrender.com', // deployed backend (for service-to-service calls)
  'https://hospital-ai-service.onrender.com'    // deployed AI service (if backend calls AI directly)
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Limit request body size to prevent memory issues
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

console.log('CORS middleware configured.');

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

// Health check endpoint
app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
  
  res.json({ 
    status: 'healthy',
    message: 'Hospital Management System Backend is running',
    timestamp: new Date().toISOString(),
    memory: {
      heapUsed: `${heapUsed}MB`,
      heapTotal: `${heapTotal}MB`,
      maxHeap: `${maxHeapSize}MB`
    },
    services: {
      database: 'connected',
      ai_service: process.env.AI_SERVICE_URL || 'http://localhost:8000'
    }
  });
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

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Set port and start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}.`);
  console.log(`📊 Memory limit set to ${maxHeapSize}MB`);
  logMemoryUsage();
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
}); 