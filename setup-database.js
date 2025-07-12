#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🏥 Hospital Management System - Database Setup');
console.log('==============================================\n');

// Check if Supabase credentials are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Supabase credentials not found!');
  console.log('\nPlease set up your environment variables:');
  console.log('1. Create a .env file in your project root');
  console.log('2. Add your Supabase credentials:');
  console.log('   SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('\nSee env.example for more details.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    return true;
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n📋 Checking database tables...');
  
  const tables = [
    'patients', 'doctors', 'departments', 'appointments',
    'prescriptions', 'medical_notes', 'test_results',
    'admissions', 'rooms', 'procedures', 'medications'
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' not found or inaccessible`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error.message);
    }
  }
}

async function createSampleData() {
  console.log('\n📝 Creating sample data...');
  
  try {
    // Create a sample doctor
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .insert([{
        first_name: 'Dr. Jane',
        last_name: 'Smith',
        specialization: 'General Medicine',
        email: 'jane.smith@hospital.com',
        contact_number: '+254700000000',
        status: 'active'
      }])
      .select()
      .single();
    
    if (doctorError) {
      console.log('⚠️  Could not create sample doctor:', doctorError.message);
    } else {
      console.log('✅ Sample doctor created');
    }
    
    // Create a sample patient
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert([{
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-15',
        gender: 'male',
        blood_type: 'O+',
        contact_number: '+254711111111',
        email: 'john.doe@example.com',
        address: 'Nairobi, Kenya',
        emergency_contact: '+254722222222',
        status: 'active'
      }])
      .select()
      .single();
    
    if (patientError) {
      console.log('⚠️  Could not create sample patient:', patientError.message);
    } else {
      console.log('✅ Sample patient created');
    }
    
  } catch (error) {
    console.log('❌ Error creating sample data:', error.message);
  }
}

async function main() {
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n💡 To set up your database:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the schema from backend/database/schema.sql');
    console.log('4. Try this script again');
    process.exit(1);
  }
  
  await checkTables();
  await createSampleData();
  
  console.log('\n🎉 Database setup complete!');
  console.log('\nNext steps:');
  console.log('1. Start your server: npm start');
  console.log('2. Test your API endpoints');
  console.log('3. Check the MIGRATION_GUIDE.md for more details');
}

main().catch(console.error); 