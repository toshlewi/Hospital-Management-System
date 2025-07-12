/**
 * AI Diagnosis Service
 * Connects to the Python AI service for real-time diagnosis
 */

const AI_SERVICE_BASE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000';

class AIDiagnosisService {
  constructor() {
    this.baseURL = AI_SERVICE_BASE_URL;
  }

  /**
   * Get authentication headers
   */
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Analyze clinician notes in real-time
   */
  async analyzeNotes(patientId, notes) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/analyze-notes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          patient_id: patientId,
          notes: notes,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing notes:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive diagnosis
   */
  async generateComprehensiveDiagnosis(patientId, patientData) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/comprehensive-diagnosis`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          patient_id: patientId,
          current_notes: patientData.current_notes || '',
          patient_history: patientData.medical_history || {},
          lab_results: patientData.lab_results || [],
          imaging_results: patientData.imaging_results || []
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating comprehensive diagnosis:', error);
      throw error;
    }
  }

  /**
   * Analyze lab results
   */
  async analyzeLabResults(patientId, labData) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/analyze-lab-results`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          lab_data: labData,
          patient_id: patientId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing lab results:', error);
      throw error;
    }
  }

  /**
   * Analyze imaging results
   */
  async analyzeImagingResults(patientId, imagingData) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/analyze-imaging-results`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          imaging_data: imagingData,
          patient_id: patientId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing imaging results:', error);
      throw error;
    }
  }

  /**
   * Assess patient risk
   */
  async assessPatientRisk(patientData) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/risk-assessment`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing patient risk:', error);
      throw error;
    }
  }

  /**
   * Get patient context
   */
  async getPatientContext(patientId) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/patient-context/${patientId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting patient context:', error);
      throw error;
    }
  }

  /**
   * Clear patient context
   */
  async clearPatientContext(patientId) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/patient-context/${patientId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing patient context:', error);
      throw error;
    }
  }

  /**
   * Get cached diagnosis
   */
  async getCachedDiagnosis(patientId) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/diagnosis-cache/${patientId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No cached diagnosis
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting cached diagnosis:', error);
      throw error;
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking AI service health:', error);
      throw error;
    }
  }

  /**
   * Start streaming diagnosis analysis
   */
  startStreamingDiagnosis(patientId, notes, onMessage, onError, onClose) {
    try {
      const eventSource = new EventSource(
        `${this.baseURL}/api/v1/diagnosis/stream-diagnosis?patient_id=${patientId}&notes=${encodeURIComponent(notes)}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing streaming data:', error);
          onError(error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        onError(error);
        eventSource.close();
      };

      eventSource.onclose = () => {
        onClose();
      };

      return eventSource;
    } catch (error) {
      console.error('Error starting streaming diagnosis:', error);
      onError(error);
      return null;
    }
  }

  /**
   * Stop streaming diagnosis analysis
   */
  stopStreamingDiagnosis(eventSource) {
    if (eventSource) {
      eventSource.close();
    }
  }
}

// Create singleton instance
const aiDiagnosisService = new AIDiagnosisService();

export default aiDiagnosisService; 