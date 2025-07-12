import api from './api';

export const aiService = {
  getDiagnosisSuggestions: async (symptoms) => {
    try {
      const response = await api.post('/ai/diagnosis', { symptoms });
      return response.data;
    } catch (error) {
      console.error('Error getting diagnosis suggestions:', error);
      throw error;
    }
  },

  analyzeImage: async (imageData) => {
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      const response = await api.post('/ai/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  },

  getTreatmentRecommendations: async (diagnosis) => {
    try {
      const response = await api.post('/ai/treatment', { diagnosis });
      return response.data;
    } catch (error) {
      console.error('Error getting treatment recommendations:', error);
      throw error;
    }
  },

  predictPatientRisk: async (patientData) => {
    try {
      const response = await api.post('/ai/risk-prediction', patientData);
      return response.data;
    } catch (error) {
      console.error('Error predicting patient risk:', error);
      throw error;
    }
  },

  getMedicationSuggestions: async (diagnosis, allergies) => {
    try {
      const response = await api.post('/ai/medication', { diagnosis, allergies });
      return response.data;
    } catch (error) {
      console.error('Error getting medication suggestions:', error);
      throw error;
    }
  },

  pharmacyAICheck: async (drugs) => {
    const response = await api.post('/ai/pharmacy-check', { drugs });
    return response.data;
  },
};

export default aiService; 