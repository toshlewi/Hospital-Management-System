// backend/controllers/ai.controller.js

// Memory management for AI controller
let fetchModule = null;

// Lazy load fetch to reduce memory usage
async function getFetch() {
  if (!fetchModule) {
    fetchModule = await import('node-fetch');
  }
  return fetchModule.default;
}

// Improved intent detection for general medical questions or keyword-based queries
function isGeneralQuestion(text) {
    if (!text) return false;
    const lower = text.trim().toLowerCase();
    // Check for question mark, question words, or medical keywords
    return (
        /\?$/.test(lower) ||
        /^(what|how|when|why|who|where|which|list|give|explain)/i.test(lower) ||
        lower.includes('symptom') ||
        lower.includes('signs') ||
        lower.includes('side effect') ||
        lower.includes('what is')
    );
}

// Enhanced response formatter
function formatEnhancedResponse(aiResult) {
    const {
        symptoms = [],
        conditions = [],
        recommendations = [],
        confidence = 0,
        urgency_score = 0,
        data_sources = {},
        // New fields for enhanced structure
        differential_diagnosis = [],
        recommended_tests = [],
        treatment_plan = [],
        risk_factors = [],
        follow_up_plan = []
    } = aiResult;

    return {
        // Core analysis results
        symptoms,
        conditions: differential_diagnosis.length > 0 ? differential_diagnosis : conditions,
        confidence,
        urgency_score,
        data_sources,
        
        // Enhanced sections
        differential_diagnosis: differential_diagnosis.length > 0 ? differential_diagnosis : conditions,
        tests: recommended_tests,
        treatment_plan: treatment_plan.length > 0 ? treatment_plan : recommendations,
        risk_factors,
        follow_up_plan,
        
        // Legacy support
        recommendations,
        
        // Metadata
        ai: true,
        timestamp: new Date().toISOString(),
        version: '2.0'
    };
}

// Helper function to make AI service calls with timeout and memory management
async function callAIService(url, payload, timeout = 30000) {
    const fetch = await getFetch();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`AI service error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('AI service request timed out');
        }
        throw error;
    }
}

exports.diagnose = async (req, res) => {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { note_text, test_results, doctor_notes, patient_id, symptoms } = req.body;
        const text = note_text || symptoms || '';
        
        // Use the new enhanced medical API endpoint
        const payload = {
            symptoms: text,
            patient_id: patient_id || 1,
            patient_data: {
                notes: doctor_notes || '',
                test_results: test_results || []
            }
        };
        
        const result = await callAIService(`${AI_SERVICE_URL}/api/v1/diagnose`, payload);
        const enhancedResult = formatEnhancedResponse(result);
        res.json({ ...enhancedResult, routed: 'diagnosis' });
    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message, 
            ai: false 
        });
    }
};

// Lab Test Analysis
exports.analyzeLabResults = async (req, res) => {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, lab_results, notes } = req.body;
        
        // Use comprehensive analysis for lab results
        const payload = {
            symptoms: notes || 'Lab results analysis',
            patient_id: patient_id || 1,
            current_data: {
                lab_results: lab_results || []
            }
        };
        
        const result = await callAIService(`${AI_SERVICE_URL}/api/v1/comprehensive-analysis`, payload);
        res.json({ ...result, ai: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Lab Analysis Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message, 
            ai: false 
        });
    }
};

// Drug Interaction Analysis
exports.analyzeDrugInteractions = async (req, res) => {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, medications } = req.body;
        
        // Use comprehensive analysis for drug interactions
        const payload = {
            symptoms: 'Drug interaction analysis',
            patient_id: patient_id || 1,
            current_data: {
                medications: medications || []
            }
        };
        
        const result = await callAIService(`${AI_SERVICE_URL}/api/v1/comprehensive-analysis`, payload);
        res.json({ ...result, ai: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Drug Interaction Analysis Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message, 
            ai: false 
        });
    }
};

// Symptom Analysis
exports.analyzeSymptoms = async (req, res) => {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, symptoms, notes } = req.body;
        
        const payload = {
            symptoms: symptoms || notes || '',
            patient_id: patient_id || 1
        };
        
        const result = await callAIService(`${AI_SERVICE_URL}/api/v1/diagnose`, payload);
        res.json({ ...result, ai: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Symptom Analysis Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message, 
            ai: false 
        });
    }
};

// Treatment Analysis
exports.analyzeTreatment = async (req, res) => {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, diagnosis, symptoms, lab_results } = req.body;
        
        const payload = {
            symptoms: symptoms || '',
            patient_id: patient_id || 1,
            current_data: {
                diagnosis: diagnosis || {},
                lab_results: lab_results || []
            }
        };
        
        const result = await callAIService(`${AI_SERVICE_URL}/api/v1/comprehensive-analysis`, payload);
        res.json({ ...result, ai: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Treatment Analysis Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message, 
            ai: false 
        });
    }
};

// Imaging Analysis
exports.analyzeImaging = async (req, res) => {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, imaging_results } = req.body;
        
        const payload = {
            symptoms: 'Imaging analysis',
            patient_id: patient_id || 1,
            current_data: {
                imaging_results: imaging_results || []
            }
        };
        
        const result = await callAIService(`${AI_SERVICE_URL}/api/v1/comprehensive-analysis`, payload);
        res.json({ ...result, ai: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Imaging Analysis Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message, 
            ai: false 
        });
    }
};

// Comprehensive Analysis
exports.analyzeComprehensive = async (req, res) => {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, notes, medications, lab_results, imaging_results, symptoms } = req.body;
        
        const payload = {
            symptoms: symptoms || notes || '',
            patient_id: patient_id || 1,
            patient_data: {
                notes: notes || '',
                medications: medications || [],
                lab_results: lab_results || [],
                imaging_results: imaging_results || []
            }
        };
        
        const result = await callAIService(`${AI_SERVICE_URL}/api/v1/comprehensive-analysis`, payload);
        res.json({ ...result, ai: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Comprehensive Analysis Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message, 
            ai: false 
        });
    }
};

// Real-time Analysis
exports.analyzeRealTime = async (req, res) => {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, notes, medications, lab_results, imaging_results, symptoms } = req.body;
        
        const payload = {
            symptoms: symptoms || notes || '',
            patient_id: patient_id || 1,
            patient_data: {
                notes: notes || '',
                medications: medications || [],
                lab_results: lab_results || [],
                imaging_results: imaging_results || []
            }
        };
        
        const result = await callAIService(`${AI_SERVICE_URL}/api/v1/comprehensive-analysis`, payload);
        res.json({ ...result, ai: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Real-time Analysis Error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message, 
            ai: false 
        });
    }
};

// Legacy pharmacy check for backward compatibility
exports.pharmacyCheck = async (req, res) => {
    // In a real system, you would call an AI model here.
    // For now, we mock the response based on the input.
    const { drugs } = req.body; // drugs: array of drug names
    let interactions = [];
    let suggestions = [];

    // Mock: warn if both ibuprofen and aspirin are present
    if (drugs && drugs.includes('ibuprofen') && drugs.includes('aspirin')) {
        interactions.push('Warning: Ibuprofen and Aspirin together may increase risk of bleeding.');
    }
    // Mock: suggest paracetamol as a safer alternative
    if (drugs && drugs.includes('ibuprofen')) {
        suggestions.push('Consider Paracetamol as a safer alternative for pain relief.');
    }
    // Mock: generic advice
    if (drugs && drugs.length > 0) {
        suggestions.push('Check for allergies and renal function before dispensing.');
    }

    res.json({ interactions, suggestions, ai: true });
}; 