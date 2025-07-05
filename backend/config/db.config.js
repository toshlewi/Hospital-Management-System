require('dotenv').config();

module.exports = {
  // Supabase PostgreSQL Configuration
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Direct PostgreSQL connection (fallback)
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "postgres",
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME || "hospital_management",
  PORT: process.env.DB_PORT || "5432",
  dialect: "postgres",
  
  // Connection pool settings
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // SSL configuration for cloud database
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
}; 