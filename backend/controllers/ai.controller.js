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
                return res.status(response.status).json({ error: 'AI service error', status: response.status });
            }
            result = await response.json();
            res.json({ ...result, ai: true, routed: 'clinical-support' });
        } else {
            // Compose payload for AI service (diagnosis)
            const payload = {
                patient_id: patient_id || 1,
                notes: text,
                timestamp: new Date().toISOString()
            };
            response = await fetch(`${AI_SERVICE_URL}/api/v1/diagnosis/analyze-notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                return res.status(response.status).json({ error: 'AI service error', status: response.status });
            }
            result = await response.json();
            res.json({ ...result, ai: true, routed: 'diagnosis' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message, ai: false });
    }
};

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