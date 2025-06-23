import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Patient API calls
export const patientAPI = {
  // Get all patients
  getAllPatients: async () => {
    try {
      const response = await api.get('/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get patient by ID
  getPatientById: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  // Create new patient
  createPatient: async (patientData) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  // Delete patient
  deletePatient: async (id) => {
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  // Get patient's medical history
  getPatientHistory: async (id) => {
    try {
      const response = await api.get(`/patients/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient history:', error);
      throw error;
    }
  },

  // Get patient's appointments
  getPatientAppointments: async (id) => {
    try {
      const response = await api.get(`/patients/${id}/appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  },

  // Get patient's test results
  getPatientTests: async (id) => {
    try {
      const response = await api.get(`/patients/${id}/tests`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient tests:', error);
      throw error;
    }
  },

  // Get patient's prescriptions
  getPatientPrescriptions: async (id) => {
    try {
      const response = await api.get(`/patients/${id}/prescriptions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      throw error;
    }
  },

  // Get medical notes
  getMedicalNotes: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/notes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical notes:', error);
      throw error;
    }
  },

  // Add medical note
  addMedicalNote: async (patientId, noteData) => {
    try {
      const response = await api.post(`/patients/${patientId}/notes`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error adding medical note:', error);
      throw error;
    }
  },

  // Get test orders
  getTestOrders: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/test-orders`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test orders:', error);
      throw error;
    }
  },

  // Add test order
  addTestOrder: async (patientId, orderData) => {
    try {
      const response = await api.post(`/patients/${patientId}/test-orders`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error adding test order:', error);
      throw error;
    }
  },

  // Get medications
  getMedications: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/medications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  },

  // Add medication
  addMedication: async (patientId, medData) => {
    try {
      const response = await api.post(`/patients/${patientId}/medications`, medData);
      return response.data;
    } catch (error) {
      console.error('Error prescribing medication:', error);
      throw error;
    }
  },

  // Get imaging
  getImaging: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/imaging`);
      return response.data;
    } catch (error) {
      console.error('Error fetching imaging:', error);
      throw error;
    }
  },

  // Add imaging
  addImaging: async (patientId, formData) => {
    try {
      const response = await api.post(`/patients/${patientId}/imaging`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading imaging:', error);
      throw error;
    }
  },

  // Update test order
  updateTestOrder: async (orderId, data) => {
    try {
      const response = await api.put(`/patients/test-orders/${orderId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating test order:', error);
      throw error;
    }
  },

  // Get all imaging test orders (for Imaging department)
  getAllImagingOrders: async () => {
    try {
      const response = await api.get('/test-orders?order_type=imaging');
      return response.data;
    } catch (error) {
      console.error('Error fetching imaging orders:', error);
      throw error;
    }
  },

  // Upload lab result file
  uploadLabResult: async (patientId, formData) => {
    try {
      const response = await api.post(`/patients/${patientId}/lab-results`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading lab result:', error);
      throw error;
    }
  }
};

// AI Diagnosis
export const aiAPI = {
  diagnose: async (data) => {
    try {
      const response = await api.post('/ai/diagnose', data);
      return response.data;
    } catch (error) {
      console.error('Error with AI diagnosis:', error);
      throw error;
    }
  }
};

export default api; 