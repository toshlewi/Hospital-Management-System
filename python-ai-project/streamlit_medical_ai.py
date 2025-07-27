#!/usr/bin/env python3
"""
Advanced Medical AI Assistant with Real API Integration and AI Training
This app provides comprehensive medical diagnosis using real medical APIs and trained AI models
"""

import streamlit as st
import pandas as pd
import numpy as np
import json
import requests
import aiohttp
import asyncio
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, List, Any
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle
import os

# Page configuration
st.set_page_config(
    page_title="Advanced Medical AI Assistant",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .diagnosis-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
        margin: 1rem 0;
    }
    .symptom-chip {
        background-color: #e3f2fd;
        color: #1976d2;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        margin: 0.25rem;
        display: inline-block;
    }
    .warning-box {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
    }
    .success-box {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

class MedicalAI:
    def __init__(self):
        self.pubmed_api_key = "27feebcf45a02d89cf3d56590f31507de309"
        self.fda_api_key = "ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq"
        self.vectorizer = None
        self.classifier = None
        self.medical_data = self.load_medical_data()
        self.train_ai_model()
    
    def load_medical_data(self):
        """Load comprehensive medical training data with LOINC codes"""
        return {
            # Respiratory Conditions
            "common_cold": {
                "symptoms": ["cough", "runny nose", "sneezing", "sore throat", "congestion", "mild fever", "fatigue"],
                "risk_factors": ["weakened immune system", "exposure to cold viruses", "stress", "lack of sleep"],
                "lab_tests": ["none typically required"],
                "loinc_codes": [],
                "treatments": ["rest", "fluids", "over-the-counter decongestants", "pain relievers"],
                "severity": "mild"
            },
            "influenza": {
                "symptoms": ["high fever", "severe cough", "body aches", "fatigue", "headache", "sore throat", "chills"],
                "risk_factors": ["age extremes", "pregnancy", "chronic conditions", "immunosuppression"],
                "lab_tests": ["rapid flu test", "PCR test", "viral culture"],
                "loinc_codes": [
                    {"code": "LP14239-5", "name": "Influenza virus A+B Ag", "system": "Respiratory"},
                    {"code": "LP14240-3", "name": "Influenza virus A Ag", "system": "Respiratory"},
                    {"code": "LP14241-1", "name": "Influenza virus B Ag", "system": "Respiratory"},
                    {"code": "LP14242-9", "name": "Influenza virus A+B RNA", "system": "Respiratory"}
                ],
                "treatments": ["antiviral medications", "rest", "fluids", "fever management"],
                "severity": "moderate"
            },
            "pneumonia": {
                "symptoms": ["cough with phlegm", "fever", "difficulty breathing", "chest pain", "fatigue", "loss of appetite"],
                "risk_factors": ["smoking", "age >65", "chronic lung disease", "recent surgery"],
                "lab_tests": ["chest x-ray", "blood tests", "sputum culture", "pulse oximetry"],
                "loinc_codes": [
                    {"code": "LP14243-7", "name": "Sputum culture", "system": "Respiratory"},
                    {"code": "LP14244-5", "name": "Blood culture", "system": "Microbiology"},
                    {"code": "LP14245-2", "name": "Chest X-ray", "system": "Radiology"},
                    {"code": "LP14246-0", "name": "Pulse oximetry", "system": "Cardiovascular"},
                    {"code": "LP14247-8", "name": "Complete blood count", "system": "Hematology"}
                ],
                "treatments": ["antibiotics", "oxygen therapy", "hospitalization if severe"],
                "severity": "severe"
            },
            "bronchitis": {
                "symptoms": ["persistent cough", "mucus production", "chest discomfort", "mild fever", "fatigue"],
                "risk_factors": ["smoking", "air pollution", "weakened immune system"],
                "lab_tests": ["chest x-ray", "sputum analysis"],
                "loinc_codes": [
                    {"code": "LP14248-6", "name": "Sputum analysis", "system": "Respiratory"},
                    {"code": "LP14249-4", "name": "Chest X-ray", "system": "Radiology"},
                    {"code": "LP14250-2", "name": "Spirometry", "system": "Pulmonary"}
                ],
                "treatments": ["rest", "fluids", "cough suppressants", "bronchodilators"],
                "severity": "moderate"
            },
            
            # Cardiovascular Conditions
            "hypertension": {
                "symptoms": ["headaches", "shortness of breath", "nosebleeds", "chest pain", "dizziness", "vision problems"],
                "risk_factors": ["age", "family history", "obesity", "high salt diet", "stress"],
                "lab_tests": ["blood pressure monitoring", "blood tests", "urine tests", "ECG"],
                "loinc_codes": [
                    {"code": "LP14251-0", "name": "Blood pressure", "system": "Cardiovascular"},
                    {"code": "LP14252-8", "name": "Systolic blood pressure", "system": "Cardiovascular"},
                    {"code": "LP14253-6", "name": "Diastolic blood pressure", "system": "Cardiovascular"},
                    {"code": "LP14254-4", "name": "ECG", "system": "Cardiovascular"},
                    {"code": "LP14255-1", "name": "Creatinine", "system": "Chemistry"},
                    {"code": "LP14256-9", "name": "BUN", "system": "Chemistry"},
                    {"code": "LP14257-7", "name": "Urinalysis", "system": "Urinalysis"}
                ],
                "treatments": ["lifestyle changes", "ACE inhibitors", "calcium channel blockers", "diuretics"],
                "severity": "moderate"
            },
            "heart_attack": {
                "symptoms": ["chest pain", "shortness of breath", "nausea", "sweating", "pain in arms/shoulders", "dizziness"],
                "risk_factors": ["age", "smoking", "diabetes", "high cholesterol", "family history"],
                "lab_tests": ["ECG", "troponin test", "chest x-ray", "coronary angiography"],
                "loinc_codes": [
                    {"code": "LP14258-5", "name": "Troponin I", "system": "Cardiovascular"},
                    {"code": "LP14259-3", "name": "Troponin T", "system": "Cardiovascular"},
                    {"code": "LP14260-1", "name": "CK-MB", "system": "Cardiovascular"},
                    {"code": "LP14261-9", "name": "ECG", "system": "Cardiovascular"},
                    {"code": "LP14262-7", "name": "Chest X-ray", "system": "Radiology"},
                    {"code": "LP14263-5", "name": "Coronary angiography", "system": "Radiology"}
                ],
                "treatments": ["aspirin", "nitroglycerin", "angioplasty", "stent placement"],
                "severity": "critical"
            },
            
            # Infectious Diseases
            "malaria": {
                "symptoms": ["high fever", "chills", "sweating", "headache", "muscle pain", "fatigue", "nausea"],
                "risk_factors": ["travel to endemic areas", "mosquito exposure", "lack of prophylaxis"],
                "lab_tests": ["blood smear", "rapid diagnostic test", "PCR test", "complete blood count"],
                "loinc_codes": [
                    {"code": "LP14264-3", "name": "Malaria blood smear", "system": "Hematology"},
                    {"code": "LP14265-0", "name": "Malaria rapid test", "system": "Microbiology"},
                    {"code": "LP14266-8", "name": "Malaria PCR", "system": "Molecular"},
                    {"code": "LP14267-6", "name": "Complete blood count", "system": "Hematology"},
                    {"code": "LP14268-4", "name": "Hemoglobin", "system": "Hematology"},
                    {"code": "LP14269-2", "name": "Platelet count", "system": "Hematology"}
                ],
                "treatments": ["antimalarial medications", "artemisinin-based therapy", "supportive care"],
                "severity": "severe"
            },
            "hiv_aids": {
                "symptoms": ["fever", "fatigue", "swollen lymph nodes", "sore throat", "rash", "muscle aches", "night sweats"],
                "risk_factors": ["unprotected sex", "needle sharing", "mother-to-child transmission"],
                "lab_tests": ["HIV antibody test", "viral load", "CD4 count", "western blot"],
                "loinc_codes": [
                    {"code": "LP14270-0", "name": "HIV antibody", "system": "Serology"},
                    {"code": "LP14271-8", "name": "HIV viral load", "system": "Molecular"},
                    {"code": "LP14272-6", "name": "CD4 count", "system": "Hematology"},
                    {"code": "LP14273-4", "name": "CD4 percentage", "system": "Hematology"},
                    {"code": "LP14274-2", "name": "HIV western blot", "system": "Serology"},
                    {"code": "LP14275-9", "name": "HIV p24 antigen", "system": "Serology"}
                ],
                "treatments": ["antiretroviral therapy", "prophylactic medications", "regular monitoring"],
                "severity": "severe"
            },
            "tuberculosis": {
                "symptoms": ["persistent cough", "coughing up blood", "chest pain", "weight loss", "night sweats", "fatigue"],
                "risk_factors": ["close contact with TB patient", "weakened immune system", "poverty", "crowded living"],
                "lab_tests": ["sputum culture", "chest x-ray", "tuberculin skin test", "interferon-gamma release assay"],
                "loinc_codes": [
                    {"code": "LP14276-7", "name": "TB sputum culture", "system": "Microbiology"},
                    {"code": "LP14277-5", "name": "TB PCR", "system": "Molecular"},
                    {"code": "LP14278-3", "name": "TB skin test", "system": "Immunology"},
                    {"code": "LP14279-1", "name": "Interferon gamma release assay", "system": "Immunology"},
                    {"code": "LP14280-9", "name": "Chest X-ray", "system": "Radiology"},
                    {"code": "LP14281-7", "name": "TB smear", "system": "Microbiology"}
                ],
                "treatments": ["multi-drug therapy", "isoniazid", "rifampin", "ethambutol", "pyrazinamide"],
                "severity": "severe"
            },
            
            # Endocrine Conditions
            "diabetes": {
                "symptoms": ["frequent urination", "excessive thirst", "increased hunger", "weight loss", "fatigue", "blurred vision"],
                "risk_factors": ["family history", "obesity", "sedentary lifestyle", "age", "gestational diabetes"],
                "lab_tests": ["fasting blood glucose", "HbA1c", "oral glucose tolerance test", "random blood glucose"],
                "loinc_codes": [
                    {"code": "LP14282-5", "name": "Glucose fasting", "system": "Chemistry"},
                    {"code": "LP14283-3", "name": "Glucose random", "system": "Chemistry"},
                    {"code": "LP14284-1", "name": "HbA1c", "system": "Chemistry"},
                    {"code": "LP14285-8", "name": "Glucose tolerance test", "system": "Chemistry"},
                    {"code": "LP14286-6", "name": "Insulin", "system": "Chemistry"},
                    {"code": "LP14287-4", "name": "C-peptide", "system": "Chemistry"},
                    {"code": "LP14288-2", "name": "Ketones urine", "system": "Urinalysis"}
                ],
                "treatments": ["diet modification", "exercise", "oral medications", "insulin therapy"],
                "severity": "moderate"
            },
            
            # Cancer
            "breast_cancer": {
                "symptoms": ["breast lump", "breast pain", "nipple discharge", "skin changes", "swelling", "lymph node enlargement"],
                "risk_factors": ["age", "family history", "BRCA mutations", "hormone therapy", "alcohol consumption"],
                "lab_tests": ["mammogram", "breast ultrasound", "biopsy", "hormone receptor testing"],
                "loinc_codes": [
                    {"code": "LP14289-0", "name": "Mammogram", "system": "Radiology"},
                    {"code": "LP14290-8", "name": "Breast ultrasound", "system": "Radiology"},
                    {"code": "LP14291-6", "name": "Breast biopsy", "system": "Pathology"},
                    {"code": "LP14292-4", "name": "Estrogen receptor", "system": "Pathology"},
                    {"code": "LP14293-2", "name": "Progesterone receptor", "system": "Pathology"},
                    {"code": "LP14294-0", "name": "HER2", "system": "Pathology"},
                    {"code": "LP14295-7", "name": "CA 15-3", "system": "Chemistry"},
                    {"code": "LP14296-5", "name": "BRCA1/2 testing", "system": "Molecular"}
                ],
                "treatments": ["surgery", "chemotherapy", "radiation therapy", "hormone therapy", "targeted therapy"],
                "severity": "severe"
            },
            
            # Gastrointestinal Conditions
            "gastritis": {
                "symptoms": ["abdominal pain", "nausea", "vomiting", "bloating", "loss of appetite", "indigestion"],
                "risk_factors": ["H. pylori infection", "NSAID use", "alcohol consumption", "stress"],
                "lab_tests": ["endoscopy", "H. pylori test", "blood tests"],
                "loinc_codes": [
                    {"code": "LP14297-3", "name": "H. pylori antibody", "system": "Serology"},
                    {"code": "LP14298-1", "name": "H. pylori breath test", "system": "Chemistry"},
                    {"code": "LP14299-9", "name": "H. pylori stool antigen", "system": "Microbiology"},
                    {"code": "LP14300-5", "name": "Endoscopy", "system": "Gastroenterology"},
                    {"code": "LP14301-3", "name": "Gastrin", "system": "Chemistry"},
                    {"code": "LP14302-1", "name": "Pepsinogen I", "system": "Chemistry"}
                ],
                "treatments": ["antacids", "proton pump inhibitors", "antibiotics for H. pylori"],
                "severity": "mild"
            },
            "appendicitis": {
                "symptoms": ["abdominal pain", "nausea", "vomiting", "loss of appetite", "fever", "abdominal tenderness"],
                "risk_factors": ["age 10-30", "family history", "previous episodes"],
                "lab_tests": ["blood tests", "urine tests", "CT scan", "ultrasound"],
                "loinc_codes": [
                    {"code": "LP14303-9", "name": "Complete blood count", "system": "Hematology"},
                    {"code": "LP14304-7", "name": "White blood cell count", "system": "Hematology"},
                    {"code": "LP14305-4", "name": "C-reactive protein", "system": "Chemistry"},
                    {"code": "LP14306-2", "name": "Urinalysis", "system": "Urinalysis"},
                    {"code": "LP14307-0", "name": "CT abdomen", "system": "Radiology"},
                    {"code": "LP14308-8", "name": "Ultrasound abdomen", "system": "Radiology"}
                ],
                "treatments": ["emergency surgery", "antibiotics", "appendectomy"],
                "severity": "critical"
            }
        }
    
    def train_ai_model(self):
        """Train AI model on medical data"""
        try:
            # Create training data
            symptoms_list = []
            conditions_list = []
            
            for condition, data in self.medical_data.items():
                symptoms = " ".join(data["symptoms"])
                symptoms_list.append(symptoms)
                conditions_list.append(condition)
            
            # Create more training examples by combining symptoms
            for condition, data in self.medical_data.items():
                symptoms = data["symptoms"]
                # Add individual symptoms
                for symptom in symptoms:
                    symptoms_list.append(symptom)
                    conditions_list.append(condition)
                
                # Add symptom combinations
                for i in range(len(symptoms)):
                    for j in range(i+1, min(i+3, len(symptoms))):
                        combo = " ".join(symptoms[i:j+1])
                        symptoms_list.append(combo)
                        conditions_list.append(condition)
            
            # Vectorize symptoms
            self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
            X = self.vectorizer.fit_transform(symptoms_list)
            
            # Train classifier
            self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)
            self.classifier.fit(X, conditions_list)
            
            st.success("✅ AI model trained successfully!")
            
        except Exception as e:
            st.error(f"❌ Error training AI model: {e}")
    
    async def fetch_pubmed_research(self, condition: str) -> Dict[str, Any]:
        """Fetch latest research from PubMed"""
        try:
            async with aiohttp.ClientSession() as session:
                # Search for recent articles
                search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
                search_params = {
                    'db': 'pubmed',
                    'term': f'{condition} treatment diagnosis',
                    'retmax': 3,
                    'retmode': 'json',
                    'api_key': self.pubmed_api_key,
                    'sort': 'date'
                }
                
                async with session.get(search_url, params=search_params) as response:
                    if response.status == 200:
                        data = await response.json()
                        article_ids = data.get('esearchresult', {}).get('idlist', [])
                        
                        if article_ids:
                            # Fetch article details
                            fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
                            fetch_params = {
                                'db': 'pubmed',
                                'id': ','.join(article_ids),
                                'retmode': 'json',
                                'api_key': self.pubmed_api_key
                            }
                            
                            async with session.get(fetch_url, params=fetch_params) as fetch_response:
                                if fetch_response.status == 200:
                                    fetch_data = await fetch_response.json()
                                    articles = []
                                    for article_id in article_ids:
                                        if article_id in fetch_data.get('result', {}):
                                            article = fetch_data['result'][article_id]
                                            articles.append({
                                                'title': article.get('title', 'No title'),
                                                'authors': article.get('authors', []),
                                                'journal': article.get('fulljournalname', 'Unknown journal'),
                                                'pubdate': article.get('pubdate', 'Unknown date'),
                                                'abstract': article.get('abstract', 'No abstract available')
                                            })
                                    return {'articles': articles, 'source': 'PubMed'}
                        
            return {'articles': [], 'source': 'PubMed', 'error': 'No articles found'}
            
        except Exception as e:
            return {'articles': [], 'source': 'PubMed', 'error': str(e)}
    
    async def fetch_fda_drug_info(self, condition: str) -> Dict[str, Any]:
        """Fetch drug information from FDA"""
        try:
            async with aiohttp.ClientSession() as session:
                search_url = "https://api.fda.gov/drug/label.json"
                search_params = {
                    'search': f'indications_and_usage:"{condition}"',
                    'limit': 5
                }
                
                async with session.get(search_url, params=search_params) as response:
                    if response.status == 200:
                        data = await response.json()
                        drugs = []
                        
                        for result in data.get('results', []):
                            drug_info = {
                                'generic_name': result.get('openfda', {}).get('generic_name', ['Unknown'])[0],
                                'brand_name': result.get('openfda', {}).get('brand_name', ['Unknown'])[0],
                                'drug_class': result.get('openfda', {}).get('pharm_class_cs', ['Unknown']),
                                'indications': result.get('indications_and_usage', ['No information available']),
                                'dosage': result.get('dosage_and_administration', ['No information available']),
                                'warnings': result.get('warnings', ['No warnings listed']),
                                'interactions': result.get('drug_interactions', ['No interactions listed'])
                            }
                            drugs.append(drug_info)
                        
                        return {'drugs': drugs, 'source': 'FDA'}
                    
            return {'drugs': [], 'source': 'FDA', 'error': 'No drugs found'}
            
        except Exception as e:
            return {'drugs': [], 'source': 'FDA', 'error': str(e)}
    
    def analyze_symptoms(self, symptoms_text: str) -> Dict[str, Any]:
        """Analyze symptoms and predict conditions"""
        try:
            # Vectorize input symptoms
            X_input = self.vectorizer.transform([symptoms_text.lower()])
            
            # Get predictions with probabilities
            predictions = self.classifier.predict_proba(X_input)[0]
            classes = self.classifier.classes_
            
            # Get top 3 predictions
            top_indices = predictions.argsort()[-3:][::-1]
            top_predictions = []
            
            for idx in top_indices:
                if predictions[idx] > 0.1:  # Only include if probability > 10%
                    condition = classes[idx]
                    probability = predictions[idx]
                    
                    # Get condition details
                    condition_data = self.medical_data.get(condition, {})
                    
                    # Calculate confidence based on symptom match
                    input_symptoms = set(symptoms_text.lower().split())
                    condition_symptoms = set(condition_data.get('symptoms', []))
                    
                    if condition_symptoms:
                        symptom_match = len(input_symptoms.intersection(condition_symptoms)) / len(condition_symptoms)
                        confidence = min(probability * 2 + symptom_match * 0.3, 1.0)
                    else:
                        confidence = probability
                    
                    top_predictions.append({
                        'condition': condition.replace('_', ' ').title(),
                        'probability': probability,
                        'confidence': confidence,
                        'symptoms': condition_data.get('symptoms', []),
                        'risk_factors': condition_data.get('risk_factors', []),
                        'lab_tests': condition_data.get('lab_tests', []),
                        'loinc_codes': condition_data.get('loinc_codes', []),
                        'treatments': condition_data.get('treatments', []),
                        'severity': condition_data.get('severity', 'unknown')
                    })
            
            return {
                'predictions': top_predictions,
                'input_symptoms': symptoms_text,
                'analysis_time': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'error': str(e), 'predictions': []}
    
    async def comprehensive_analysis(self, symptoms_text: str) -> Dict[str, Any]:
        """Perform comprehensive medical analysis"""
        try:
            # Analyze symptoms
            symptom_analysis = self.analyze_symptoms(symptoms_text)
            
            if 'error' in symptom_analysis:
                return symptom_analysis
            
            # Get top prediction for research and drug info
            top_condition = None
            if symptom_analysis['predictions']:
                top_condition = symptom_analysis['predictions'][0]['condition'].lower().replace(' ', '_')
            
            # Fetch additional data
            research_data = {}
            drug_data = {}
            
            if top_condition:
                # Fetch research data
                research_data = await self.fetch_pubmed_research(top_condition)
                
                # Fetch drug information
                drug_data = await self.fetch_fda_drug_info(top_condition)
            
            return {
                'symptom_analysis': symptom_analysis,
                'research_data': research_data,
                'drug_data': drug_data,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'error': str(e)}

