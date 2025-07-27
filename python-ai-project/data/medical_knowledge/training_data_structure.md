# Medical AI Training Data Structure

## Directory Organization

```
python-ai-project/data/medical_knowledge/
├── differential_diagnosis/
│   ├── common_conditions.csv          # Common medical conditions with symptoms
│   ├── rare_conditions.csv            # Rare conditions for comprehensive coverage
│   └── condition_symptoms_mapping.json # Mapping conditions to symptoms
│
├── diagnostic_tests/
│   ├── lab_tests.csv                  # Laboratory tests by condition
│   ├── imaging_tests.csv              # Imaging studies by condition
│   ├── specialized_tests.csv          # Specialized diagnostic procedures
│   └── test_condition_mapping.json    # Mapping tests to conditions
│
├── treatment_protocols/
│   ├── standard_treatments.csv        # Standard treatment protocols
│   ├── medication_protocols.csv       # Medication-based treatments
│   ├── surgical_procedures.csv        # Surgical interventions
│   └── treatment_condition_mapping.json # Mapping treatments to conditions
│
├── symptoms_database/
│   ├── primary_symptoms.csv           # Primary symptoms
│   ├── secondary_symptoms.csv         # Secondary/associated symptoms
│   ├── symptom_severity.csv           # Symptom severity scales
│   └── symptom_condition_mapping.json # Mapping symptoms to conditions
│
├── risk_factors/
│   ├── demographic_risks.csv          # Age, gender, ethnicity risks
│   ├── lifestyle_risks.csv            # Smoking, diet, exercise risks
│   ├── medical_history_risks.csv      # Previous conditions risks
│   └── risk_condition_mapping.json    # Mapping risk factors to conditions
│
└── follow_up_protocols/
    ├── monitoring_schedules.csv       # Follow-up monitoring schedules
    ├── preventive_measures.csv        # Preventive care protocols
    └── follow_up_condition_mapping.json # Mapping follow-up to conditions
```

## Data Format Examples

### 1. Differential Diagnosis Data (differential_diagnosis/common_conditions.csv)
```csv
condition_id,condition_name,primary_symptoms,secondary_symptoms,probability_range,severity,urgency_level
DIAB001,Type 2 Diabetes,frequent urination,increased thirst,0.7-0.9,moderate,medium
DIAB002,Type 1 Diabetes,excessive thirst,weight loss,0.8-0.95,high,high
HTN001,Hypertension,headache,chest pain,0.6-0.8,moderate,medium
```

### 2. Diagnostic Tests Data (diagnostic_tests/lab_tests.csv)
```csv
test_id,test_name,condition_id,priority,description,normal_range
GLU001,Fasting Blood Glucose,DIAB001,high,Measures blood sugar levels,70-100 mg/dL
GLU002,HbA1c,DIAB001,high,Average blood sugar over 3 months,<5.7%
CBC001,Complete Blood Count,HTN001,medium,Blood cell count and hemoglobin,varies
```

### 3. Treatment Protocols Data (treatment_protocols/standard_treatments.csv)
```csv
treatment_id,treatment_name,condition_id,priority,description,contraindications
TREAT001,Metformin,DIAB001,high,First-line diabetes medication,renal impairment
TREAT002,ACE Inhibitors,HTN001,high,Blood pressure medication,pregnancy
TREAT003,Lifestyle Modification,DIAB001,high,Diet and exercise changes,none
```

### 4. Symptoms Database (symptoms_database/primary_symptoms.csv)
```csv
symptom_id,symptom_name,category,severity_scale,common_conditions
SYM001,frequent urination,urinary,1-10,DIAB001,DIAB002
SYM002,increased thirst,general,1-10,DIAB001,DIAB002
SYM003,headache,neurological,1-10,HTN001
```

## JSON Mapping Files

### condition_symptoms_mapping.json
```json
{
  "DIAB001": {
    "primary_symptoms": ["SYM001", "SYM002"],
    "secondary_symptoms": ["SYM004", "SYM005"],
    "differential_diagnosis": ["DIAB002", "DIAB003"],
    "recommended_tests": ["GLU001", "GLU002"],
    "treatment_plan": ["TREAT001", "TREAT003"],
    "risk_factors": ["RF001", "RF002"],
    "follow_up_plan": ["FU001", "FU002"]
  }
}
```

## Training Data Sources

1. **WHO Guidelines** - Use existing WHO data for evidence-based protocols
2. **PubMed Research** - Use existing PubMed data for latest research findings
3. **Clinical Guidelines** - Add clinical practice guidelines
4. **Drug Databases** - Use existing pharmacology data
5. **Medical Textbooks** - Structured medical knowledge
6. **Clinical Trials** - Use existing clinical trials data

## Data Quality Standards

1. **Accuracy** - All data must be from reliable medical sources
2. **Completeness** - Each condition should have complete differential diagnosis, tests, and treatment
3. **Consistency** - Standardized terminology and formats
4. **Currency** - Regular updates with latest medical knowledge
5. **Traceability** - Source attribution for all data

## Integration with AI Models

The training data will be used to:
1. Train the differential diagnosis model
2. Generate test recommendations
3. Create treatment plans
4. Assess risk factors
5. Plan follow-up care

## Next Steps

1. Create the directory structure
2. Populate with existing data from current files
3. Add new structured data for enhanced AI responses
4. Update AI models to use the new data structure
5. Test and validate the enhanced responses 