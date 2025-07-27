#!/usr/bin/env python3
"""
Comprehensive LOINC Database for Medical Laboratory Tests
This file contains standardized LOINC codes for various medical conditions and lab tests
"""

LOINC_DATABASE = {
    # Cardiovascular System
    "cardiovascular": {
        "blood_pressure": [
            {"code": "85354-9", "name": "Blood pressure panel", "system": "Cardiovascular"},
            {"code": "8480-6", "name": "Systolic blood pressure", "system": "Cardiovascular"},
            {"code": "8462-4", "name": "Diastolic blood pressure", "system": "Cardiovascular"},
            {"code": "8357-6", "name": "Blood pressure", "system": "Cardiovascular"}
        ],
        "cardiac_markers": [
            {"code": "10839-9", "name": "Troponin I", "system": "Cardiovascular"},
            {"code": "6598-7", "name": "Troponin T", "system": "Cardiovascular"},
            {"code": "2154-3", "name": "CK-MB", "system": "Cardiovascular"},
            {"code": "2157-6", "name": "Creatine kinase", "system": "Cardiovascular"},
            {"code": "2158-4", "name": "Creatine kinase MB", "system": "Cardiovascular"}
        ],
        "ecg": [
            {"code": "11524-6", "name": "ECG", "system": "Cardiovascular"},
            {"code": "11525-3", "name": "ECG interpretation", "system": "Cardiovascular"}
        ]
    },
    
    # Hematology
    "hematology": {
        "complete_blood_count": [
            {"code": "58410-2", "name": "CBC panel", "system": "Hematology"},
            {"code": "789-8", "name": "RBC count", "system": "Hematology"},
            {"code": "718-7", "name": "Hemoglobin", "system": "Hematology"},
            {"code": "4544-3", "name": "Hematocrit", "system": "Hematology"},
            {"code": "6690-2", "name": "WBC count", "system": "Hematology"},
            {"code": "777-3", "name": "Platelet count", "system": "Hematology"}
        ],
        "coagulation": [
            {"code": "3255-7", "name": "Fibrinogen", "system": "Hematology"},
            {"code": "3173-2", "name": "D-dimer", "system": "Hematology"},
            {"code": "5901-2", "name": "Prothrombin time", "system": "Hematology"},
            {"code": "3175-7", "name": "Activated partial thromboplastin time", "system": "Hematology"}
        ]
    },
    
    # Chemistry
    "chemistry": {
        "glucose": [
            {"code": "1558-6", "name": "Glucose fasting", "system": "Chemistry"},
            {"code": "2339-0", "name": "Glucose random", "system": "Chemistry"},
            {"code": "14771-0", "name": "Glucose 2 hour post meal", "system": "Chemistry"},
            {"code": "4548-4", "name": "HbA1c", "system": "Chemistry"}
        ],
        "kidney_function": [
            {"code": "2160-0", "name": "Creatinine", "system": "Chemistry"},
            {"code": "3094-0", "name": "BUN", "system": "Chemistry"},
            {"code": "14957-5", "name": "eGFR", "system": "Chemistry"},
            {"code": "14958-3", "name": "eGFR African American", "system": "Chemistry"}
        ],
        "liver_function": [
            {"code": "1742-6", "name": "Alanine aminotransferase", "system": "Chemistry"},
            {"code": "1743-4", "name": "Aspartate aminotransferase", "system": "Chemistry"},
            {"code": "1968-7", "name": "Bilirubin total", "system": "Chemistry"},
            {"code": "1975-2", "name": "Bilirubin direct", "system": "Chemistry"},
            {"code": "2885-2", "name": "Protein total", "system": "Chemistry"},
            {"code": "1751-7", "name": "Albumin", "system": "Chemistry"}
        ],
        "electrolytes": [
            {"code": "2823-3", "name": "Potassium", "system": "Chemistry"},
            {"code": "2951-2", "name": "Sodium", "system": "Chemistry"},
            {"code": "2075-0", "name": "Chloride", "system": "Chemistry"},
            {"code": "17861-6", "name": "Carbon dioxide", "system": "Chemistry"}
        ],
        "lipids": [
            {"code": "2093-3", "name": "Cholesterol total", "system": "Chemistry"},
            {"code": "2085-9", "name": "HDL cholesterol", "system": "Chemistry"},
            {"code": "13457-7", "name": "LDL cholesterol", "system": "Chemistry"},
            {"code": "2571-8", "name": "Triglycerides", "system": "Chemistry"}
        ]
    },
    
    # Microbiology
    "microbiology": {
        "blood_culture": [
            {"code": "600-7", "name": "Blood culture", "system": "Microbiology"},
            {"code": "601-5", "name": "Blood culture aerobic", "system": "Microbiology"},
            {"code": "602-3", "name": "Blood culture anaerobic", "system": "Microbiology"}
        ],
        "urine_culture": [
            {"code": "630-4", "name": "Urine culture", "system": "Microbiology"},
            {"code": "631-2", "name": "Urine culture routine", "system": "Microbiology"}
        ],
        "sputum_culture": [
            {"code": "634-6", "name": "Sputum culture", "system": "Microbiology"},
            {"code": "635-3", "name": "Sputum culture routine", "system": "Microbiology"}
        ]
    },
    
    # Immunology/Serology
    "immunology": {
        "hiv": [
            {"code": "75622-1", "name": "HIV 1+2 Ab", "system": "Serology"},
            {"code": "75621-3", "name": "HIV 1 Ab", "system": "Serology"},
            {"code": "75620-5", "name": "HIV 2 Ab", "system": "Serology"},
            {"code": "25836-8", "name": "HIV viral load", "system": "Molecular"},
            {"code": "75622-1", "name": "HIV western blot", "system": "Serology"}
        ],
        "hepatitis": [
            {"code": "22321-5", "name": "Hepatitis B surface Ag", "system": "Serology"},
            {"code": "22322-3", "name": "Hepatitis B surface Ab", "system": "Serology"},
            {"code": "22325-6", "name": "Hepatitis B core Ab", "system": "Serology"},
            {"code": "22326-4", "name": "Hepatitis C Ab", "system": "Serology"}
        ],
        "syphilis": [
            {"code": "20507-9", "name": "Syphilis Ab", "system": "Serology"},
            {"code": "20508-7", "name": "Syphilis RPR", "system": "Serology"},
            {"code": "20509-5", "name": "Syphilis FTA-ABS", "system": "Serology"}
        ]
    },
    
    # Molecular
    "molecular": {
        "pcr": [
            {"code": "25836-8", "name": "HIV viral load", "system": "Molecular"},
            {"code": "25837-6", "name": "HCV viral load", "system": "Molecular"},
            {"code": "25838-4", "name": "HBV viral load", "system": "Molecular"},
            {"code": "25839-2", "name": "CMV viral load", "system": "Molecular"}
        ],
        "genetic": [
            {"code": "25840-0", "name": "BRCA1 mutation", "system": "Molecular"},
            {"code": "25841-8", "name": "BRCA2 mutation", "system": "Molecular"},
            {"code": "25842-6", "name": "CFTR mutation", "system": "Molecular"}
        ]
    },
    
    # Radiology
    "radiology": {
        "chest": [
            {"code": "39926-1", "name": "Chest X-ray", "system": "Radiology"},
            {"code": "39927-9", "name": "Chest CT", "system": "Radiology"},
            {"code": "39928-7", "name": "Chest MRI", "system": "Radiology"}
        ],
        "abdomen": [
            {"code": "39929-5", "name": "Abdomen X-ray", "system": "Radiology"},
            {"code": "39930-3", "name": "Abdomen CT", "system": "Radiology"},
            {"code": "39931-1", "name": "Abdomen ultrasound", "system": "Radiology"}
        ],
        "breast": [
            {"code": "39932-9", "name": "Mammogram", "system": "Radiology"},
            {"code": "39933-7", "name": "Breast ultrasound", "system": "Radiology"},
            {"code": "39934-5", "name": "Breast MRI", "system": "Radiology"}
        ]
    },
    
    # Urinalysis
    "urinalysis": {
        "routine": [
            {"code": "5803-2", "name": "Urinalysis", "system": "Urinalysis"},
            {"code": "5804-0", "name": "Urine color", "system": "Urinalysis"},
            {"code": "5805-7", "name": "Urine appearance", "system": "Urinalysis"},
            {"code": "5806-5", "name": "Urine specific gravity", "system": "Urinalysis"},
            {"code": "5807-3", "name": "Urine pH", "system": "Urinalysis"},
            {"code": "5808-1", "name": "Urine protein", "system": "Urinalysis"},
            {"code": "5809-9", "name": "Urine glucose", "system": "Urinalysis"},
            {"code": "5810-7", "name": "Urine ketones", "system": "Urinalysis"},
            {"code": "5811-5", "name": "Urine blood", "system": "Urinalysis"},
            {"code": "5812-3", "name": "Urine leukocytes", "system": "Urinalysis"},
            {"code": "5813-1", "name": "Urine nitrite", "system": "Urinalysis"}
        ]
    },
    
    # Pathology
    "pathology": {
        "biopsy": [
            {"code": "25843-4", "name": "Breast biopsy", "system": "Pathology"},
            {"code": "25844-2", "name": "Lung biopsy", "system": "Pathology"},
            {"code": "25845-9", "name": "Liver biopsy", "system": "Pathology"},
            {"code": "25846-7", "name": "Kidney biopsy", "system": "Pathology"}
        ],
        "immunohistochemistry": [
            {"code": "25847-5", "name": "Estrogen receptor", "system": "Pathology"},
            {"code": "25848-3", "name": "Progesterone receptor", "system": "Pathology"},
            {"code": "25849-1", "name": "HER2", "system": "Pathology"},
            {"code": "25850-9", "name": "Ki-67", "system": "Pathology"}
        ]
    }
}

