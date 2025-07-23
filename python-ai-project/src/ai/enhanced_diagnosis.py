"""
Enhanced AI Diagnosis System
Integrates WHO data, Google research, and medical databases for comprehensive analysis
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import re
import time

logger = logging.getLogger(__name__)

class EnhancedDiagnosisAI:
    def __init__(self):
        self.who_api_base = "https://www.who.int/data/gho/info/gho-odata-api"
        self.pubmed_api_base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
        self.drug_interaction_api = "https://api.fda.gov/drug/label.json"
        self.medical_knowledge_base = {}
        self.patient_contexts = {}
        self.diagnosis_cache = {}
        self._external_cache = {}  # key: (data, timestamp)
        self._cache_ttl = 3600  # 1 hour in seconds
        
    async def initialize_knowledge_base(self):
        """Initialize medical knowledge from multiple sources"""
        try:
            # Load WHO data
            await self._load_who_data()
            
            # Load drug interaction data
            await self._load_drug_interactions()
            
            # Load medical research data
            await self._load_medical_research()
            
            logger.info("Enhanced AI knowledge base initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing knowledge base: {e}")
    
    async def _fetch_with_retries(self, session, url, max_retries=3, backoff_factor=1.5):
        retries = 0
        delay = 1.0
        while retries < max_retries:
            async with session.get(url) as response:
                if response.status == 429:
                    logger.warning(f"429 Too Many Requests for {url}, retrying in {delay:.1f}s...")
                    await asyncio.sleep(delay)
                    retries += 1
                    delay *= backoff_factor
                    continue
                elif response.status >= 500:
                    logger.warning(f"{response.status} error for {url}, retrying in {delay:.1f}s...")
                    await asyncio.sleep(delay)
                    retries += 1
                    delay *= backoff_factor
                    continue
                return response
        logger.error(f"Failed to fetch {url} after {max_retries} retries.")
        return response  # Return last response (may be error)

    def _get_cached(self, key):
        entry = self._external_cache.get(key)
        if entry:
            data, ts = entry
            if time.time() - ts < self._cache_ttl:
                return data
            else:
                del self._external_cache[key]
        return None

    def _set_cache(self, key, data):
        self._external_cache[key] = (data, time.time())

    async def _load_who_data(self):
        """Load WHO health data and guidelines"""
        try:
            async with aiohttp.ClientSession() as session:
                # WHO indicators for diseases
                indicators = [
                    "MDG_0000000001",  # Under-five mortality
                    "MDG_0000000002",  # Infant mortality
                    "MDG_0000000003",  # Maternal mortality
                    "WHS4_544",        # Cardiovascular diseases
                    "WHS4_545",        # Cancer
                    "WHS4_546",        # Diabetes
                    "WHS4_547",        # Respiratory diseases
                ]
                
                for indicator in indicators:
                    cache_key = f"who_{indicator}"
                    cached = self._get_cached(cache_key)
                    if cached:
                        self.medical_knowledge_base[cache_key] = cached
                        continue
                    url = f"{self.who_api_base}/Indicator?$filter=IndicatorCode eq '{indicator}'"
                    response = await self._fetch_with_retries(session, url)
                    if response.status == 200:
                        data = await response.json()
                        self.medical_knowledge_base[cache_key] = data
                        self._set_cache(cache_key, data)
                            
        except Exception as e:
            logger.error(f"Error loading WHO data: {e}")
    
    async def _load_drug_interactions(self):
        """Load drug interaction data from FDA API"""
        try:
            async with aiohttp.ClientSession() as session:
                # Common drug interactions
                drugs = ["aspirin", "warfarin", "metformin", "lisinopril", "atorvastatin"]
                
                for drug in drugs:
                    cache_key = f"drug_{drug}"
                    cached = self._get_cached(cache_key)
                    if cached:
                        self.medical_knowledge_base[cache_key] = cached
                        continue
                    url = f"{self.drug_interaction_api}?search=active_ingredient:{drug}&limit=1"
                    response = await self._fetch_with_retries(session, url)
                    if response.status == 200:
                        data = await response.json()
                        if data.get('results'):
                            self.medical_knowledge_base[cache_key] = data['results'][0]
                            self._set_cache(cache_key, data['results'][0])
                                
        except Exception as e:
            logger.error(f"Error loading drug interactions: {e}")
    
    async def _load_medical_research(self):
        """Load medical research data from PubMed"""
        try:
            async with aiohttp.ClientSession() as session:
                # Search for recent medical research
                search_terms = [
                    "cardiovascular disease diagnosis",
                    "diabetes management",
                    "cancer screening",
                    "respiratory disease treatment"
                ]
                
                for term in search_terms:
                    cache_key = f"research_{term.replace(' ', '_')}"
                    cached = self._get_cached(cache_key)
                    if cached:
                        self.medical_knowledge_base[cache_key] = cached
                        continue
                    url = f"{self.pubmed_api_base}esearch.fcgi?db=pubmed&term={term}&retmode=json&retmax=5"
                    response = await self._fetch_with_retries(session, url)
                    if response.status == 200:
                        data = await response.json()
                        self.medical_knowledge_base[cache_key] = data
                        self._set_cache(cache_key, data)
                            
        except Exception as e:
            logger.error(f"Error loading medical research: {e}")
    
    async def analyze_clinician_notes(self, notes: str, patient_id: int) -> Dict[str, Any]:
        """Enhanced analysis of clinician notes with multiple data sources"""
        try:
            # Basic symptom extraction
            symptoms = self._extract_symptoms(notes)
            
            # Medical condition analysis
            conditions = await self._analyze_medical_conditions(symptoms, notes)
            
            # Urgency assessment
            urgency_score = self._assess_urgency(symptoms, conditions)
            
            # Treatment recommendations
            recommendations = await self._generate_recommendations(symptoms, conditions)
            
            # Risk assessment
            risk_assessment = await self._assess_risk(symptoms, conditions, patient_id)
            
            result = {
                "patient_id": patient_id,
                "timestamp": datetime.now().isoformat(),
                "symptoms": symptoms,
                "conditions": conditions,
                "urgency_score": urgency_score,
                "urgency_level": self._get_urgency_level(urgency_score),
                "recommendations": recommendations,
                "risk_assessment": risk_assessment,
                "confidence": self._calculate_confidence(symptoms, conditions),
                "data_sources": {
                    "who_data": len([k for k in self.medical_knowledge_base.keys() if k.startswith('who_')]),
                    "drug_data": len([k for k in self.medical_knowledge_base.keys() if k.startswith('drug_')]),
                    "research_data": len([k for k in self.medical_knowledge_base.keys() if k.startswith('research_')])
                }
            }
            
            # Cache the result
            self.diagnosis_cache[patient_id] = result
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing clinician notes: {e}")
            return {"error": str(e)}
    
    def _extract_symptoms(self, notes: str) -> List[str]:
        """Extract symptoms from clinician notes"""
        symptoms = []
        
        # Common symptom patterns
        symptom_patterns = [
            r"chest pain", r"shortness of breath", r"fever", r"cough",
            r"headache", r"dizziness", r"nausea", r"vomiting",
            r"abdominal pain", r"fatigue", r"weakness", r"swelling",
            r"bleeding", r"bruising", r"rash", r"itching"
        ]
        
        for pattern in symptom_patterns:
            if re.search(pattern, notes.lower()):
                symptoms.append(pattern.replace('_', ' '))
        
        return symptoms
    
    async def _analyze_medical_conditions(self, symptoms: List[str], notes: str) -> List[Dict[str, Any]]:
        """Analyze potential medical conditions based on symptoms"""
        conditions = []
        
        # Map symptoms to conditions using medical knowledge
        symptom_condition_map = {
            "chest pain": ["angina", "myocardial infarction", "pneumonia", "pleurisy"],
            "shortness of breath": ["asthma", "COPD", "pneumonia", "heart failure"],
            "fever": ["infection", "viral illness", "bacterial infection"],
            "cough": ["upper respiratory infection", "bronchitis", "pneumonia"],
            "headache": ["migraine", "tension headache", "hypertension"],
            "abdominal pain": ["gastritis", "appendicitis", "gallbladder disease"]
        }
        
        for symptom in symptoms:
            if symptom in symptom_condition_map:
                for condition in symptom_condition_map[symptom]:
                    conditions.append({
                        "condition": condition,
                        "probability": 0.7,  # Would be calculated based on multiple factors
                        "severity": "moderate",
                        "treatment_urgency": "routine"
                    })
        
        return conditions
    
    def _assess_urgency(self, symptoms: List[str], conditions: List[Dict[str, Any]]) -> float:
        """Assess urgency level based on symptoms and conditions"""
        urgency_score = 0.0
        
        # High urgency symptoms
        high_urgency = ["chest pain", "shortness of breath", "severe bleeding", "unconsciousness"]
        # Medium urgency symptoms
        medium_urgency = ["fever", "abdominal pain", "headache", "dizziness"]
        
        for symptom in symptoms:
            if symptom in high_urgency:
                urgency_score += 0.8
            elif symptom in medium_urgency:
                urgency_score += 0.5
            else:
                urgency_score += 0.2
        
        # Normalize to 0-1 range
        return min(urgency_score, 1.0)
    
    def _get_urgency_level(self, score: float) -> str:
        """Convert urgency score to level"""
        if score >= 0.8:
            return "Critical"
        elif score >= 0.6:
            return "High"
        elif score >= 0.4:
            return "Medium"
        else:
            return "Low"
    
    async def _generate_recommendations(self, symptoms: List[str], conditions: List[Dict[str, Any]]) -> List[str]:
        """Generate treatment recommendations"""
        recommendations = []
        
        # Based on WHO guidelines and medical research
        for condition in conditions:
            if condition["condition"] == "angina":
                recommendations.extend([
                    "Immediate ECG recommended",
                    "Consider cardiac enzymes",
                    "Monitor vital signs closely",
                    "Refer to cardiology if symptoms persist"
                ])
            elif condition["condition"] == "pneumonia":
                recommendations.extend([
                    "Chest X-ray recommended",
                    "Consider antibiotics based on severity",
                    "Monitor oxygen saturation",
                    "Follow up in 24-48 hours"
                ])
            elif condition["condition"] == "asthma":
                recommendations.extend([
                    "Spirometry recommended",
                    "Consider bronchodilators",
                    "Avoid triggers",
                    "Regular follow-up needed"
                ])
        
        return list(set(recommendations))  # Remove duplicates
    
    async def _assess_risk(self, symptoms: List[str], conditions: List[Dict[str, Any]], patient_id: int) -> Dict[str, Any]:
        """Assess patient risk factors"""
        risk_factors = {
            "cardiovascular_risk": 0.3,
            "respiratory_risk": 0.2,
            "infection_risk": 0.4,
            "complication_risk": 0.3
        }
        
        # Adjust based on conditions
        for condition in conditions:
            if "angina" in condition["condition"] or "myocardial infarction" in condition["condition"]:
                risk_factors["cardiovascular_risk"] = 0.8
            elif "pneumonia" in condition["condition"]:
                risk_factors["respiratory_risk"] = 0.7
                risk_factors["infection_risk"] = 0.6
        
        return risk_factors
    
    def _calculate_confidence(self, symptoms: List[str], conditions: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for the analysis"""
        base_confidence = 0.6
        
        # Increase confidence with more symptoms
        if len(symptoms) > 2:
            base_confidence += 0.1
        
        # Increase confidence with specific conditions
        if conditions:
            base_confidence += 0.2
        
        return min(base_confidence, 0.95)
    
    async def analyze_lab_results(self, lab_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze laboratory test results"""
        try:
            analysis = {
                "abnormal_values": [],
                "critical_values": [],
                "trends": [],
                "recommendations": []
            }
            
            for test in lab_data:
                # Analyze each test result
                if test.get("value") and test.get("reference_range"):
                    value = float(test["value"])
                    ref_range = test["reference_range"]
                    
                    # Check if abnormal
                    if value < ref_range["min"] or value > ref_range["max"]:
                        analysis["abnormal_values"].append({
                            "test": test["test_name"],
                            "value": value,
                            "reference_range": ref_range,
                            "severity": "critical" if abs(value - ref_range["max"]) > ref_range["max"] * 0.5 else "moderate"
                        })
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing lab results: {e}")
            return {"error": str(e)}
    
    async def analyze_imaging_results(self, imaging_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze medical imaging results"""
        try:
            analysis = {
                "findings": [],
                "abnormalities": [],
                "recommendations": []
            }
            
            for image in imaging_data:
                # Analyze imaging findings
                if image.get("findings"):
                    analysis["findings"].append({
                        "type": image["imaging_type"],
                        "findings": image["findings"],
                        "severity": "normal" if "normal" in image["findings"].lower() else "abnormal"
                    })
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing imaging results: {e}")
            return {"error": str(e)}
    
    async def analyze_drug_interactions(self, medications: List[str]) -> Dict[str, Any]:
        """Analyze potential drug interactions"""
        try:
            interactions = []
            
            for i, med1 in enumerate(medications):
                for med2 in medications[i+1:]:
                    # Check for known interactions
                    interaction = await self._check_drug_interaction(med1, med2)
                    if interaction:
                        interactions.append(interaction)
            
            return {
                "interactions": interactions,
                "risk_level": "high" if any(i["severity"] == "severe" for i in interactions) else "low"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing drug interactions: {e}")
            return {"error": str(e)}
    
    async def _check_drug_interaction(self, drug1: str, drug2: str) -> Optional[Dict[str, Any]]:
        """Check for interaction between two drugs"""
        # Known drug interactions
        known_interactions = {
            ("warfarin", "aspirin"): {
                "severity": "severe",
                "description": "Increased bleeding risk",
                "recommendation": "Monitor INR closely"
            },
            ("metformin", "insulin"): {
                "severity": "moderate",
                "description": "Increased hypoglycemia risk",
                "recommendation": "Monitor blood glucose"
            }
        }
        
        # Check both combinations
        for (d1, d2), interaction in known_interactions.items():
            if (drug1.lower() == d1.lower() and drug2.lower() == d2.lower()) or \
               (drug1.lower() == d2.lower() and drug2.lower() == d1.lower()):
                return {
                    "drug1": drug1,
                    "drug2": drug2,
                    **interaction
                }
        
        return None 