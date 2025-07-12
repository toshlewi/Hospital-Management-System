import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export { api };

// Patient API calls
export const patientAPI = {
  // Get all patients
  getAllPatients: () => api.get('/patients').then(res => res.data),

  // Get patient by ID
  getPatientById: (id) => api.get(`/patients/${id}`).then(res => res.data),

  // Get patient's billing status
  getPatientBillingStatus: (id) => api.get(`/patients/${id}/billing`).then(res => res.data),

  // Get medical notes
  getMedicalNotes: (patientId) => api.get(`/patients/${patientId}/notes`).then(res => res.data),

  // Get patient's prescriptions
  getPrescriptions: (patientId) => api.get(`/patients/${patientId}/prescriptions`).then(res => res.data),

  // Create new patient
  createPatient: (data) => api.post('/patients', data).then(res => res.data),

  // Update patient
  updatePatient: (id, data) => api.put(`/patients/${id}`, data).then(res => res.data),

  // Delete patient
  deletePatient: (id) => api.delete(`/patients/${id}`).then(res => res.data),

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
  getTestOrders: (patientId) => api.get(`/patients/${patientId}/tests`).then(res => res.data),

  // Get all test types
  getAllTestTypes: () => api.get('/test-types').then(res => res.data),

  // Get medications
  getMedications: (patientId) => api.get(`/patients/${patientId}/medications`).then(res => res.data),

  // Get imaging
  getImaging: (patientId) => api.get(`/patients/${patientId}/imaging`).then(res => res.data),

  // Add medical note
  addMedicalNote: (patientId, data) => api.post(`/patients/${patientId}/notes`, data).then(res => res.data),

  // Create new prescription for a patient
  createPrescription: (patientId, data) => api.post(`/patients/${patientId}/prescriptions`, data).then(res => res.data),

  // Add test order
  addTestOrder: (patientId, data) => api.post(`/patients/${patientId}/tests`, data).then(res => res.data),

  // Update test order
  updateTestOrder: (orderId, data) => api.put(`/test-orders/${orderId}`, data).then(res => res.data),

  // Update prescription
  updatePrescription: (prescriptionId, data) => api.put(`/prescriptions/${prescriptionId}`, data).then(res => res.data),

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
      const response = await api.post(`/patients/${patientId}/upload-lab-result`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading lab result:', error);
      throw error;
    }
  },

  // Upload imaging file
  uploadImaging: async (patientId, formData) => {
    try {
      const response = await api.post(`/patients/${patientId}/upload-imaging`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading imaging:', error);
      throw error;
    }
  },

  // Get patient's prescriptions
  getPatientPrescriptions: (patientId) => api.get(`/patients/${patientId}/prescriptions`).then(res => res.data)
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