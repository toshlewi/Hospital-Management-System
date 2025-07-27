#!/usr/bin/env python3
"""
Expand Medical AI Knowledge Base
Add more conditions, tests, and treatments to enhance AI capabilities
"""

import os
import sys
import json
import pandas as pd
from pathlib import Path
from datetime import datetime

def load_existing_data():
    """Load existing structured data"""
    base_dir = Path(__file__).parent / "data" / "medical_knowledge"
    
    data = {}
    
    # Load condition mapping
    mapping_path = base_dir / "differential_diagnosis" / "condition_symptoms_mapping.json"
    if mapping_path.exists():
        with open(mapping_path, 'r') as f:
            data['condition_mapping'] = json.load(f)
    
    # Load CSV files
    csv_files = {
        'common_conditions': 'differential_diagnosis/common_conditions.csv',
        'lab_tests': 'diagnostic_tests/lab_tests.csv',
        'treatments': 'treatment_protocols/standard_treatments.csv'
    }
    
    for key, filepath in csv_files.items():
        file_path = base_dir / filepath
        if file_path.exists():
            try:
                # Use proper CSV parsing with quote handling
                df = pd.read_csv(file_path, quotechar='"', escapechar='\\')
                data[key] = df
            except Exception as e:
                print(f"Error loading {filepath}: {e}")
                # Try alternative parsing method
                try:
                    df = pd.read_csv(file_path, sep=',', engine='python')
                    data[key] = df
                except Exception as e2:
                    print(f"Alternative parsing also failed for {filepath}: {e2}")
                    data[key] = pd.DataFrame([])
        else:
            print(f"File not found: {filepath}")
            data[key] = pd.DataFrame([])
    
    return data, base_dir

def add_cardiovascular_conditions(data, base_dir):
    """Add cardiovascular conditions"""
    print("Adding cardiovascular conditions...")
    
    # New conditions to add
    new_conditions = [
        {
            "condition_id": "CARD001",
            "condition_name": "Coronary Artery Disease",
            "primary_symptoms": ["chest pain", "shortness of breath", "fatigue"],
            "secondary_symptoms": ["nausea", "sweating", "arm pain"],
            "differential_diagnosis": ["angina", "myocardial infarction", "heart failure"],
            "recommended_tests": ["ECG", "troponin", "coronary angiography"],
            "treatment_plan": ["aspirin", "beta blockers", "statins"],
            "risk_factors": ["age", "smoking", "diabetes", "hypertension"],
            "follow_up_plan": ["cardiology referral", "lifestyle modification"],
            "severity": "high",
            "urgency_level": "high"
        },
        {
            "condition_id": "CARD002", 
            "condition_name": "Heart Failure",
            "primary_symptoms": ["shortness of breath", "fatigue", "swelling"],
            "secondary_symptoms": ["cough", "rapid heartbeat", "weight gain"],
            "differential_diagnosis": ["pneumonia", "COPD", "kidney disease"],
            "recommended_tests": ["BNP", "echocardiogram", "chest x-ray"],
            "treatment_plan": ["ACE inhibitors", "diuretics", "beta blockers"],
            "risk_factors": ["coronary artery disease", "hypertension", "diabetes"],
            "follow_up_plan": ["regular monitoring", "dietary restrictions"],
            "severity": "high",
            "urgency_level": "high"
        }
    ]
    
    # Add to condition mapping
    for condition in new_conditions:
        data['condition_mapping'][condition['condition_id']] = condition
    
    # Add to CSV
    new_csv_data = []
    for condition in new_conditions:
        new_csv_data.append({
            'condition_id': condition['condition_id'],
            'condition_name': condition['condition_name'],
            'primary_symptoms': ';'.join(condition['primary_symptoms']),
            'secondary_symptoms': ';'.join(condition['secondary_symptoms']),
            'probability_range': '0.7-0.9',
            'severity': condition['severity'],
            'urgency_level': condition['urgency_level'],
            'category': 'cardiovascular'
        })
    
    if 'common_conditions' in data:
        new_df = pd.DataFrame(new_csv_data)
        data['common_conditions'] = pd.concat([data['common_conditions'], new_df], ignore_index=True)
    
    return data

