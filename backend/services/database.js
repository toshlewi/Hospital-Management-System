const { createClient } = require('@supabase/supabase-js');
const dbConfig = require('../config/db.config.js');

// Initialize Supabase client with fallback
let supabase = null;
try {
  if (dbConfig.SUPABASE_URL && dbConfig.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      dbConfig.SUPABASE_URL,
      dbConfig.SUPABASE_SERVICE_ROLE_KEY
    );
  }
} catch (error) {
  console.warn('⚠️ Supabase configuration missing or invalid');
}

class DatabaseService {
  constructor() {
    this.supabase = supabase;
    this.useSupabase = !!(dbConfig.SUPABASE_URL && dbConfig.SUPABASE_SERVICE_ROLE_KEY);
  }

  // Ensure all required columns exist in prescriptions table (for Supabase)
  async ensurePrescriptionColumns() {
    try {
      if (this.useSupabase && this.supabase) {
        // Try to add the missing columns using Supabase's SQL execution
        const columnsToAdd = [
          'ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dispensed_at TIMESTAMP;',
          'ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS duration VARCHAR(50);',
          'ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS frequency VARCHAR(50);'
        ];
        
        for (const sql of columnsToAdd) {
          try {
            const { error } = await this.supabase.rpc('exec_sql', { sql });
            if (error) {
              console.log(`Note: Column may already exist or cannot be added via RPC: ${sql}`);
            } else {
              console.log(`✅ Column added to prescriptions table: ${sql}`);
            }
          } catch (columnError) {
            console.log(`Note: Column setup skipped: ${sql}`);
          }
        }
        
        // Try to refresh the schema cache by running a simple query
        try {
          await this.supabase.from('prescriptions').select('prescription_id').limit(1);
          console.log('✅ Prescriptions table schema cache refreshed');
        } catch (cacheError) {
          console.log('Note: Schema cache refresh skipped');
        }
      }
    } catch (error) {
      console.log('Note: Prescription columns setup skipped - will use fallback approach');
    }
  }

