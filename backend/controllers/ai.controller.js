// backend/controllers/ai.controller.js

exports.diagnose = async (req, res) => {
    // In a real system, you would call an AI model here.
    // For now, we mock the response based on the input.
    const { note_text, test_results, doctor_notes } = req.body;

    // Enhanced mock logic with more comprehensive responses
    let diagnosis = 'Unable to determine. Please provide more details.';
    let recommendations = [];
    let imageAnalysis = null;
    let reportAnalysis = null;

    const text = (note_text || '').toLowerCase();
    const testText = (test_results || '').toLowerCase();

    // Lab test analysis
    if (text.includes('blood') || text.includes('cbc') || text.includes('hemoglobin')) {
        if (text.includes('low') || text.includes('decreased')) {
            diagnosis = 'Anemia (Iron Deficiency)';
            recommendations = [
                'Consider iron supplementation',
                'Monitor hemoglobin levels',
                'Check for underlying cause of blood loss'
            ];
        } else if (text.includes('high') || text.includes('elevated')) {
            diagnosis = 'Polycythemia';
            recommendations = [
                'Consider phlebotomy if symptomatic',
                'Monitor for cardiovascular complications',
                'Check for secondary causes'
            ];
        }
    }

    // Imaging analysis
    if (text.includes('x-ray') || text.includes('chest') || text.includes('pneumonia')) {
        imageAnalysis = 'Chest X-ray shows patchy infiltrates consistent with pneumonia';
        diagnosis = 'Community-Acquired Pneumonia';
        recommendations = [
            'Start empiric antibiotic therapy',
            'Monitor oxygen saturation',
            'Consider sputum culture'
        ];
    }

    // General symptoms
    if (text.includes('cold') || text.includes('rhinovirus')) {
        diagnosis = 'Common Cold (Viral Upper Respiratory Infection)';
        recommendations = [
            'Rest and hydration',
            'Over-the-counter decongestants',
            'Monitor for secondary infections'
        ];
    } else if (text.includes('fever') || text.includes('pyrexia')) {
        diagnosis = 'Fever (cause unspecified)';
        recommendations = [
            'Antipyretic medication',
            'Cool compresses',
            'Monitor temperature every 4 hours'
        ];
    } else if (text.includes('diabetes') || text.includes('glucose')) {
        if (text.includes('high') || text.includes('elevated')) {
            diagnosis = 'Hyperglycemia';
            recommendations = [
                'Adjust insulin dosage',
                'Monitor blood glucose closely',
                'Check for diabetic ketoacidosis'
            ];
        }
    } else if (text.includes('hypertension') || text.includes('blood pressure')) {
        diagnosis = 'Hypertension';
        recommendations = [
            'Lifestyle modifications',
            'Consider antihypertensive medication',
            'Monitor blood pressure regularly'
        ];
    }

    // Report analysis for imaging
    if (text.includes('report') || text.includes('finding')) {
        reportAnalysis = 'AI analysis of the report indicates potential abnormalities requiring follow-up';
    }

    res.json({
        diagnosis,
        recommendations,
        imageAnalysis,
        reportAnalysis,
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