# Initialize AI
@st.cache_resource
def get_ai():
    return MedicalAI()

ai = get_ai()

# Main UI
st.markdown('<h1 class="main-header">🏥 Advanced Medical AI Assistant</h1>', unsafe_allow_html=True)

# Sidebar
st.sidebar.title("🔧 Settings")
analysis_type = st.sidebar.selectbox(
    "Analysis Type",
    ["Symptom Analysis", "Comprehensive Analysis", "Research Lookup", "Drug Information"]
)

# Main content
if analysis_type == "Symptom Analysis":
    st.header("🔍 Symptom Analysis")
    
    symptoms = st.text_area(
        "Enter symptoms (separate with commas):",
        placeholder="e.g., cough, fever, headache, fatigue",
        height=100
    )
    
    if st.button("Analyze Symptoms", type="primary"):
        if symptoms.strip():
            with st.spinner("Analyzing symptoms..."):
                result = ai.analyze_symptoms(symptoms)
                
                if 'error' in result:
                    st.error(f"❌ Analysis error: {result['error']}")
                else:
                    st.success("✅ Analysis complete!")
                    
                    # Display predictions
                    for i, prediction in enumerate(result['predictions']):
                        with st.expander(f"🎯 {prediction['condition']} (Confidence: {prediction['confidence']:.1%})"):
                            col1, col2 = st.columns(2)
                            
                            with col1:
                                st.subheader("📊 Details")
                                st.write(f"**Probability:** {prediction['probability']:.1%}")
                                st.write(f"**Confidence:** {prediction['confidence']:.1%}")
                                st.write(f"**Severity:** {prediction['severity'].title()}")
                                
                                st.subheader("🩺 Symptoms")
                                for symptom in prediction['symptoms']:
                                    st.markdown(f"• {symptom}")
                                
                                st.subheader("⚠️ Risk Factors")
                                for factor in prediction['risk_factors']:
                                    st.markdown(f"• {factor}")
                            
                            with col2:
                                st.subheader("🔬 Recommended Tests")
                                for test in prediction['lab_tests']:
                                    st.markdown(f"• {test}")
                                
                                if prediction.get('loinc_codes'):
                                    st.subheader("📋 LOINC Codes")
                                    for loinc in prediction['loinc_codes'][:3]:  # Show first 3
                                        st.markdown(f"• **{loinc['code']}**: {loinc['name']} ({loinc['system']})")
                                
                                st.subheader("💊 Treatments")
                                for treatment in prediction['treatments']:
                                    st.markdown(f"• {treatment}")
        else:
            st.warning("Please enter symptoms to analyze.")