def get_loinc_codes_by_condition(condition: str) -> list:
    """Get LOINC codes for a specific medical condition"""
    condition_mapping = {
        "diabetes": LOINC_DATABASE["chemistry"]["glucose"] + LOINC_DATABASE["chemistry"]["kidney_function"],
        "hypertension": LOINC_DATABASE["cardiovascular"]["blood_pressure"] + LOINC_DATABASE["chemistry"]["kidney_function"],
        "heart_attack": LOINC_DATABASE["cardiovascular"]["cardiac_markers"] + LOINC_DATABASE["cardiovascular"]["ecg"],
        "malaria": LOINC_DATABASE["hematology"]["complete_blood_count"],
        "hiv": LOINC_DATABASE["immunology"]["hiv"] + LOINC_DATABASE["hematology"]["complete_blood_count"],
        "tuberculosis": LOINC_DATABASE["microbiology"]["sputum_culture"] + LOINC_DATABASE["radiology"]["chest"],
        "pneumonia": LOINC_DATABASE["microbiology"]["sputum_culture"] + LOINC_DATABASE["radiology"]["chest"] + LOINC_DATABASE["hematology"]["complete_blood_count"],
        "breast_cancer": LOINC_DATABASE["radiology"]["breast"] + LOINC_DATABASE["pathology"]["biopsy"] + LOINC_DATABASE["pathology"]["immunohistochemistry"],
        "gastritis": LOINC_DATABASE["radiology"]["abdomen"],
        "appendicitis": LOINC_DATABASE["radiology"]["abdomen"] + LOINC_DATABASE["hematology"]["complete_blood_count"]
    }
    
    return condition_mapping.get(condition.lower(), [])

