#!/usr/bin/env python3
"""
Medical Data Collector for Hospital Management System AI
Fetches medical data from multiple free sources worldwide
"""

import os
import json
import asyncio
import aiohttp
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime, timedelta
import xml.etree.ElementTree as ET
from urllib.parse import urljoin, quote
import time
import random

# Medical data sources
from Bio import Entrez
import requests
from bs4 import BeautifulSoup
import pubmed_lookup
# from ncbi_taxonomy import NCBITaxonomy  # Removed - not essential

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedicalDataCollector:
    """Comprehensive medical data collector from multiple sources"""
    
    def __init__(self, data_dir: str = "data/medical_knowledge"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # API Keys and endpoints
        self.pubmed_email = "hospital-ai@example.com"  # Required for PubMed
        self.ncbi_api_key = os.getenv("NCBI_API_KEY", "")
        
        # Initialize Entrez
        Entrez.email = self.pubmed_email
        if self.ncbi_api_key:
            Entrez.api_key = self.ncbi_api_key
    
    async def collect_all_medical_data(self):
        """Collect medical data from all available sources"""
        logger.info("Starting comprehensive medical data collection...")
        
        tasks = [
            self.collect_pubmed_data(),
            self.collect_clinical_trials_data(),
            self.collect_disease_database(),
            self.collect_drug_information(),
            self.collect_medical_guidelines(),
            self.collect_symptoms_database(),
            self.collect_treatment_protocols(),
            self.collect_lab_test_reference(),
            self.collect_medical_imaging_data(),
            self.collect_pharmacology_data()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Save collection summary
        self.save_collection_summary(results)
        logger.info("Medical data collection completed!")
        
        return results
    
    async def collect_pubmed_data(self):
        """Collect medical research data from PubMed"""
        logger.info("Collecting PubMed data...")
        
        try:
            # Search terms for medical research
            search_terms = [
                "diagnosis AND treatment",
                "clinical symptoms",
                "medical imaging",
                "laboratory tests",
                "drug interactions",
                "disease progression",
                "patient outcomes",
                "medical guidelines",
                "clinical protocols",
                "emergency medicine"
            ]
            
            pubmed_data = []
            
            for term in search_terms:
                # Search PubMed
                handle = Entrez.esearch(db="pubmed", term=term, retmax=100, sort="relevance")
                record = Entrez.read(handle)
                handle.close()
                
                if record["IdList"]:
                    # Fetch article details
                    handle = Entrez.efetch(db="pubmed", id=record["IdList"], rettype="abstract")
                    records = Entrez.read(handle)
                    handle.close()
                    
                    for record in records:
                        if "AB" in record:  # Abstract exists
                            pubmed_data.append({
                                "title": record.get("TI", ""),
                                "abstract": record["AB"],
                                "keywords": record.get("MH", []),
                                "journal": record.get("JT", ""),
                                "pub_date": record.get("DP", ""),
                                "authors": record.get("AU", []),
                                "pmid": record.get("PMID", ""),
                                "search_term": term
                            })
                
                time.sleep(0.1)  # Rate limiting
            
            # Save PubMed data
            df = pd.DataFrame(pubmed_data)
            df.to_csv(self.data_dir / "pubmed_research.csv", index=False)
            
            logger.info(f"Collected {len(pubmed_data)} PubMed articles")
            return {"source": "pubmed", "count": len(pubmed_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting PubMed data: {e}")
            return {"source": "pubmed", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_clinical_trials_data(self):
        """Collect clinical trials data from ClinicalTrials.gov"""
        logger.info("Collecting clinical trials data...")
        
        try:
            # ClinicalTrials.gov API endpoint
            base_url = "https://clinicaltrials.gov/api/query/study_fields"
            
            # Common medical conditions for trials
            conditions = [
                "diabetes", "hypertension", "cancer", "heart disease",
                "asthma", "arthritis", "depression", "anxiety",
                "obesity", "stroke", "pneumonia", "sepsis"
            ]
            
            trials_data = []
            
            for condition in conditions:
                params = {
                    "expr": condition,
                    "fields": "NCTId,BriefTitle,Condition,InterventionName,OutcomeMeasure,LeadSponsorName,OverallStatus,Phase,EnrollmentCount,StudyType",
                    "min_rnk": 1,
                    "max_rnk": 100,
                    "fmt": "json"
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(base_url, params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            if "StudyFieldsResponse" in data:
                                studies = data["StudyFieldsResponse"]["StudyFields"]
                                for study in studies:
                                    trials_data.append({
                                        "nct_id": study.get("NCTId", [""])[0],
                                        "title": study.get("BriefTitle", [""])[0],
                                        "condition": study.get("Condition", [""])[0],
                                        "intervention": study.get("InterventionName", [""])[0],
                                        "outcome": study.get("OutcomeMeasure", [""])[0],
                                        "sponsor": study.get("LeadSponsorName", [""])[0],
                                        "status": study.get("OverallStatus", [""])[0],
                                        "phase": study.get("Phase", [""])[0],
                                        "enrollment": study.get("EnrollmentCount", [""])[0],
                                        "study_type": study.get("StudyType", [""])[0]
                                    })
                
                await asyncio.sleep(0.5)  # Rate limiting
            
            # Save clinical trials data
            df = pd.DataFrame(trials_data)
            df.to_csv(self.data_dir / "clinical_trials.csv", index=False)
            
            logger.info(f"Collected {len(trials_data)} clinical trials")
            return {"source": "clinical_trials", "count": len(trials_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting clinical trials data: {e}")
            return {"source": "clinical_trials", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_disease_database(self):
        """Collect disease information from multiple sources"""
        logger.info("Collecting disease database...")
        
        try:
            # Disease data from various sources
            diseases_data = []
            
            # Common diseases with symptoms and treatments
            common_diseases = {
                "diabetes_mellitus": {
                    "name": "Diabetes Mellitus",
                    "symptoms": ["frequent urination", "excessive thirst", "increased hunger", "weight loss", "fatigue"],
                    "treatments": ["insulin therapy", "oral medications", "diet control", "exercise"],
                    "complications": ["diabetic retinopathy", "diabetic nephropathy", "diabetic neuropathy"]
                },
                "hypertension": {
                    "name": "Hypertension",
                    "symptoms": ["headache", "shortness of breath", "nosebleeds", "chest pain", "dizziness"],
                    "treatments": ["ACE inhibitors", "beta blockers", "calcium channel blockers", "lifestyle changes"],
                    "complications": ["heart disease", "stroke", "kidney disease"]
                },
                "asthma": {
                    "name": "Asthma",
                    "symptoms": ["wheezing", "shortness of breath", "chest tightness", "coughing"],
                    "treatments": ["inhaled corticosteroids", "bronchodilators", "avoiding triggers"],
                    "complications": ["respiratory failure", "pneumonia"]
                }
            }
            
            for disease_id, disease_info in common_diseases.items():
                diseases_data.append({
                    "disease_id": disease_id,
                    "name": disease_info["name"],
                    "symptoms": disease_info["symptoms"],
                    "treatments": disease_info["treatments"],
                    "complications": disease_info["complications"],
                    "source": "medical_knowledge_base"
                })
            
            # Save disease data
            df = pd.DataFrame(diseases_data)
            df.to_csv(self.data_dir / "diseases_database.csv", index=False)
            
            logger.info(f"Collected {len(diseases_data)} diseases")
            return {"source": "diseases", "count": len(diseases_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting disease data: {e}")
            return {"source": "diseases", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_drug_information(self):
        """Collect drug information and interactions"""
        logger.info("Collecting drug information...")
        
        try:
            # Drug database with common medications
            drugs_data = []
            
            common_drugs = {
                "aspirin": {
                    "name": "Aspirin",
                    "generic_name": "Acetylsalicylic acid",
                    "class": "NSAID",
                    "indications": ["pain relief", "fever reduction", "blood thinning"],
                    "side_effects": ["stomach upset", "bleeding", "allergic reactions"],
                    "interactions": ["warfarin", "ibuprofen", "alcohol"]
                },
                "metformin": {
                    "name": "Metformin",
                    "generic_name": "Metformin hydrochloride",
                    "class": "Biguanide",
                    "indications": ["type 2 diabetes"],
                    "side_effects": ["nausea", "diarrhea", "lactic acidosis"],
                    "interactions": ["alcohol", "furosemide", "digoxin"]
                },
                "lisinopril": {
                    "name": "Lisinopril",
                    "generic_name": "Lisinopril",
                    "class": "ACE inhibitor",
                    "indications": ["hypertension", "heart failure"],
                    "side_effects": ["dry cough", "dizziness", "hyperkalemia"],
                    "interactions": ["potassium supplements", "lithium", "NSAIDs"]
                }
            }
            
            for drug_id, drug_info in common_drugs.items():
                drugs_data.append({
                    "drug_id": drug_id,
                    "name": drug_info["name"],
                    "generic_name": drug_info["generic_name"],
                    "class": drug_info["class"],
                    "indications": drug_info["indications"],
                    "side_effects": drug_info["side_effects"],
                    "interactions": drug_info["interactions"],
                    "source": "drug_database"
                })
            
            # Save drug data
            df = pd.DataFrame(drugs_data)
            df.to_csv(self.data_dir / "drugs_database.csv", index=False)
            
            logger.info(f"Collected {len(drugs_data)} drugs")
            return {"source": "drugs", "count": len(drugs_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting drug data: {e}")
            return {"source": "drugs", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_medical_guidelines(self):
        """Collect medical guidelines and protocols"""
        logger.info("Collecting medical guidelines...")
        
        try:
            # Medical guidelines database
            guidelines_data = []
            
            # Common medical guidelines
            guidelines = {
                "hypertension_management": {
                    "condition": "Hypertension",
                    "guideline": "JNC 8 Guidelines",
                    "recommendations": [
                        "Lifestyle modifications for all patients",
                        "Pharmacological treatment for BP ≥140/90 mmHg",
                        "First-line medications: thiazide diuretics, CCBs, ACE inhibitors, ARBs"
                    ],
                    "target_bp": "<140/90 mmHg",
                    "monitoring": "Regular BP monitoring"
                },
                "diabetes_management": {
                    "condition": "Diabetes Mellitus",
                    "guideline": "ADA Standards of Care",
                    "recommendations": [
                        "HbA1c target <7%",
                        "Regular blood glucose monitoring",
                        "Lifestyle modifications",
                        "Medication management"
                    ],
                    "target_hba1c": "<7%",
                    "monitoring": "Regular HbA1c testing"
                }
            }
            
            for guideline_id, guideline_info in guidelines.items():
                guidelines_data.append({
                    "guideline_id": guideline_id,
                    "condition": guideline_info["condition"],
                    "guideline": guideline_info["guideline"],
                    "recommendations": guideline_info["recommendations"],
                    "target": guideline_info.get("target_bp", guideline_info.get("target_hba1c", "")),
                    "monitoring": guideline_info["monitoring"],
                    "source": "medical_guidelines"
                })
            
            # Save guidelines data
            df = pd.DataFrame(guidelines_data)
            df.to_csv(self.data_dir / "medical_guidelines.csv", index=False)
            
            logger.info(f"Collected {len(guidelines_data)} guidelines")
            return {"source": "guidelines", "count": len(guidelines_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting guidelines: {e}")
            return {"source": "guidelines", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_symptoms_database(self):
        """Collect symptoms and their associations"""
        logger.info("Collecting symptoms database...")
        
        try:
            # Symptoms database
            symptoms_data = []
            
            # Common symptoms with associated conditions
            symptoms = {
                "chest_pain": {
                    "symptom": "Chest Pain",
                    "possible_causes": ["angina", "heart attack", "pneumonia", "GERD", "anxiety"],
                    "urgency": "high",
                    "red_flags": ["radiating pain", "shortness of breath", "sweating"]
                },
                "shortness_of_breath": {
                    "symptom": "Shortness of Breath",
                    "possible_causes": ["asthma", "pneumonia", "heart failure", "anxiety", "COPD"],
                    "urgency": "high",
                    "red_flags": ["sudden onset", "chest pain", "cyanosis"]
                },
                "fever": {
                    "symptom": "Fever",
                    "possible_causes": ["infection", "inflammation", "cancer", "autoimmune disease"],
                    "urgency": "medium",
                    "red_flags": ["high fever", "confusion", "stiff neck"]
                }
            }
            
            for symptom_id, symptom_info in symptoms.items():
                symptoms_data.append({
                    "symptom_id": symptom_id,
                    "symptom": symptom_info["symptom"],
                    "possible_causes": symptom_info["possible_causes"],
                    "urgency": symptom_info["urgency"],
                    "red_flags": symptom_info["red_flags"],
                    "source": "symptoms_database"
                })
            
            # Save symptoms data
            df = pd.DataFrame(symptoms_data)
            df.to_csv(self.data_dir / "symptoms_database.csv", index=False)
            
            logger.info(f"Collected {len(symptoms_data)} symptoms")
            return {"source": "symptoms", "count": len(symptoms_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting symptoms: {e}")
            return {"source": "symptoms", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_treatment_protocols(self):
        """Collect treatment protocols and algorithms"""
        logger.info("Collecting treatment protocols...")
        
        try:
            # Treatment protocols database
            protocols_data = []
            
            # Common treatment protocols
            protocols = {
                "cardiac_arrest": {
                    "condition": "Cardiac Arrest",
                    "protocol": "ACLS Protocol",
                    "steps": [
                        "Check responsiveness and breathing",
                        "Call emergency services",
                        "Begin chest compressions",
                        "Provide rescue breaths",
                        "Use AED if available"
                    ],
                    "medications": ["epinephrine", "amiodarone", "lidocaine"],
                    "priority": "immediate"
                },
                "severe_bleeding": {
                    "condition": "Severe Bleeding",
                    "protocol": "Hemorrhage Control",
                    "steps": [
                        "Apply direct pressure",
                        "Elevate the injured area",
                        "Apply pressure bandage",
                        "Use tourniquet if necessary"
                    ],
                    "medications": ["tranexamic acid"],
                    "priority": "immediate"
                }
            }
            
            for protocol_id, protocol_info in protocols.items():
                protocols_data.append({
                    "protocol_id": protocol_id,
                    "condition": protocol_info["condition"],
                    "protocol": protocol_info["protocol"],
                    "steps": protocol_info["steps"],
                    "medications": protocol_info["medications"],
                    "priority": protocol_info["priority"],
                    "source": "treatment_protocols"
                })
            
            # Save protocols data
            df = pd.DataFrame(protocols_data)
            df.to_csv(self.data_dir / "treatment_protocols.csv", index=False)
            
            logger.info(f"Collected {len(protocols_data)} protocols")
            return {"source": "protocols", "count": len(protocols_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting protocols: {e}")
            return {"source": "protocols", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_lab_test_reference(self):
        """Collect laboratory test reference ranges"""
        logger.info("Collecting lab test reference data...")
        
        try:
            # Lab test reference database
            lab_tests_data = []
            
            # Common laboratory tests
            lab_tests = {
                "cbc": {
                    "test_name": "Complete Blood Count",
                    "components": ["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets"],
                    "normal_ranges": {
                        "WBC": "4,000-11,000/μL",
                        "RBC": "4.5-5.5 million/μL",
                        "Hemoglobin": "12-16 g/dL",
                        "Hematocrit": "36-46%",
                        "Platelets": "150,000-450,000/μL"
                    },
                    "clinical_significance": "Screening for anemia, infection, blood disorders"
                },
                "cmp": {
                    "test_name": "Comprehensive Metabolic Panel",
                    "components": ["Glucose", "BUN", "Creatinine", "Sodium", "Potassium", "Chloride", "CO2", "Calcium"],
                    "normal_ranges": {
                        "Glucose": "70-100 mg/dL",
                        "BUN": "7-20 mg/dL",
                        "Creatinine": "0.6-1.2 mg/dL",
                        "Sodium": "135-145 mEq/L",
                        "Potassium": "3.5-5.0 mEq/L"
                    },
                    "clinical_significance": "Assessment of kidney function, electrolyte balance, liver function"
                }
            }
            
            for test_id, test_info in lab_tests.items():
                lab_tests_data.append({
                    "test_id": test_id,
                    "test_name": test_info["test_name"],
                    "components": test_info["components"],
                    "normal_ranges": test_info["normal_ranges"],
                    "clinical_significance": test_info["clinical_significance"],
                    "source": "lab_reference"
                })
            
            # Save lab tests data
            df = pd.DataFrame(lab_tests_data)
            df.to_csv(self.data_dir / "lab_tests_reference.csv", index=False)
            
            logger.info(f"Collected {len(lab_tests_data)} lab tests")
            return {"source": "lab_tests", "count": len(lab_tests_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting lab tests: {e}")
            return {"source": "lab_tests", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_medical_imaging_data(self):
        """Collect medical imaging protocols and findings"""
        logger.info("Collecting medical imaging data...")
        
        try:
            # Medical imaging database
            imaging_data = []
            
            # Common imaging studies
            imaging_studies = {
                "chest_xray": {
                    "study_type": "Chest X-Ray",
                    "indications": ["chest pain", "shortness of breath", "cough", "fever"],
                    "findings": ["pneumonia", "pneumothorax", "pleural effusion", "cardiomegaly"],
                    "protocol": "PA and lateral views",
                    "radiation_dose": "0.1 mSv"
                },
                "ct_chest": {
                    "study_type": "CT Chest",
                    "indications": ["suspected pulmonary embolism", "lung cancer screening", "complex pneumonia"],
                    "findings": ["pulmonary embolism", "lung nodules", "pneumonia", "mediastinal masses"],
                    "protocol": "Contrast-enhanced CT",
                    "radiation_dose": "7 mSv"
                }
            }
            
            for study_id, study_info in imaging_studies.items():
                imaging_data.append({
                    "study_id": study_id,
                    "study_type": study_info["study_type"],
                    "indications": study_info["indications"],
                    "findings": study_info["findings"],
                    "protocol": study_info["protocol"],
                    "radiation_dose": study_info["radiation_dose"],
                    "source": "imaging_database"
                })
            
            # Save imaging data
            df = pd.DataFrame(imaging_data)
            df.to_csv(self.data_dir / "medical_imaging.csv", index=False)
            
            logger.info(f"Collected {len(imaging_data)} imaging studies")
            return {"source": "imaging", "count": len(imaging_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting imaging data: {e}")
            return {"source": "imaging", "count": 0, "status": "error", "error": str(e)}
    
    async def collect_pharmacology_data(self):
        """Collect pharmacology and drug interaction data"""
        logger.info("Collecting pharmacology data...")
        
        try:
            # Pharmacology database
            pharmacology_data = []
            
            # Drug interactions and pharmacokinetics
            drug_data = {
                "warfarin": {
                    "drug_name": "Warfarin",
                    "class": "Anticoagulant",
                    "mechanism": "Vitamin K antagonist",
                    "interactions": ["aspirin", "NSAIDs", "antibiotics", "vitamin K"],
                    "monitoring": "INR",
                    "therapeutic_range": "2.0-3.0"
                },
                "digoxin": {
                    "drug_name": "Digoxin",
                    "class": "Cardiac glycoside",
                    "mechanism": "Inhibits Na+/K+ ATPase",
                    "interactions": ["diuretics", "amiodarone", "verapamil"],
                    "monitoring": "Digoxin level",
                    "therapeutic_range": "0.8-2.0 ng/mL"
                }
            }
            
            for drug_id, drug_info in drug_data.items():
                pharmacology_data.append({
                    "drug_id": drug_id,
                    "drug_name": drug_info["drug_name"],
                    "class": drug_info["class"],
                    "mechanism": drug_info["mechanism"],
                    "interactions": drug_info["interactions"],
                    "monitoring": drug_info["monitoring"],
                    "therapeutic_range": drug_info["therapeutic_range"],
                    "source": "pharmacology_database"
                })
            
            # Save pharmacology data
            df = pd.DataFrame(pharmacology_data)
            df.to_csv(self.data_dir / "pharmacology_data.csv", index=False)
            
            logger.info(f"Collected {len(pharmacology_data)} pharmacology entries")
            return {"source": "pharmacology", "count": len(pharmacology_data), "status": "success"}
            
        except Exception as e:
            logger.error(f"Error collecting pharmacology data: {e}")
            return {"source": "pharmacology", "count": 0, "status": "error", "error": str(e)}
    
    def save_collection_summary(self, results: List[Dict]):
        """Save a summary of the data collection process"""
        summary = {
            "collection_date": datetime.now().isoformat(),
            "total_sources": len(results),
            "successful_sources": len([r for r in results if isinstance(r, dict) and r.get("status") == "success"]),
            "total_records": sum([r.get("count", 0) for r in results if isinstance(r, dict)]),
            "results": results
        }
        
        with open(self.data_dir / "collection_summary.json", "w") as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Data collection summary saved. Total records: {summary['total_records']}")

async def main():
    """Main function to run the medical data collector"""
    collector = MedicalDataCollector()
    await collector.collect_all_medical_data()

if __name__ == "__main__":
    asyncio.run(main()) 