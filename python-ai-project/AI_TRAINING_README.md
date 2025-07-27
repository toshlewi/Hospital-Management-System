# Medical AI Training System

This directory contains an automated training system for medical AI models that can provide differential diagnosis, recommended tests, and treatment plans.

## 🚀 Quick Start

### 1. Expand Knowledge Base (Optional)
Add more medical conditions, tests, and treatments to enhance AI capabilities:

```bash
cd python-ai-project
python expand_knowledge_base.py
```

This will add cardiovascular, respiratory, and neurological conditions to your knowledge base.

### 2. Train AI Models
Run the automated training pipeline:

```bash
python train_ai_models.py
```

This will train enhanced models using the structured medical data.

### 3. Start AI Service
Start the AI service to use the trained models:

```bash
uvicorn src.api.fastapi_app:app --host 0.0.0.0 --port 8000 --reload
```

## 📁 Directory Structure

```
python-ai-project/
├── data/
│   └── medical_knowledge/
│       ├── differential_diagnosis/
│       │   ├── condition_symptoms_mapping.json  # Main condition mapping
│       │   └── common_conditions.csv            # Condition database
│       ├── diagnostic_tests/
│       │   └── lab_tests.csv                    # Test database
│       ├── treatment_protocols/
│       │   └── standard_treatments.csv          # Treatment database
│       └── [other existing data files]
├── src/
│   └── ai/
│       ├── enhanced_diagnosis.py                # Updated AI service
│       └── training_system.py                   # Training system
├── train_ai_models.py                           # Training script
├── expand_knowledge_base.py                     # Knowledge expansion script
└── AI_TRAINING_README.md                        # This file
```

## 🔧 Training Scripts

### `train_ai_models.py`

Automated training script with multiple modes:

```bash
# Automated training (recommended)
python train_ai_models.py

# With verbose logging
python train_ai_models.py --verbose

# Legacy training (old system)
python train_ai_models.py --mode legacy

# Enhanced training only
python train_ai_models.py --mode enhanced

# Check prerequisites only
python train_ai_models.py --check-only

# Custom models directory
python train_ai_models.py --models-dir ./my_models
```

**Training Modes:**
- `auto` (default): Uses enhanced training with fallback to legacy
- `enhanced`: Uses only the new structured data
- `legacy`: Uses only the old data sources

### `expand_knowledge_base.py`

Expands the medical knowledge base with new conditions:

```bash
python expand_knowledge_base.py
```

**What it adds:**
- Cardiovascular conditions (Coronary Artery Disease, Heart Failure)
- Respiratory conditions (COPD, Tuberculosis)
- Neurological conditions (Stroke, Epilepsy)
- Associated diagnostic tests
- Treatment protocols

## 🧠 Enhanced AI Features

The updated AI system now provides:

### 1. **Differential Diagnosis**
- Maps symptoms to potential conditions
- Provides probability scores
- Includes severity and urgency levels

### 2. **Recommended Tests**
- Suggests appropriate diagnostic tests
- Prioritizes tests by urgency
- Links tests to specific conditions

### 3. **Treatment Plans**
- Recommends treatment protocols
- Includes contraindications
- Provides follow-up plans

### 4. **Structured Data Integration**
- Uses `condition_symptoms_mapping.json` for accurate symptom-to-condition mapping
- Leverages CSV databases for comprehensive coverage
- Fallback to legacy data sources if needed

## 📊 Training Data Structure

### Condition Mapping (`condition_symptoms_mapping.json`)
```json
{
  "DIAB001": {
    "condition_name": "Type 2 Diabetes",
    "primary_symptoms": ["frequent urination", "increased thirst", "fatigue"],
    "secondary_symptoms": ["increased hunger", "blurred vision", "slow healing"],
    "differential_diagnosis": ["DIAB002", "DIAB003", "HTN001"],
    "recommended_tests": ["GLU001", "GLU002", "CMP001"],
    "treatment_plan": ["TREAT001", "TREAT003"],
    "risk_factors": ["obesity", "family history", "sedentary lifestyle"],
    "follow_up_plan": ["monthly glucose monitoring", "quarterly HbA1c"],
    "severity": "moderate",
    "urgency_level": "medium"
  }
}
```