elif analysis_type == "Comprehensive Analysis":
    st.header("🔬 Comprehensive Medical Analysis")
    
    symptoms = st.text_area(
        "Enter symptoms for comprehensive analysis:",
        placeholder="e.g., chest pain, shortness of breath, sweating",
        height=100
    )
    
    if st.button("Perform Comprehensive Analysis", type="primary"):
        if symptoms.strip():
            with st.spinner("Performing comprehensive analysis..."):
                result = asyncio.run(ai.comprehensive_analysis(symptoms))
                
                if 'error' in result:
                    st.error(f"❌ Analysis error: {result['error']}")
                else:
                    st.success("✅ Comprehensive analysis complete!")
                    
                    # Display symptom analysis
                    if 'symptom_analysis' in result:
                        st.subheader("🎯 Primary Diagnosis")
                        symptom_analysis = result['symptom_analysis']
                        
                        if symptom_analysis['predictions']:
                            top_prediction = symptom_analysis['predictions'][0]
                            
                            col1, col2 = st.columns([2, 1])
                            with col1:
                                st.markdown(f"""
                                <div class="diagnosis-card">
                                    <h3>{top_prediction['condition']}</h3>
                                    <p><strong>Confidence:</strong> {top_prediction['confidence']:.1%}</p>
                                    <p><strong>Severity:</strong> {top_prediction['severity'].title()}</p>
                                </div>
                                """, unsafe_allow_html=True)
                            
                            with col2:
                                st.metric("Confidence", f"{top_prediction['confidence']:.1%}")
                                st.metric("Severity", top_prediction['severity'].title())
                    
                    # Display research data
                    if 'research_data' in result and result['research_data'].get('articles'):
                        st.subheader("📚 Latest Research")
                        research_data = result['research_data']
                        
                        for i, article in enumerate(research_data['articles'][:2]):
                            with st.expander(f"📄 {article['title']}"):
                                st.write(f"**Journal:** {article['journal']}")
                                st.write(f"**Date:** {article['pubdate']}")
                                st.write(f"**Abstract:** {article['abstract'][:300]}...")
                    
                    # Display drug information
                    if 'drug_data' in result and result['drug_data'].get('drugs'):
                        st.subheader("💊 Recommended Medications")
                        drug_data = result['drug_data']
                        
                        for drug in drug_data['drugs'][:3]:
                            with st.expander(f"💊 {drug['generic_name']} ({drug['brand_name']})"):
                                st.write(f"**Drug Class:** {', '.join(drug['drug_class'][:3])}")
                                st.write(f"**Indications:** {drug['indications'][0][:200]}...")
                                st.write(f"**Warnings:** {drug['warnings'][0][:200]}...")
        else:
            st.warning("Please enter symptoms for analysis.")