def add_respiratory_conditions(data, base_dir):
    """Add respiratory conditions"""
    print("Adding respiratory conditions...")
    
    new_conditions = [
        {
            "condition_id": "RESP001",
            "condition_name": "Chronic Obstructive Pulmonary Disease",
            "primary_symptoms": ["shortness of breath", "chronic cough", "wheezing"],
            "secondary_symptoms": ["fatigue", "chest tightness", "weight loss"],
            "differential_diagnosis": ["asthma", "bronchiectasis", "heart failure"],
            "recommended_tests": ["spirometry", "chest x-ray", "ABG"],
            "treatment_plan": ["bronchodilators", "inhaled steroids", "pulmonary rehabilitation"],
            "risk_factors": ["smoking", "air pollution", "occupational exposure"],
            "follow_up_plan": ["pulmonary function tests", "vaccination"],
            "severity": "moderate",
            "urgency_level": "medium"
        },
        {
            "condition_id": "RESP002",
            "condition_name": "Tuberculosis",
            "primary_symptoms": ["cough", "fever", "night sweats"],
            "secondary_symptoms": ["weight loss", "fatigue", "chest pain"],
            "differential_diagnosis": ["pneumonia", "lung cancer", "fungal infection"],
            "recommended_tests": ["sputum culture", "chest x-ray", "PPD test"],
            "treatment_plan": ["isoniazid", "rifampin", "pyrazinamide"],
            "risk_factors": ["immunocompromised", "close contact", "travel"],
            "follow_up_plan": ["contact tracing", "regular monitoring"],
            "severity": "high",
            "urgency_level": "high"
        }
    ]
    
    for condition in new_conditions:
        data['condition_mapping'][condition['condition_id']] = condition
    
    return data

def add_neurological_conditions(data, base_dir):
    """Add neurological conditions"""
    print("Adding neurological conditions...")
    
    new_conditions = [
        {
            "condition_id": "NEURO001",
            "condition_name": "Stroke",
            "primary_symptoms": ["sudden weakness", "speech difficulty", "vision problems"],
            "secondary_symptoms": ["headache", "dizziness", "confusion"],
            "differential_diagnosis": ["TIA", "migraine", "seizure"],
            "recommended_tests": ["CT scan", "MRI", "carotid ultrasound"],
            "treatment_plan": ["tPA if eligible", "antiplatelets", "rehabilitation"],
            "risk_factors": ["hypertension", "atrial fibrillation", "diabetes"],
            "follow_up_plan": ["stroke prevention", "rehabilitation"],
            "severity": "high",
            "urgency_level": "high"
        },
        {
            "condition_id": "NEURO002",
            "condition_name": "Epilepsy",
            "primary_symptoms": ["seizures", "loss of consciousness", "unusual behavior"],
            "secondary_symptoms": ["confusion", "memory problems", "anxiety"],
            "differential_diagnosis": ["syncope", "psychogenic seizures", "cardiac arrhythmia"],
            "recommended_tests": ["EEG", "MRI", "blood tests"],
            "treatment_plan": ["antiepileptic drugs", "lifestyle modification", "seizure diary"],
            "risk_factors": ["head injury", "family history", "brain infection"],
            "follow_up_plan": ["regular EEG", "medication monitoring"],
            "severity": "moderate",
            "urgency_level": "medium"
        }
    ]
    
    for condition in new_conditions:
        data['condition_mapping'][condition['condition_id']] = condition
    
    return data

def add_new_tests(data, base_dir):
    """Add new diagnostic tests"""
    print("Adding new diagnostic tests...")
    
    new_tests = [
        {
            'test_id': 'CARD001',
            'test_name': 'Echocardiogram',
            'condition_id': 'CARD001',
            'priority': 'high',
            'description': 'Ultrasound of the heart to assess function and structure',
            'normal_range': 'varies',
            'test_category': 'cardiac'
        },
        {
            'test_id': 'CARD002',
            'test_name': 'Coronary Angiography',
            'condition_id': 'CARD001',
            'priority': 'high',
            'description': 'X-ray imaging of coronary arteries using contrast dye',
            'normal_range': 'no significant stenosis',
            'test_category': 'cardiac'
        },
        {
            'test_id': 'RESP001',
            'test_name': 'Pulmonary Function Tests',
            'condition_id': 'RESP001',
            'priority': 'high',
            'description': 'Tests to measure lung function and capacity',
            'normal_range': 'FEV1/FVC > 0.7',
            'test_category': 'respiratory'
        },
        {
            'test_id': 'NEURO001',
            'test_name': 'Electroencephalogram (EEG)',
            'condition_id': 'NEURO002',
            'priority': 'high',
            'description': 'Records electrical activity of the brain',
            'normal_range': 'normal brain wave patterns',
            'test_category': 'neurological'
        }
    ]
    
    if 'lab_tests' in data:
        new_df = pd.DataFrame(new_tests)
        data['lab_tests'] = pd.concat([data['lab_tests'], new_df], ignore_index=True)
    
    return data