### CSV Databases
- **`common_conditions.csv`**: Condition database with symptoms and metadata
- **`lab_tests.csv`**: Diagnostic test database with priorities and categories
- **`standard_treatments.csv`**: Treatment protocol database with contraindications

## 🔄 Training Pipeline

### Enhanced Training Process

1. **Data Loading**
   - Loads structured JSON and CSV files
   - Falls back to legacy data sources if needed
   - Validates data integrity

2. **Dataset Creation**
   - Creates enhanced diagnosis datasets from condition mapping
   - Builds treatment recommendation datasets
   - Generates test recommendation datasets

3. **Model Training**
   - **Enhanced Diagnosis Model**: Ensemble of Random Forest, Logistic Regression, and SVM
   - **Treatment Model**: Voting classifier for treatment recommendations
   - **Test Recommendation Model**: Random Forest for test suggestions
   - **BERT Model**: Deep learning model for complex text analysis

4. **Model Evaluation**
   - Accuracy metrics for each model
   - Classification reports
   - Performance summaries

5. **Model Storage**
   - Saves trained models with metadata
   - Creates model selector for inference
   - Generates training summaries

## 🎯 Usage Examples

### Training with New Data
```bash
# 1. Expand knowledge base
python expand_knowledge_base.py

# 2. Train models
python train_ai_models.py --mode enhanced --verbose

# 3. Check results
ls -la data/models/
cat data/models/enhanced_training_summary.json
```

### Testing the AI Service
```bash
# Start AI service
uvicorn src.api.fastapi_app:app --host 0.0.0.0 --port 8000 --reload

# Test with curl
curl -X POST "http://localhost:8000/diagnose" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Patient complains of chest pain and shortness of breath", "patient_id": 1}'
```

## 📈 Performance Metrics

The enhanced training system provides:

- **Accuracy**: Model performance on test data
- **Precision/Recall**: Detailed classification metrics
- **Training Time**: Time taken for each model
- **Data Coverage**: Number of conditions, tests, and treatments covered

## 🔧 Customization

### Adding New Conditions
1. Edit `expand_knowledge_base.py`
2. Add new conditions to the appropriate functions
3. Run the expansion script
4. Retrain models

### Modifying Training Parameters
1. Edit `src/ai/training_system.py`
2. Adjust hyperparameters in training functions
3. Run training with custom settings

### Adding New Data Sources
1. Add new CSV/JSON files to `data/medical_knowledge/`
2. Update `load_medical_data()` in training system
3. Create new dataset creation functions
4. Add new model training functions

## 🐛 Troubleshooting

### Common Issues

**"No medical data found"**
- Ensure `data/medical_knowledge/` directory exists
- Check that structured data files are present
- Verify file permissions

**"Insufficient data for training"**
- Add more conditions using `expand_knowledge_base.py`
- Check data file formats
- Ensure CSV files have required columns

**"Training failed"**
- Check Python dependencies: `pip install -r requirements.txt`
- Verify sufficient disk space for model storage
- Check logs in `training.log`

### Log Files
- `training.log`: Detailed training logs
- `data/models/enhanced_training_summary.json`: Training summary
- `data/models/enhanced_model_selector.json`: Model selection configuration

## 🚀 Next Steps

1. **Expand Knowledge Base**: Add more medical conditions and protocols
2. **Fine-tune Models**: Adjust hyperparameters for better performance
3. **Add Specializations**: Create specialty-specific models (cardiology, neurology, etc.)
4. **Integration**: Connect with your hospital management system
5. **Validation**: Test with real clinical data

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review training logs
3. Verify data file formats
4. Ensure all dependencies are installed

---

**Happy Training! 🎉** 