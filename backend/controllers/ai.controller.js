// backend/controllers/ai.controller.js

exports.diagnose = async (req, res) => {
    // Proxy request to Python AI service
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    try {
        const { note_text, test_results, doctor_notes, patient_id } = req.body;
        // Compose payload for AI service
        const payload = {
            patient_id: patient_id || 1,
            notes: note_text || '',
            timestamp: new Date().toISOString()
        };
        const response = await fetch('http://localhost:8000/api/v1/diagnosis/analyze-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            return res.status(response.status).json({ error: 'AI service error', status: response.status });
        }
        const result = await response.json();
        res.json({ ...result, ai: true });
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