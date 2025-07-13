/**
 * AI Diagnosis Service
 * Connects to the Python AI service for real-time diagnosis
 */

const AI_SERVICE_BASE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000';

class AIDiagnosisService {
  constructor() {
    this.baseURL = AI_SERVICE_BASE_URL;
  }

  async analyzeNotes(patientId, notes) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/analyze-notes-flexible`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  async analyzeLabResults(labResults) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/analyze-lab-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lab_data: labResults
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

  async analyzeImagingResults(imagingResults) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/analyze-imaging-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imaging_data: imagingResults
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

  async analyzeDrugInteractions(medications) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/analyze-drug-interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medications: medications
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing drug interactions:', error);
      throw error;
    }
  }

  async generateComprehensiveDiagnosis(patientId, patientData) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/comprehensive-diagnosis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          patient_history: patientData.medical_history || {},
          lab_results: patientData.lab_results || [],
          imaging_results: patientData.imaging_results || [],
          current_notes: patientData.current_notes || ''
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

  async getPatientContext(patientId) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/patient-context/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
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

  async clearPatientContext(patientId) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/patient-context/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
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

  startStreamingDiagnosis(patientId, notes, onData, onError, onComplete) {
    const eventSource = new EventSource(
      `${this.baseURL}/api/v1/diagnosis/stream-diagnosis?patient_id=${patientId}&notes=${encodeURIComponent(notes)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onData(data);
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
      onComplete();
    };

    return eventSource;
  }

  async assessRisk(patientData) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/diagnosis/risk-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing risk:', error);
      throw error;
    }
  }

  // Enhanced analysis methods for different page types
  async analyzeOutpatientData(patientId, outpatientData) {
    try {
      const analysisData = {
        patient_id: patientId,
        notes: outpatientData.notes || '',
        symptoms: outpatientData.symptoms || [],
        vital_signs: outpatientData.vital_signs || {},
        medical_history: outpatientData.medical_history || {}
      };

      return await this.analyzeNotes(patientId, JSON.stringify(analysisData));
    } catch (error) {
      console.error('Error analyzing outpatient data:', error);
      throw error;
    }
  }

  async analyzePharmacyData(patientId, pharmacyData) {
    try {
      const medications = pharmacyData.medications || [];
      const interactions = await this.analyzeDrugInteractions(medications);
      
      return {
        ...interactions,
        patient_id: patientId,
        analysis_type: 'pharmacy',
        recommendations: this._generatePharmacyRecommendations(interactions)
      };
    } catch (error) {
      console.error('Error analyzing pharmacy data:', error);
      throw error;
    }
  }

  async analyzeLabData(patientId, labData) {
    try {
      const labResults = labData.lab_results || [];
      const analysis = await this.analyzeLabResults(labResults);
      
      return {
        ...analysis,
        patient_id: patientId,
        analysis_type: 'lab',
        recommendations: this._generateLabRecommendations(analysis)
      };
    } catch (error) {
      console.error('Error analyzing lab data:', error);
      throw error;
    }
  }

  async analyzeImagingData(patientId, imagingData) {
    try {
      const imagingResults = imagingData.imaging_results || [];
      const analysis = await this.analyzeImagingResults(imagingResults);
      
      return {
        ...analysis,
        patient_id: patientId,
        analysis_type: 'imaging',
        recommendations: this._generateImagingRecommendations(analysis)
      };
    } catch (error) {
      console.error('Error analyzing imaging data:', error);
      throw error;
    }
  }

  _generatePharmacyRecommendations(interactions) {
    const recommendations = [];
    
    if (interactions.interactions && interactions.interactions.length > 0) {
      recommendations.push('Review drug interactions with patient');
      recommendations.push('Monitor for adverse effects');
      recommendations.push('Consider alternative medications if needed');
    }
    
    if (interactions.risk_level === 'high') {
      recommendations.push('Immediate review by pharmacist required');
      recommendations.push('Patient education on drug interactions');
    }
    
    return recommendations;
  }

  _generateLabRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.abnormal_values && analysis.abnormal_values.length > 0) {
      recommendations.push('Review abnormal lab values with physician');
      recommendations.push('Consider repeat testing if clinically indicated');
    }
    
    if (analysis.critical_values && analysis.critical_values.length > 0) {
      recommendations.push('Immediate physician notification required');
      recommendations.push('Patient monitoring for critical values');
    }
    
    return recommendations;
  }

  _generateImagingRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.abnormalities && analysis.abnormalities.length > 0) {
      recommendations.push('Radiologist review of abnormal findings');
      recommendations.push('Consider additional imaging if clinically indicated');
    }
    
    if (analysis.findings && analysis.findings.length > 0) {
      recommendations.push('Correlate imaging findings with clinical presentation');
      recommendations.push('Follow-up imaging as clinically indicated');
    }
    
    return recommendations;
  }
}

export default new AIDiagnosisService(); 