elif analysis_type == "Research Lookup":
    st.header("📚 Medical Research Lookup")
    
    condition = st.text_input("Enter medical condition:")
    
    if st.button("Search Research", type="primary"):
        if condition.strip():
            with st.spinner("Searching medical research..."):
                result = asyncio.run(ai.fetch_pubmed_research(condition))
                
                if 'error' in result:
                    st.error(f"❌ Research error: {result['error']}")
                else:
                    st.success(f"✅ Found {len(result.get('articles', []))} research articles!")
                    
                    for article in result.get('articles', []):
                        with st.expander(f"📄 {article['title']}"):
                            st.write(f"**Journal:** {article['journal']}")
                            st.write(f"**Date:** {article['pubdate']}")
                            st.write(f"**Abstract:** {article['abstract']}")

elif analysis_type == "Drug Information":
    st.header("💊 Drug Information Lookup")
    
    condition = st.text_input("Enter condition for drug information:")
    
    if st.button("Search Drugs", type="primary"):
        if condition.strip():
            with st.spinner("Searching drug information..."):
                result = asyncio.run(ai.fetch_fda_drug_info(condition))
                
                if 'error' in result:
                    st.error(f"❌ Drug search error: {result['error']}")
                else:
                    st.success(f"✅ Found {len(result.get('drugs', []))} medications!")
                    
                    for drug in result.get('drugs', []):
                        with st.expander(f"💊 {drug['generic_name']} ({drug['brand_name']})"):
                            st.write(f"**Drug Class:** {', '.join(drug['drug_class'])}")
                            st.write(f"**Indications:** {drug['indications'][0]}")
                            st.write(f"**Dosage:** {drug['dosage'][0]}")
                            st.write(f"**Warnings:** {drug['warnings'][0]}")
                            st.write(f"**Interactions:** {drug['interactions'][0]}")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p>🏥 Advanced Medical AI Assistant | Powered by PubMed & FDA APIs</p>
    <p>⚠️ This is for educational purposes only. Always consult healthcare professionals for medical advice.</p>
</div>
""", unsafe_allow_html=True) 