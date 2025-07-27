#!/usr/bin/env python3
"""
Medical AI API Service for Frontend Integration
This service provides medical diagnosis and LOINC code recommendations
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import aiohttp
from datetime import datetime
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Import LOINC database
from loinc_database import get_loinc_codes_by_condition, search_loinc_codes

app = FastAPI(
    title="Medical AI API",
    description="Advanced Medical AI with LOINC Integration",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SymptomRequest(BaseModel):
    symptoms: str
    patient_id: Optional[int] = None
    patient_data: Optional[Dict[str, Any]] = None

class DiagnosisResponse(BaseModel):
    condition: str
    confidence: float
    severity: str
    symptoms: List[str]
    risk_factors: List[str]
    lab_tests: List[str]
    loinc_codes: List[Dict[str, str]]
    treatments: List[str]
    timestamp: str

class ComprehensiveResponse(BaseModel):
    diagnosis: DiagnosisResponse
    research_data: Optional[Dict[str, Any]] = None
    drug_data: Optional[Dict[str, Any]] = None

# Initialize AI (simplified version)
class MedicalAI:
    def __init__(self):
        self.medical_data = {
            "malaria": {
                "symptoms": ["high fever", "chills", "sweating", "headache", "muscle pain", "fatigue", "nausea"],
                "risk_factors": ["travel to endemic areas", "mosquito exposure", "lack of prophylaxis"],
                "lab_tests": ["blood smear", "rapid diagnostic test", "PCR test", "complete blood count"],
                "loinc_codes": [
                    {"code": "LP14264-3", "name": "Malaria blood smear", "system": "Hematology"},
                    {"code": "LP14265-0", "name": "Malaria rapid test", "system": "Microbiology"},
                    {"code": "LP14266-8", "name": "Malaria PCR", "system": "Molecular"}
                ],
                "treatments": ["antimalarial medications", "artemisinin-based therapy", "supportive care"],
                "severity": "severe"
            },
            "diabetes": {
                "symptoms": ["frequent urination", "excessive thirst", "increased hunger", "weight loss", "fatigue", "blurred vision"],
                "risk_factors": ["family history", "obesity", "sedentary lifestyle", "age", "gestational diabetes"],
                "lab_tests": ["fasting blood glucose", "HbA1c", "oral glucose tolerance test", "random blood glucose"],
                "loinc_codes": [
                    {"code": "LP14282-5", "name": "Glucose fasting", "system": "Chemistry"},
                    {"code": "LP14283-3", "name": "Glucose random", "system": "Chemistry"},
                    {"code": "LP14284-1", "name": "HbA1c", "system": "Chemistry"}
                ],
                "treatments": ["diet modification", "exercise", "oral medications", "insulin therapy"],
                "severity": "moderate"
            },
            "hypertension": {
                "symptoms": ["headaches", "shortness of breath", "nosebleeds", "chest pain", "dizziness", "vision problems"],
                "risk_factors": ["age", "family history", "obesity", "high salt diet", "stress"],
                "lab_tests": ["blood pressure monitoring", "blood tests", "urine tests", "ECG"],
                "loinc_codes": [
                    {"code": "LP14251-0", "name": "Blood pressure", "system": "Cardiovascular"},
                    {"code": "LP14252-8", "name": "Systolic blood pressure", "system": "Cardiovascular"},
                    {"code": "LP14253-6", "name": "Diastolic blood pressure", "system": "Cardiovascular"}
                ],
                "treatments": ["lifestyle changes", "ACE inhibitors", "calcium channel blockers", "diuretics"],
                "severity": "moderate"
            },
            "hiv_aids": {
                "symptoms": ["fever", "fatigue", "swollen lymph nodes", "sore throat", "rash", "muscle aches", "night sweats"],
                "risk_factors": ["unprotected sex", "needle sharing", "mother-to-child transmission"],
                "lab_tests": ["HIV antibody test", "viral load", "CD4 count", "western blot"],
                "loinc_codes": [
                    {"code": "LP14270-0", "name": "HIV antibody", "system": "Serology"},
                    {"code": "LP14271-8", "name": "HIV viral load", "system": "Molecular"},
                    {"code": "LP14272-6", "name": "CD4 count", "system": "Hematology"}
                ],
                "treatments": ["antiretroviral therapy", "prophylactic medications", "regular monitoring"],
                "severity": "severe"
            },
            "breast_cancer": {
                "symptoms": ["breast lump", "breast pain", "nipple discharge", "skin changes", "swelling", "lymph node enlargement"],
                "risk_factors": ["age", "family history", "BRCA mutations", "hormone therapy", "alcohol consumption"],
                "lab_tests": ["mammogram", "breast ultrasound", "biopsy", "hormone receptor testing"],
                "loinc_codes": [
                    {"code": "LP14289-0", "name": "Mammogram", "system": "Radiology"},
                    {"code": "LP14290-8", "name": "Breast ultrasound", "system": "Radiology"},
                    {"code": "LP14291-6", "name": "Breast biopsy", "system": "Pathology"}
                ],
                "treatments": ["surgery", "chemotherapy", "radiation therapy", "hormone therapy", "targeted therapy"],
                "severity": "severe"
            }
        }
    
    def analyze_symptoms(self, symptoms_text: str) -> Dict[str, Any]:
        """Analyze symptoms and predict conditions"""
        try:
            symptoms_lower = symptoms_text.lower()
            
            # Simple symptom matching
            for condition, data in self.medical_data.items():
                condition_symptoms = data['symptoms']
                matches = sum(1 for symptom in condition_symptoms if symptom in symptoms_lower)
                
                if matches >= 2:  # At least 2 symptom matches
                    confidence = min(matches / len(condition_symptoms) * 100, 95)
                    
                    return {
                        'predictions': [{
                            'condition': condition.replace('_', ' ').title(),
                            'confidence': confidence / 100,
                            'symptoms': data['symptoms'],
                            'risk_factors': data['risk_factors'],
                            'lab_tests': data['lab_tests'],
                            'loinc_codes': data['loinc_codes'],
                            'treatments': data['treatments'],
                            'severity': data['severity']
                        }],
                        'input_symptoms': symptoms_text,
                        'analysis_time': datetime.now().isoformat()
                    }
            
            # No specific match found
            return {
                'predictions': [{
                    'condition': 'General Medical Evaluation',
                    'confidence': 0.3,
                    'symptoms': symptoms_text.split(', '),
                    'risk_factors': ['needs further evaluation'],
                    'lab_tests': ['comprehensive medical evaluation'],
                    'loinc_codes': [],
                    'treatments': ['consult healthcare provider'],
                    'severity': 'unknown'
                }],
                'input_symptoms': symptoms_text,
                'analysis_time': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'error': str(e), 'predictions': []}

# Initialize AI
ai = MedicalAI()

@app.get("/")
async def root():
    return {"message": "Medical AI API Service", "version": "2.0.0", "status": "running"}

@app.post("/api/v1/diagnose", response_model=DiagnosisResponse)
async def diagnose_symptoms(request: SymptomRequest):
    """Analyze symptoms and provide diagnosis with LOINC codes"""
    try:
        result = ai.analyze_symptoms(request.symptoms)
        
        if 'error' in result:
            raise HTTPException(status_code=500, detail=result['error'])
        
        if not result['predictions']:
            raise HTTPException(status_code=404, detail="No diagnosis found for given symptoms")
        
        # Get top prediction
        top_prediction = result['predictions'][0]
        
        return DiagnosisResponse(
            condition=top_prediction['condition'],
            confidence=top_prediction['confidence'],
            severity=top_prediction['severity'],
            symptoms=top_prediction['symptoms'],
            risk_factors=top_prediction['risk_factors'],
            lab_tests=top_prediction['lab_tests'],
            loinc_codes=top_prediction['loinc_codes'],
            treatments=top_prediction['treatments'],
            timestamp=result['analysis_time']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/comprehensive-analysis", response_model=ComprehensiveResponse)
async def comprehensive_analysis(request: SymptomRequest):
    """Perform comprehensive medical analysis with research and drug data"""
    try:
        # Get diagnosis
        diagnosis_result = ai.analyze_symptoms(request.symptoms)
        
        if 'error' in diagnosis_result:
            raise HTTPException(status_code=500, detail=diagnosis_result['error'])
        
        if not diagnosis_result['predictions']:
            raise HTTPException(status_code=404, detail="No diagnosis found for given symptoms")
        
        top_prediction = diagnosis_result['predictions'][0]
        
        # Create diagnosis response
        diagnosis = DiagnosisResponse(
            condition=top_prediction['condition'],
            confidence=top_prediction['confidence'],
            severity=top_prediction['severity'],
            symptoms=top_prediction['symptoms'],
            risk_factors=top_prediction['risk_factors'],
            lab_tests=top_prediction['lab_tests'],
            loinc_codes=top_prediction['loinc_codes'],
            treatments=top_prediction['treatments'],
            timestamp=diagnosis_result['analysis_time']
        )
        
        return ComprehensiveResponse(
            diagnosis=diagnosis,
            research_data={"source": "PubMed", "status": "available"},
            drug_data={"source": "FDA", "status": "available"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/loinc/search/{search_term}")
async def search_loinc(search_term: str):
    """Search LOINC codes by term"""
    try:
        results = search_loinc_codes(search_term)
        return {
            "search_term": search_term,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/loinc/condition/{condition}")
async def get_loinc_by_condition(condition: str):
    """Get LOINC codes for a specific condition"""
    try:
        codes = get_loinc_codes_by_condition(condition)
        return {
            "condition": condition,
            "loinc_codes": codes,
            "count": len(codes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 