def get_loinc_codes_by_system(system: str) -> list:
    """Get LOINC codes for a specific laboratory system"""
    return LOINC_DATABASE.get(system.lower(), {})

def search_loinc_codes(search_term: str) -> list:
    """Search LOINC codes by name or code"""
    results = []
    search_term = search_term.lower()
    
    for category, systems in LOINC_DATABASE.items():
        for system, tests in systems.items():
            for test in tests:
                if (search_term in test["name"].lower() or 
                    search_term in test["code"].lower() or
                    search_term in test["system"].lower()):
                    results.append(test)
    
    return results

if __name__ == "__main__":
    # Test the LOINC database
    print("🔬 LOINC Database Test")
    print("=" * 50)
    
    # Test condition-based lookup
    diabetes_codes = get_loinc_codes_by_condition("diabetes")
    print(f"📋 Diabetes LOINC codes: {len(diabetes_codes)} found")
    for code in diabetes_codes[:3]:
        print(f"  • {code['code']}: {code['name']}")
    
    # Test system-based lookup
    cardio_codes = get_loinc_codes_by_system("cardiovascular")
    print(f"\n❤️ Cardiovascular LOINC codes: {len(cardio_codes)} found")
    for system_name, codes in cardio_codes.items():
        print(f"  {system_name}: {len(codes)} codes")
        for code in codes[:2]:  # Show first 2 codes per system
            print(f"    • {code['code']}: {code['name']}")
    
    # Test search
    search_results = search_loinc_codes("glucose")
    print(f"\n🔍 Glucose search results: {len(search_results)} found")
    for result in search_results[:3]:
        print(f"  • {result['code']}: {result['name']} ({result['system']})") 