// backend/controllers/ai.controller.js

exports.diagnose = async (req, res) => {
    // In a real system, you would call an AI model here.
    // For now, we mock the response based on the input.
    const { note_text, test_results, doctor_notes } = req.body;

    // Simple mock logic
    let diagnosis = 'Unable to determine. Please provide more details.';
    let prescription = 'No prescription suggested.';
    let advice = 'No advice available.';

    if (note_text && note_text.toLowerCase().includes('cold')) {
        diagnosis = 'Common Cold (Viral Upper Respiratory Infection)';
        prescription = 'Paracetamol 500mg every 8 hours for 3 days.';
        advice = 'Rest, drink plenty of fluids, and monitor for worsening symptoms.';
    } else if (note_text && note_text.toLowerCase().includes('fever')) {
        diagnosis = 'Fever (cause unspecified)';
        prescription = 'Paracetamol as needed for fever.';
        advice = 'Monitor temperature, rest, and seek care if symptoms worsen.';
    }

    // You can expand this logic as needed

    res.json({
        diagnosis,
        prescription,
        advice,
        ai: true
    });
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