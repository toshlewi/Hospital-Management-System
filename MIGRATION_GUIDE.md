# Database Migration Guide: MySQL to Supabase PostgreSQL

## Overview
This guide will help you migrate your Hospital Management System from MySQL to Supabase (PostgreSQL) for enhanced security and cloud capabilities.

## Why Supabase?
- **Security**: Built-in Row Level Security (RLS), encryption at rest, and HIPAA compliance
- **Scalability**: Automatic scaling and backups
- **Real-time**: Built-in real-time subscriptions
- **Cost-effective**: Generous free tier, pay-as-you-grow pricing
- **Developer-friendly**: Excellent dashboard and API

## Step 1: Set Up Supabase

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 1.2 Get Your Credentials
1. Go to your project dashboard
2. Navigate to Settings → API
3. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

### 1.3 Configure Environment Variables
Create a `.env` file in your project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NODE_ENV=production
PORT=3001
```

## Step 2: Set Up Database Schema

### 2.1 Run the PostgreSQL Schema
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `backend/database/schema.sql`
4. Execute the script

### 2.2 Verify Tables Created
Check that all tables were created successfully:
- departments
- doctors
- patients
- medical_history
- rooms
- admissions
- test_types
- test_results
- appointments
- prescriptions
- medical_notes
- test_orders
- procedures
- medications
- patient_procedures
- patient_medications
- imaging
- ai_suggestions

## Step 3: Install Dependencies

### 3.1 Update Package Dependencies
```bash
npm install @supabase/supabase-js pg
npm uninstall mysql2
```

### 3.2 Verify Installation
The following packages should now be in your `package.json`:
- `@supabase/supabase-js`: Supabase client
- `pg`: PostgreSQL driver (fallback)

## Step 4: Configure Row Level Security (RLS)

### 4.1 Enable RLS on Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own data" ON patients
    FOR SELECT USING (auth.uid()::text = created_by::text);

CREATE POLICY "Doctors can view all patients" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE doctors.doctor_id = auth.uid()::integer
        )
    );

-- Add more policies as needed for your use case
```

## Step 5: Test the Migration

### 5.1 Start Your Server
```bash
npm start
```

### 5.2 Verify Connection
Check your server logs for:
```
✅ Database connection established successfully
📊 Database: Supabase (Cloud)
```

### 5.3 Test API Endpoints
Test your patient endpoints:
```bash
# Get all patients
curl http://localhost:3001/api/patients

# Create a test patient
curl -X POST http://localhost:3001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Patient",
    "email": "test@example.com"
  }'
```

## Step 6: Data Migration (If You Have Existing Data)

### 6.1 Export MySQL Data
```bash
mysqldump -u root -p hospital_management > backup.sql
```

### 6.2 Convert and Import
1. Use a tool like [pgloader](https://pgloader.io/) to convert MySQL to PostgreSQL
2. Or manually convert the data using scripts

### 6.3 Verify Data Integrity
Check that all data was migrated correctly:
- Patient records
- Medical history
- Appointments
- Prescriptions

## Step 7: Security Enhancements

### 7.1 Enable SSL
Your Supabase connection is already SSL-encrypted by default.

### 7.2 Set Up Authentication (Optional)
```javascript
// In your frontend
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

### 7.3 Environment Variables Security
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate keys regularly

## Step 8: Performance Optimization

### 8.1 Database Indexes
The schema already includes performance indexes:
- `idx_patients_email`
- `idx_patients_status`
- `idx_appointments_date`
- `idx_appointments_status`

### 8.2 Connection Pooling
Supabase handles connection pooling automatically.

### 8.3 Query Optimization
Use the Supabase client's built-in optimizations:
```javascript
// Efficient queries with Supabase
const { data, error } = await supabase
  .from('patients')
  .select('patient_id, first_name, last_name, email')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10)
```

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify your Supabase URL and keys
   - Check your internet connection
   - Ensure your IP is not blocked

2. **Permission Errors**
   - Check RLS policies
   - Verify user authentication
   - Check table permissions

3. **Data Type Issues**
   - MySQL ENUM → PostgreSQL CHECK constraints
   - MySQL DATETIME → PostgreSQL TIMESTAMP
   - MySQL AUTO_INCREMENT → PostgreSQL SERIAL

### Getting Help
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

## Benefits Achieved

✅ **Enhanced Security**: Row Level Security, encryption at rest  
✅ **Cloud Scalability**: Automatic backups, scaling  
✅ **Real-time Capabilities**: Built-in subscriptions  
✅ **HIPAA Compliance**: Available for healthcare data  
✅ **Cost Efficiency**: Generous free tier  
✅ **Developer Experience**: Excellent dashboard and tools  

## Next Steps

1. **Monitor Performance**: Use Supabase dashboard to monitor queries
2. **Set Up Backups**: Configure automated backups
3. **Implement Authentication**: Add user authentication if needed
4. **Add Real-time Features**: Implement real-time updates
5. **Scale as Needed**: Upgrade plan when you reach limits

Your Hospital Management System is now running on a secure, scalable cloud database! 🎉 