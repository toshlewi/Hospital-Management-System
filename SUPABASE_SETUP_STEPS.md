# Supabase Setup Steps for Your Hospital Management System

## 🎯 Your Supabase Project Details
- **Project URL**: `https://cmcaobehivmrgyugwbxz.supabase.co`
- **Project Name**: Hospital Management System
- **Organization**: toshlewi Org

## 📋 Step-by-Step Setup Guide

### Step 1: Get Your API Keys

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account
   - Select your "Hospital Management System" project

2. **Navigate to API Settings**
   - Click on "Settings" in the left sidebar
   - Click on "API" in the settings menu

3. **Copy Your API Keys**
   - **Project URL**: `https://cmcaobehivmrgyugwbxz.supabase.co` (already provided)
   - **Anon Key**: Copy the "anon public" key
   - **Service Role Key**: Copy the "service_role" key (keep this secret!)

### Step 2: Create Environment File

1. **Create a `.env` file** in your project root:
   ```bash
   # In your project directory
   touch .env
   ```

2. **Add your Supabase credentials** to the `.env` file:
   ```bash
   # Supabase Configuration
   SUPABASE_URL=https://cmcaobehivmrgyugwbxz.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   # Application Configuration
   NODE_ENV=development
   PORT=3001
   
   # Security
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

### Step 3: Set Up Database Schema

1. **Go to SQL Editor**
   - In your Supabase dashboard, click "SQL Editor" in the left sidebar

2. **Create New Query**
   - Click "New query" button

3. **Run the Schema Script**
   - Copy the entire contents of `supabase-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see all these tables created:
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

### Step 4: Test the Connection

1. **Run the setup script**:
   ```bash
   npm run setup-db
   ```

2. **Expected output**:
   ```
   🏥 Hospital Management System - Database Setup
   ==============================================
   
   🔌 Testing database connection...
   ✅ Successfully connected to Supabase!
   
   📋 Checking database tables...
   ✅ Table 'patients' exists
   ✅ Table 'doctors' exists
   ✅ Table 'departments' exists
   ...
   
   📝 Creating sample data...
   ✅ Sample doctor created
   ✅ Sample patient created
   
   🎉 Database setup complete!
   ```

### Step 5: Start Your Application

1. **Start the server**:
   ```bash
   npm run server
   ```

2. **Expected output**:
   ```
   ✅ Database connection established successfully
   🚀 Server is running on port 3001.
   📊 Database: Supabase (Cloud)
   ```

3. **Test API endpoints**:
   ```bash
   # Test getting all patients
   curl http://localhost:3001/api/patients
   
   # Test creating a patient
   curl -X POST http://localhost:3001/api/patients \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "Test",
       "last_name": "Patient",
       "email": "test@example.com",
       "contact_number": "+254700000000"
     }'
   ```

## 🔧 Troubleshooting

### If you get "Supabase credentials not found":
- Make sure your `.env` file exists in the project root
- Verify the API keys are copied correctly
- Check that there are no extra spaces in the `.env` file

### If you get "Connection failed":
- Verify your Supabase URL is correct
- Check that your API keys are valid
- Ensure your IP is not blocked by Supabase

### If tables don't exist:
- Go back to Step 3 and run the schema script again
- Check the SQL Editor for any error messages
- Verify you're in the correct project

### If the setup script fails:
- Check the error message for specific details
- Verify all environment variables are set
- Try running the script again

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ `npm run setup-db` shows all tables exist
2. ✅ `npm run server` shows "Database: Supabase (Cloud)"
3. ✅ API endpoints return data instead of errors
4. ✅ You can see data in your Supabase Table Editor

## 🔒 Security Notes

- **Never commit your `.env` file** to version control
- **Keep your service role key secret** - it bypasses RLS
- **Use the anon key** for client-side applications
- **Enable RLS policies** for production use

## 📞 Need Help?

If you encounter any issues:
1. Check the error messages carefully
2. Verify your Supabase project settings
3. Review the `MIGRATION_GUIDE.md` for more details
4. Check the Supabase documentation

Your Hospital Management System is now connected to a secure, scalable cloud database! 🚀 