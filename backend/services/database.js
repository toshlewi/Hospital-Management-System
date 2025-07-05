const { createClient } = require('@supabase/supabase-js');
const dbConfig = require('../config/db.config.js');

// Initialize Supabase client
const supabase = createClient(
  dbConfig.SUPABASE_URL,
  dbConfig.SUPABASE_SERVICE_ROLE_KEY
);

class DatabaseService {
  constructor() {
    this.supabase = supabase;
    this.useSupabase = !!dbConfig.SUPABASE_URL;
  }

  // Test database connection
  async testConnection() {
    try {
      if (this.useSupabase) {
        const { data, error } = await this.supabase
          .from('patients')
          .select('count')
          .limit(1);
        
        if (error) throw error;
        console.log('✅ Successfully connected to Supabase');
        return true;
      } else {
        throw new Error('Supabase configuration required');
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
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

  async close() {
    // No need to close Supabase connection
    console.log('Database service closed');
  }
}

module.exports = new DatabaseService(); 