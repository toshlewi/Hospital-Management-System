// backend/controllers/ai.controller.js

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

exports.diagnose = async (req, res) => {
    // Proxy request to Python AI service
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { note_text, test_results, doctor_notes, patient_id } = req.body;
        const text = note_text || '';
        let response, result;

        if (isGeneralQuestion(text)) {
            // Route to clinical-support for general questions
            const payload = { clinical_question: text };
            response = await fetch(`${AI_SERVICE_URL}/api/v1/clinical-support/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                return res.status(response.status).json({ 
                    error: 'AI service error', 
                    status: response.status,
                    message: 'Clinical support service unavailable'
                });
            }
            result = await response.json();
            const enhancedResult = formatEnhancedResponse(result);
            res.json({ ...enhancedResult, routed: 'clinical-support' });
        } else {
            // Compose payload for AI service (diagnosis)
            const payload = {
                patient_id: patient_id || 1,
                notes: text,
                timestamp: new Date().toISOString(),
                enhanced_response: true // Request enhanced response format
            };
            
            response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                return res.status(response.status).json({ 
                    error: 'AI service error', 
                    status: response.status,
                    message: 'Diagnosis service unavailable'
                });
            }
            
            result = await response.json();
            const enhancedResult = formatEnhancedResponse(result);
            res.json({ ...enhancedResult, routed: 'diagnosis' });
        }
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
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, lab_results, notes } = req.body;
        
        const payload = {
            patient_id: patient_id || 1,
            lab_data: lab_results || [],
            notes: notes || ''
        };
        
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-lab-results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'AI service error', 
                status: response.status,
                message: 'Lab analysis service unavailable'
            });
        }
        
        const result = await response.json();
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
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, medications } = req.body;
        
        const payload = {
            patient_id: patient_id || 1,
            medications: medications || []
        };
        
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-drug-interactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'AI service error', 
                status: response.status,
                message: 'Drug interaction service unavailable'
            });
        }
        
        const result = await response.json();
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
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, symptoms, notes } = req.body;
        
        const payload = {
            patient_id: patient_id || 1,
            symptoms: symptoms || [],
            notes: notes || ''
        };
        
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-symptoms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'AI service error', 
                status: response.status,
                message: 'Symptom analysis service unavailable'
            });
        }
        
        const result = await response.json();
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
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, diagnosis, symptoms, lab_results } = req.body;
        
        const payload = {
            patient_id: patient_id || 1,
            diagnosis: diagnosis || {},
            symptoms: symptoms || [],
            lab_results: lab_results || []
        };
        
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-treatment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'AI service error', 
                status: response.status,
                message: 'Treatment analysis service unavailable'
            });
        }
        
        const result = await response.json();
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
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, imaging_results } = req.body;
        
        const payload = {
            patient_id: patient_id || 1,
            imaging_data: imaging_results || []
        };
        
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-imaging`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'AI service error', 
                status: response.status,
                message: 'Imaging analysis service unavailable'
            });
        }
        
        const result = await response.json();
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
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, notes, medications, lab_results, imaging_results, symptoms } = req.body;
        
        const payload = {
            patient_id: patient_id || 1,
            notes: notes || '',
            medications: medications || [],
            lab_results: lab_results || [],
            imaging_results: imaging_results || [],
            symptoms: symptoms || []
        };
        
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-comprehensive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'AI service error', 
                status: response.status,
                message: 'Comprehensive analysis service unavailable'
            });
        }
        
        const result = await response.json();
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
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    try {
        const { patient_id, notes, medications, lab_results, imaging_results, symptoms } = req.body;
        
        const payload = {
            patient_id: patient_id || 1,
            notes: notes || '',
            medications: medications || [],
            lab_results: lab_results || [],
            imaging_results: imaging_results || [],
            symptoms: symptoms || []
        };
        
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-real-time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'AI service error', 
                status: response.status,
                message: 'Real-time analysis service unavailable'
            });
        }
        
        const result = await response.json();
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