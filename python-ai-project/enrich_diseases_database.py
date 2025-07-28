import json
import os

# Example enrichment data for common diseases
ENRICHMENT = {
    "Common Cold": {
        "symptoms": ["cough", "runny nose", "sore throat", "sneezing", "mild fever"],
        "treatments": ["rest", "fluids", "paracetamol", "decongestants"],
        "lab_tests": [],
        "drug_interactions": [],
        "severity": "mild"
    },
    "Influenza": {
        "symptoms": ["fever", "chills", "muscle aches", "cough", "congestion", "runny nose", "fatigue"],
        "treatments": ["rest", "fluids", "antiviral medications", "paracetamol"],
        "lab_tests": ["Rapid influenza diagnostic test"],
        "drug_interactions": [],
        "severity": "moderate"
    },
    "Gastroenteritis": {
        "symptoms": ["vomiting", "diarrhea", "abdominal pain", "nausea", "fever"],
        "treatments": ["oral rehydration", "rest", "antidiarrheal medications (if needed)", "antipyretics"],
        "lab_tests": ["Stool culture"],
        "drug_interactions": [],
        "severity": "mild"
    },
    "Pneumonia": {
        "symptoms": ["cough", "fever", "shortness of breath", "chest pain", "fatigue"],
        "treatments": ["antibiotics", "rest", "fluids", "oxygen therapy (if severe)"],
        "lab_tests": ["Chest X-ray", "Sputum culture", "CBC"],
        "drug_interactions": [],
        "severity": "severe"
    },
    "Diabetes Mellitus": {
        "symptoms": ["increased thirst", "frequent urination", "hunger", "fatigue", "blurred vision"],
        "treatments": ["insulin", "oral hypoglycemics", "diet modification", "exercise"],
        "lab_tests": ["Fasting blood glucose", "HbA1c"],
        "drug_interactions": [],
        "severity": "chronic"
    }
}

def enrich_database(db_path):
    with open(db_path, 'r') as f:
        db = json.load(f)
    updated = 0
    for disease, enrich in ENRICHMENT.items():
        # Try both original and lowercase keys
        for key in [disease, disease.lower()]:
            if key in db:
                entry = db[key]
                changed = False
                for field, value in enrich.items():
                    if not entry.get(field):
                        entry[field] = value
                        changed = True
                if changed:
                    updated += 1
            else:
                # Add new entry if not present
                db[key] = enrich
                updated += 1
    with open(db_path, 'w') as f:
        json.dump(db, f, indent=2)
    print(f"Enriched {updated} disease entries.")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'data', 'diseases_database.json')
    enrich_database(db_path) 