  // Test database connection
  async testConnection() {
    try {
      if (this.useSupabase && this.supabase) {
        const { data, error } = await this.supabase
          .from('patients')
          .select('count')
          .limit(1);
        
        if (error) throw error;
        console.log('✅ Successfully connected to Supabase');
        return true;
      } else {
        console.warn('⚠️ Supabase not configured - running in demo mode');
        console.log('📝 To enable full functionality, please configure Supabase environment variables');
        return true; // Return true to allow the server to start
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      console.warn('⚠️ Running in demo mode without database connection');
      return true; // Return true to allow the server to start
    }
  }

  // Generic query method - simplified for Supabase
  async query(sql, params = []) {
    try {
      // For complex queries, we'll use Supabase's built-in features
      // This is a fallback for simple queries
      console.log('⚠️ Complex SQL queries not fully supported with Supabase REST API');
      console.log('SQL:', sql);
      console.log('Params:', params);
      
      // For now, return empty array to prevent errors
      return [];
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  // Patient operations with medical notes and prescriptions
  async getPatientWithDetails(patientId) {
    try {
      // Get patient basic info
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId)
        .single();
      
      if (patientError) throw patientError;

      // Get medical notes
      const { data: medicalNotes, error: notesError } = await this.supabase
        .from('medical_notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Get prescriptions
      const { data: prescriptions, error: prescriptionsError } = await this.supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('prescribed_date', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;

      // Get patient's bills and payment status
      const { data: bills, error: billsError } = await this.supabase
        .from('bills')
        .select(`
          *,
          bill_items(*)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (billsError) throw billsError;

      // Calculate payment status
      const consultationBills = bills.filter(bill => 
        bill.bill_items.some(item => 
          item.item_name && item.item_name.toLowerCase().includes('consultation')
        )
      );

      const hasPaidConsultation = consultationBills.some(bill => bill.status === 'paid');

      return {
        ...patient,
        medical_notes: medicalNotes || [],
        prescriptions: prescriptions || [],
        bills: bills || [],
        has_paid_consultation: hasPaidConsultation,
        total_bills: bills.length,
        pending_amount: bills.reduce((sum, bill) => 
          bill.status !== 'paid' ? sum + parseFloat(bill.total_amount || 0) : sum, 0
        )
      };
    } catch (error) {
      console.error('Error fetching patient with details:', error);
      throw error;
    }
  }

  // Get all patients with basic info
  async getPatientsWithBasicInfo() {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select(`
          patient_id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          contact_number,
          email,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching patients with basic info:', error);
      throw error;
    }
  }

  // Get medical notes for a patient
  async getMedicalNotes(patientId) {
    try {
      const { data, error } = await this.supabase
        .from('medical_notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching medical notes:', error);
      throw error;
    }
  }

  // Get prescriptions for a patient
  async getPrescriptions(patientId) {
    try {
      const { data, error } = await this.supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('prescribed_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  }

  // Get patient's billing status
  async getPatientBillingStatus(patientId) {
    try {
      const { data: bills, error } = await this.supabase
        .from('bills')
        .select(`
          *,
          bill_items(*)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const consultationBills = bills.filter(bill => 
        bill.bill_items.some(item => 
          item.item_name && item.item_name.toLowerCase().includes('consultation')
        )
      );

      return {
        total_bills: bills.length,
        pending_amount: bills.reduce((sum, bill) => 
          bill.status !== 'paid' ? sum + parseFloat(bill.total_amount || 0) : sum, 0
        ),
        has_paid_consultation: consultationBills.some(bill => bill.status === 'paid'),
        consultation_bills: consultationBills,
        recent_bills: bills.slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching patient billing status:', error);
      throw error;
    }
  }

  // Patient operations
  async getPatients() {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatientById(patientId) {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async createPatient(patientData) {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(patientId, updateData) {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .update(updateData)
        .eq('patient_id', patientId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(patientId) {
    try {
      const { error } = await this.supabase
        .from('patients')
        .delete()
        .eq('patient_id', patientId);
      
      if (error) throw error;
      return { message: 'Patient deleted successfully' };
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  // Appointment operations
  async getAppointments() {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          *,
          patients(first_name, last_name, patient_id)
        `)
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  // Prescription operations
  async getPrescriptions() {
    try {
      const { data, error } = await this.supabase
        .from('prescriptions')
        .select(`
          *,
          patients(first_name, last_name, patient_id)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  }

  // Pharmacy operations
  async getPharmacyStock() {
    try {
      const { data, error } = await this.supabase
        .from('pharmacy_stock')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pharmacy stock:', error);
      throw error;
    }
  }

  async addPharmacyDrug(drugData) {
    try {
      const { data, error } = await this.supabase
        .from('pharmacy_stock')
        .insert([drugData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding pharmacy drug:', error);
      throw error;
    }
  }

  async getActivePrescriptions() {
    try {
      const { data, error } = await this.supabase
        .from('prescriptions')
        .select(`
          *,
          patients(first_name, last_name, patient_id)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching active prescriptions:', error);
      throw error;
    }
  }

  // Billing operations
  async getBillingItems() {
    try {
      const { data, error } = await this.supabase
        .from('billing_items')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching billing items:', error);
      throw error;
    }
  }

  async createBill(billData) {
    try {
      const { data, error } = await this.supabase
        .from('bills')
        .insert([billData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
  }

  async getBills() {
    try {
      const { data, error } = await this.supabase
        .from('bills')
        .select(`
          *,
          patients(first_name, last_name, patient_id)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }

  async getBillById(billId) {
    try {
      const { data, error } = await this.supabase
        .from('bills')
        .select(`
          *,
          patients(first_name, last_name, patient_id),
          bill_items(*)
        `)
        .eq('bill_id', billId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  }

  async updateBillStatus(billId, status) {
    try {
      const { data, error } = await this.supabase
        .from('bills')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('bill_id', billId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating bill status:', error);
      throw error;
    }
  }

  async createBillItem(billItemData) {
    try {
      const { data, error } = await this.supabase
        .from('bill_items')
        .insert([billItemData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating bill item:', error);
      throw error;
    }
  }

  async getBillItemsByBillId(billId) {
    try {
      const { data, error } = await this.supabase
        .from('bill_items')
        .select(`
          *,
          billing_items(name, category, price)
        `)
        .eq('bill_id', billId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bill items:', error);
      throw error;
    }
  }

  // Payment operations
  async createPayment(paymentData) {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPayments() {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select(`
          *,
          bills(bill_id, total_amount),
          patients(first_name, last_name, patient_id)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Lab test operations
  async getLabTests() {
    try {
      const { data, error } = await this.supabase
        .from('lab_tests')
        .select('*')
        .order('test_name', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      throw error;
    }
  }

  // Procedure operations
  async getProcedures() {
    try {
      const { data, error } = await this.supabase
        .from('procedures')
        .select('*')
        .order('procedure_name', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching procedures:', error);
      throw error;
    }
  }

  // Add medical note
  async addMedicalNote(patientId, noteData) {
    try {
      const { data, error } = await this.supabase
        .from('medical_notes')
        .insert([{
          patient_id: patientId,
          note_text: noteData.note_text || noteData.notes,
          diagnosis: noteData.diagnosis,
          advice: noteData.advice,
          doctor_id: noteData.doctor_id || 1,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding medical note:', error);
      throw error;
    }
  }

  // Create prescription
  async createPrescription(patientId, prescriptionData) {
    try {
      const prescriptionPayload = {
        patient_id: patientId,
        doctor_id: prescriptionData.doctor_id || 1,
        medications: prescriptionData.medication_name || prescriptionData.medications,
        dosage: prescriptionData.dosage,
        instructions: prescriptionData.instructions,
        quantity: prescriptionData.quantity || 1,
        prescribed_date: new Date().toISOString(),
        status: 'active'
      };

      // Only add optional columns if they exist in the data and are not empty
      if (prescriptionData.duration && prescriptionData.duration.trim()) {
        prescriptionPayload.duration = prescriptionData.duration;
      }
      if (prescriptionData.frequency && prescriptionData.frequency.trim()) {
        prescriptionPayload.frequency = prescriptionData.frequency;
      }

      console.log('Creating prescription with payload:', prescriptionPayload);

      const { data, error } = await this.supabase
        .from('prescriptions')
        .insert([prescriptionPayload])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating prescription:', error);
        
        // If the error is about missing columns, try without the optional columns
        if (error.message && error.message.includes('duration') || error.message.includes('frequency')) {
          console.log('Retrying without optional columns...');
          const fallbackPayload = {
            patient_id: patientId,
            doctor_id: prescriptionData.doctor_id || 1,
            medications: prescriptionData.medication_name || prescriptionData.medications,
            dosage: prescriptionData.dosage,
            instructions: prescriptionData.instructions,
            quantity: prescriptionData.quantity || 1,
            prescribed_date: new Date().toISOString(),
            status: 'active'
          };
          
          const { data: fallbackData, error: fallbackError } = await this.supabase
            .from('prescriptions')
            .insert([fallbackPayload])
            .select()
            .single();
          
          if (fallbackError) throw fallbackError;
          return fallbackData;
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  // Get test orders
  async getTestOrders(patientId) {
    try {
      const { data, error } = await this.supabase
        .from('test_orders')
        .select(`
          *,
          test_types(name, description, cost)
        `)
        .eq('patient_id', patientId)
        .order('ordered_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching test orders:', error);
      throw error;
    }
  }

  // Add test order
  async addTestOrder(patientId, orderData) {
    try {
      // Handle different types of orders
      let testTypeId = orderData.test_type_id;
      
      // If test_type is provided as string, try to find or create the test type
      if (orderData.test_type && !testTypeId) {
        // For imaging orders, create a test type if it doesn't exist
        if (orderData.test_type === 'imaging') {
          // Try to find existing imaging test type
          const { data: existingType } = await this.supabase
            .from('test_types')
            .select('test_type_id')
            .eq('name', orderData.imaging_type || 'Imaging')
            .single();
          
          if (existingType) {
            testTypeId = existingType.test_type_id;
          } else {
            // Create imaging test type
            const { data: newType } = await this.supabase
              .from('test_types')
              .insert([{
                name: orderData.imaging_type || 'Imaging',
                description: 'Medical imaging procedures',
                cost: 100.00
              }])
              .select('test_type_id')
              .single();
            
            testTypeId = newType.test_type_id;
          }
        } else {
          // For lab tests, create a test type if it doesn't exist
          const { data: existingType } = await this.supabase
            .from('test_types')
            .select('test_type_id')
            .eq('name', orderData.test_name || 'Lab Test')
            .single();
          
          if (existingType) {
            testTypeId = existingType.test_type_id;
          } else {
            // Create lab test type
            const { data: newType } = await this.supabase
              .from('test_types')
              .insert([{
                name: orderData.test_name || 'Lab Test',
                description: orderData.clinical_notes || 'Laboratory test',
                cost: 50.00
              }])
              .select('test_type_id')
              .single();
            
            testTypeId = newType.test_type_id;
          }
        }
      }

      const { data, error } = await this.supabase
        .from('test_orders')
        .insert([{
          patient_id: patientId,
          doctor_id: orderData.doctor_id || 1,
          test_type_id: testTypeId,
          status: 'ordered',
          ordered_at: new Date().toISOString(),
          // Imaging-specific fields
          body_part: orderData.body_part,
          differential_diagnosis: orderData.differential_diagnosis,
          clinical_notes: orderData.clinical_notes,
          imaging_type: orderData.imaging_type,
          priority: orderData.priority || 'routine',
          requesting_physician: orderData.requesting_physician
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding test order:', error);
      throw error;
    }
  }

  // Get imaging
  async getImaging(patientId) {
    try {
      const { data, error } = await this.supabase
        .from('test_orders')
        .select(`
          *,
          test_types(name, description, cost)
        `)
        .eq('patient_id', patientId)
        .eq('test_types.name', 'imaging')
        .order('ordered_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching imaging:', error);
      throw error;
    }
  }

  // Update test order
  async updateTestOrder(orderId, updateData) {
    try {
      const { data, error } = await this.supabase
        .from('test_orders')
        .update({
          status: updateData.status,
          result: updateData.result,
          completed_at: updateData.status === 'completed' ? new Date().toISOString() : null
        })
        .eq('order_id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating test order:', error);
      throw error;
    }
  }

  // Update prescription
  async updatePrescription(prescriptionId, updateData) {
    try {
      const { data, error } = await this.supabase
        .from('prescriptions')
        .update({
          status: updateData.status,
          medications: updateData.medications,
          dosage: updateData.dosage,
          instructions: updateData.instructions,
          quantity: updateData.quantity
        })
        .eq('prescription_id', prescriptionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  }

  // Add lab result
  async addLabResult(patientId, resultData) {
    try {
      const { data, error } = await this.supabase
        .from('test_results')
        .insert([{
          patient_id: patientId,
          test_type_id: resultData.test_type_id || 1,
          doctor_id: resultData.doctor_id || 1,
          test_date: new Date().toISOString(),
          results: resultData.description,
          notes: resultData.file_path,
          status: 'completed'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding lab result:', error);
      throw error;
    }
  }

  // Add imaging
  async addImaging(patientId, imagingData) {
    try {
      const { data, error } = await this.supabase
        .from('imaging')
        .insert([{
          patient_id: patientId,
          image_type: imagingData.image_type,
          image_url: imagingData.image_url,
          notes: imagingData.notes,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding imaging:', error);
      throw error;
    }
  }

  async close() {
    // No need to close Supabase connection
    console.log('Database service closed');
  }
}

module.exports = new DatabaseService(); 