def add_new_treatments(data, base_dir):
    """Add new treatment protocols"""
    print("Adding new treatment protocols...")
    
    new_treatments = [
        {
            'treatment_id': 'CARD001',
            'treatment_name': 'Coronary Artery Bypass Grafting',
            'condition_id': 'CARD001',
            'priority': 'high',
            'description': 'Surgical procedure to improve blood flow to the heart',
            'contraindications': 'severe comorbidities',
            'treatment_category': 'surgical'
        },
        {
            'treatment_id': 'CARD002',
            'treatment_name': 'Percutaneous Coronary Intervention',
            'condition_id': 'CARD001',
            'priority': 'high',
            'description': 'Minimally invasive procedure to open blocked arteries',
            'contraindications': 'allergy to contrast dye',
            'treatment_category': 'interventional'
        },
        {
            'treatment_id': 'RESP001',
            'treatment_name': 'Pulmonary Rehabilitation',
            'condition_id': 'RESP001',
            'priority': 'medium',
            'description': 'Exercise and education program for lung disease',
            'contraindications': 'acute exacerbation',
            'treatment_category': 'rehabilitation'
        },
        {
            'treatment_id': 'NEURO001',
            'treatment_name': 'Vagus Nerve Stimulation',
            'condition_id': 'NEURO002',
            'priority': 'medium',
            'description': 'Device implantation to reduce seizure frequency',
            'contraindications': 'pregnancy',
            'treatment_category': 'device'
        }
    ]
    
    if 'treatments' in data:
        new_df = pd.DataFrame(new_treatments)
        data['treatments'] = pd.concat([data['treatments'], new_df], ignore_index=True)
    
    return data

def save_updated_data(data, base_dir):
    """Save updated data back to files"""
    print("Saving updated data...")
    
    # Save condition mapping
    mapping_path = base_dir / "differential_diagnosis" / "condition_symptoms_mapping.json"
    with open(mapping_path, 'w') as f:
        json.dump(data['condition_mapping'], f, indent=2)
    
    # Save CSV files
    if 'common_conditions' in data:
        csv_path = base_dir / "differential_diagnosis" / "common_conditions.csv"
        data['common_conditions'].to_csv(csv_path, index=False)
    
    if 'lab_tests' in data:
        csv_path = base_dir / "diagnostic_tests" / "lab_tests.csv"
        data['lab_tests'].to_csv(csv_path, index=False)
    
    if 'treatments' in data:
        csv_path = base_dir / "treatment_protocols" / "standard_treatments.csv"
        data['treatments'].to_csv(csv_path, index=False)
    
    print("Data saved successfully!")

def main():
    """Main function"""
    print("=" * 60)
    print("Medical AI Knowledge Base Expansion Tool")
    print("=" * 60)
    
    # Load existing data
    data, base_dir = load_existing_data()
    
    if not data:
        print("Error: Could not load existing data")
        return
    
    print(f"Loaded {len(data.get('condition_mapping', {}))} existing conditions")
    print(f"Loaded {len(data.get('common_conditions', pd.DataFrame()))} condition records")
    print(f"Loaded {len(data.get('lab_tests', pd.DataFrame()))} test records")
    print(f"Loaded {len(data.get('treatments', pd.DataFrame()))} treatment records")
    
    # Expand knowledge base
    data = add_cardiovascular_conditions(data, base_dir)
    data = add_respiratory_conditions(data, base_dir)
    data = add_neurological_conditions(data, base_dir)
    data = add_new_tests(data, base_dir)
    data = add_new_treatments(data, base_dir)
    
    # Save updated data
    save_updated_data(data, base_dir)
    
    print("=" * 60)
    print("Knowledge base expansion completed!")
    print(f"Total conditions: {len(data['condition_mapping'])}")
    print(f"Total tests: {len(data['lab_tests'])}")
    print(f"Total treatments: {len(data['treatments'])}")
    print("=" * 60)
    print("You can now run the training script to update your AI models:")
    print("python train_ai_models.py --mode enhanced")

if __name__ == "__main__":
    main() 