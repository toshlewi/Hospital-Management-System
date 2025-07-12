"""
Real-time AI Diagnosis Module
Analyzes clinician notes, patient history, lab tests, and imaging to provide comprehensive diagnosis and treatment recommendations.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import spacy
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

from ..utils.config import get_settings
from ..data.medical_data import MedicalDataProcessor
from ..models.diagnosis_model import DiagnosisModel

logger = logging.getLogger(__name__)
settings = get_settings()

class RealTimeDiagnosisAI:
    """
    Real-time AI diagnosis system that analyzes multiple data sources
    to provide comprehensive medical diagnosis and treatment recommendations.
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.medical_processor = MedicalDataProcessor()
        self.diagnosis_model = DiagnosisModel()
        
        # Initialize NLP models
        self.nlp = spacy.load("en_core_web_sm")
        self.sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        
        # Initialize medical text classification
        self.medical_classifier = pipeline(
            "text-classification",
            model="microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext"
        )
        
        # Load pre-trained models
        self.load_models()
        
        # Initialize real-time processing
        self.patient_contexts = {}
        self.diagnosis_cache = {}
        
    def load_models(self):
        """Load pre-trained models for diagnosis."""
        try:
            # Load medical entity recognition model
            self.medical_ner = spacy.load("en_core_web_sm")
            
            # Load diagnosis classification model
            model_path = os.path.join(settings.MODEL_PATH, "diagnosis_classifier.pkl")
            if os.path.exists(model_path):
                self.diagnosis_classifier = joblib.load(model_path)
            else:
                self.diagnosis_classifier = RandomForestClassifier(n_estimators=100)
                
            # Load risk assessment model
            risk_model_path = os.path.join(settings.MODEL_PATH, "risk_assessor.pkl")
            if os.path.exists(risk_model_path):
                self.risk_assessor = joblib.load(risk_model_path)
            else:
                self.risk_assessor = RandomForestClassifier(n_estimators=100)
                
            logger.info("AI models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            # Initialize with basic models if loading fails
            self.diagnosis_classifier = RandomForestClassifier(n_estimators=100)
            self.risk_assessor = RandomForestClassifier(n_estimators=100)
    
    async def analyze_clinician_notes(self, notes: str, patient_id: int) -> Dict[str, Any]:
        """
        Analyze clinician notes in real-time to extract symptoms, observations, and clinical findings.
        
        Args:
            notes: Current clinician notes
            patient_id: Patient identifier
            
        Returns:
            Dictionary containing extracted information
        """
        try:
            # Process the notes with NLP
            doc = self.nlp(notes)
            
            # Extract medical entities
            symptoms = []
            medications = []
            procedures = []
            measurements = []
            
            for ent in doc.ents:
                if ent.label_ in ["CONDITION", "DISEASE"]:
                    symptoms.append(ent.text)
                elif ent.label_ in ["DRUG", "MEDICATION"]:
                    medications.append(ent.text)
                elif ent.label_ in ["PROCEDURE", "TREATMENT"]:
                    procedures.append(ent.text)
                elif ent.label_ in ["QUANTITY", "MEASUREMENT"]:
                    measurements.append(ent.text)
            
            # Analyze sentiment and urgency
            sentiment_result = self.sentiment_analyzer(notes)
            urgency_score = self._calculate_urgency(notes, sentiment_result)
            
            # Classify medical content
            medical_classification = self.medical_classifier(notes)
            
            analysis_result = {
                "symptoms": symptoms,
                "medications": medications,
                "procedures": procedures,
                "measurements": measurements,
                "sentiment": sentiment_result[0]["label"],
                "confidence": sentiment_result[0]["score"],
                "urgency_score": urgency_score,
                "medical_category": medical_classification[0]["label"],
                "medical_confidence": medical_classification[0]["score"],
                "timestamp": datetime.now().isoformat(),
                "patient_id": patient_id
            }
            
            # Update patient context
            self._update_patient_context(patient_id, analysis_result)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing clinician notes: {e}")
            return {"error": str(e)}
    
    async def analyze_patient_history(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze patient medical history for patterns and risk factors.
        
        Args:
            patient_data: Patient's medical history data
            
        Returns:
            Dictionary containing historical analysis
        """
        try:
            history_analysis = {
                "chronic_conditions": [],
                "allergies": [],
                "previous_surgeries": [],
                "family_history": [],
                "risk_factors": [],
                "medication_history": [],
                "patterns": []
            }
            
            # Extract chronic conditions
            if patient_data.get("medical_history"):
                for condition in patient_data["medical_history"].get("conditions", []):
                    if self._is_chronic_condition(condition):
                        history_analysis["chronic_conditions"].append(condition)
            
            # Extract allergies
            if patient_data.get("allergies"):
                history_analysis["allergies"] = patient_data["allergies"]
            
            # Analyze medication history
            if patient_data.get("medications"):
                history_analysis["medication_history"] = patient_data["medications"]
                # Check for drug interactions
                interactions = self._check_drug_interactions(patient_data["medications"])
                history_analysis["drug_interactions"] = interactions
            
            # Identify risk factors
            risk_factors = self._identify_risk_factors(patient_data)
            history_analysis["risk_factors"] = risk_factors
            
            # Analyze patterns
            patterns = self._analyze_medical_patterns(patient_data)
            history_analysis["patterns"] = patterns
            
            return history_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing patient history: {e}")
            return {"error": str(e)}
    
    async def analyze_lab_results(self, lab_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze laboratory test results for abnormalities and patterns.
        
        Args:
            lab_data: List of laboratory test results
            
        Returns:
            Dictionary containing lab analysis
        """
        try:
            lab_analysis = {
                "abnormal_results": [],
                "critical_values": [],
                "trends": [],
                "interpretation": {},
                "recommendations": []
            }
            
            for test in lab_data:
                test_name = test.get("test_name", "")
                result_value = test.get("result_value")
                reference_range = test.get("reference_range")
                unit = test.get("unit", "")
                
                # Check for abnormal values
                if result_value and reference_range:
                    is_abnormal = self._check_abnormal_value(result_value, reference_range)
                    if is_abnormal:
                        lab_analysis["abnormal_results"].append({
                            "test_name": test_name,
                            "value": result_value,
                            "reference_range": reference_range,
                            "unit": unit,
                            "severity": self._calculate_severity(result_value, reference_range)
                        })
                
                # Check for critical values
                if self._is_critical_value(result_value, reference_range):
                    lab_analysis["critical_values"].append({
                        "test_name": test_name,
                        "value": result_value,
                        "unit": unit,
                        "urgency": "immediate"
                    })
            
            # Analyze trends if multiple results available
            if len(lab_data) > 1:
                trends = self._analyze_lab_trends(lab_data)
                lab_analysis["trends"] = trends
            
            # Generate interpretation
            interpretation = self._interpret_lab_results(lab_analysis)
            lab_analysis["interpretation"] = interpretation
            
            # Generate recommendations
            recommendations = self._generate_lab_recommendations(lab_analysis)
            lab_analysis["recommendations"] = recommendations
            
            return lab_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing lab results: {e}")
            return {"error": str(e)}
    
    async def analyze_imaging_results(self, imaging_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze medical imaging results for findings and abnormalities.
        
        Args:
            imaging_data: List of imaging results
            
        Returns:
            Dictionary containing imaging analysis
        """
        try:
            imaging_analysis = {
                "findings": [],
                "abnormalities": [],
                "measurements": [],
                "comparisons": [],
                "recommendations": []
            }
            
            for image in imaging_data:
                image_type = image.get("image_type", "")
                findings = image.get("findings", "")
                measurements = image.get("measurements", {})
                
                # Analyze findings text
                if findings:
                    findings_analysis = self._analyze_imaging_findings(findings)
                    imaging_analysis["findings"].extend(findings_analysis)
                
                # Check for abnormalities
                abnormalities = self._identify_imaging_abnormalities(image)
                imaging_analysis["abnormalities"].extend(abnormalities)
                
                # Process measurements
                if measurements:
                    processed_measurements = self._process_imaging_measurements(measurements)
                    imaging_analysis["measurements"].extend(processed_measurements)
            
            # Compare with previous imaging if available
            if len(imaging_data) > 1:
                comparisons = self._compare_imaging_results(imaging_data)
                imaging_analysis["comparisons"] = comparisons
            
            # Generate recommendations
            recommendations = self._generate_imaging_recommendations(imaging_analysis)
            imaging_analysis["recommendations"] = recommendations
            
            return imaging_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing imaging results: {e}")
            return {"error": str(e)}
    
    async def generate_comprehensive_diagnosis(
        self,
        patient_id: int,
        current_notes: str,
        patient_history: Dict[str, Any],
        lab_results: List[Dict[str, Any]],
        imaging_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive diagnosis based on all available data.
        
        Args:
            patient_id: Patient identifier
            current_notes: Current clinician notes
            patient_history: Patient's medical history
            lab_results: Laboratory test results
            imaging_results: Imaging results
            
        Returns:
            Comprehensive diagnosis and treatment plan
        """
        try:
            # Analyze all data sources concurrently
            tasks = [
                self.analyze_clinician_notes(current_notes, patient_id),
                self.analyze_patient_history(patient_history),
                self.analyze_lab_results(lab_results),
                self.analyze_imaging_results(imaging_results)
            ]
            
            results = await asyncio.gather(*tasks)
            notes_analysis, history_analysis, lab_analysis, imaging_analysis = results
            
            # Combine all analyses
            combined_data = {
                "patient_id": patient_id,
                "timestamp": datetime.now().isoformat(),
                "notes_analysis": notes_analysis,
                "history_analysis": history_analysis,
                "lab_analysis": lab_analysis,
                "imaging_analysis": imaging_analysis
            }
            
            # Generate primary diagnosis
            primary_diagnosis = await self._generate_primary_diagnosis(combined_data)
            
            # Generate differential diagnosis
            differential_diagnosis = await self._generate_differential_diagnosis(combined_data)
            
            # Assess risk level
            risk_assessment = await self._assess_patient_risk(combined_data)
            
            # Generate treatment plan
            treatment_plan = await self._generate_treatment_plan(combined_data, primary_diagnosis)
            
            # Generate next steps
            next_steps = await self._generate_next_steps(combined_data, primary_diagnosis, risk_assessment)
            
            comprehensive_diagnosis = {
                "patient_id": patient_id,
                "timestamp": datetime.now().isoformat(),
                "primary_diagnosis": primary_diagnosis,
                "differential_diagnosis": differential_diagnosis,
                "risk_assessment": risk_assessment,
                "treatment_plan": treatment_plan,
                "next_steps": next_steps,
                "confidence_score": self._calculate_confidence_score(combined_data),
                "urgency_level": self._calculate_urgency_level(combined_data),
                "data_sources": {
                    "notes_analysis": notes_analysis,
                    "history_analysis": history_analysis,
                    "lab_analysis": lab_analysis,
                    "imaging_analysis": imaging_analysis
                }
            }
            
            # Cache the diagnosis
            self.diagnosis_cache[patient_id] = comprehensive_diagnosis
            
            return comprehensive_diagnosis
            
        except Exception as e:
            logger.error(f"Error generating comprehensive diagnosis: {e}")
            return {"error": str(e)}
    
    async def _generate_primary_diagnosis(self, combined_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate primary diagnosis based on combined data."""
        try:
            # Extract key features
            symptoms = combined_data["notes_analysis"].get("symptoms", [])
            lab_abnormalities = combined_data["lab_analysis"].get("abnormal_results", [])
            imaging_findings = combined_data["imaging_analysis"].get("findings", [])
            risk_factors = combined_data["history_analysis"].get("risk_factors", [])
            
            # Use ML model to predict diagnosis
            features = self._extract_diagnosis_features(combined_data)
            diagnosis_prediction = self.diagnosis_classifier.predict([features])
            confidence = self.diagnosis_classifier.predict_proba([features]).max()
            
            # Map prediction to diagnosis
            diagnosis_mapping = {
                0: "Hypertension",
                1: "Diabetes Mellitus",
                2: "Coronary Artery Disease",
                3: "Pneumonia",
                4: "Urinary Tract Infection",
                5: "Gastroenteritis",
                6: "Anxiety/Depression",
                7: "Osteoarthritis",
                8: "Asthma",
                9: "Other"
            }
            
            primary_diagnosis = diagnosis_mapping.get(diagnosis_prediction[0], "Unknown")
            
            return {
                "diagnosis": primary_diagnosis,
                "confidence": float(confidence),
                "supporting_evidence": {
                    "symptoms": symptoms,
                    "lab_findings": lab_abnormalities,
                    "imaging_findings": imaging_findings,
                    "risk_factors": risk_factors
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating primary diagnosis: {e}")
            return {"diagnosis": "Unable to determine", "confidence": 0.0}
    
    async def _generate_differential_diagnosis(self, combined_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate differential diagnosis list."""
        try:
            # This would typically use a more sophisticated model
            # For now, return common differentials based on symptoms
            symptoms = combined_data["notes_analysis"].get("symptoms", [])
            
            differentials = []
            for symptom in symptoms:
                if "chest pain" in symptom.lower():
                    differentials.extend([
                        {"condition": "Angina", "probability": 0.3},
                        {"condition": "Pneumonia", "probability": 0.2},
                        {"condition": "GERD", "probability": 0.15},
                        {"condition": "Anxiety", "probability": 0.1}
                    ])
                elif "fever" in symptom.lower():
                    differentials.extend([
                        {"condition": "Viral Infection", "probability": 0.4},
                        {"condition": "Bacterial Infection", "probability": 0.3},
                        {"condition": "Inflammatory Condition", "probability": 0.2}
                    ])
            
            # Remove duplicates and sort by probability
            unique_differentials = {}
            for diff in differentials:
                if diff["condition"] not in unique_differentials:
                    unique_differentials[diff["condition"]] = diff["probability"]
                else:
                    unique_differentials[diff["condition"]] = max(
                        unique_differentials[diff["condition"]], diff["probability"]
                    )
            
            return [
                {"condition": condition, "probability": prob}
                for condition, prob in sorted(unique_differentials.items(), key=lambda x: x[1], reverse=True)
            ]
            
        except Exception as e:
            logger.error(f"Error generating differential diagnosis: {e}")
            return []
    
    async def _assess_patient_risk(self, combined_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess patient risk level."""
        try:
            # Extract risk factors
            risk_factors = combined_data["history_analysis"].get("risk_factors", [])
            critical_labs = combined_data["lab_analysis"].get("critical_values", [])
            urgency_score = combined_data["notes_analysis"].get("urgency_score", 0)
            
            # Calculate risk score
            risk_score = len(risk_factors) * 0.2 + len(critical_labs) * 0.3 + urgency_score * 0.5
            
            if risk_score > 0.8:
                risk_level = "High"
            elif risk_score > 0.5:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            return {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "risk_factors": risk_factors,
                "critical_findings": critical_labs,
                "recommendations": self._generate_risk_recommendations(risk_level, risk_factors)
            }
            
        except Exception as e:
            logger.error(f"Error assessing patient risk: {e}")
            return {"risk_level": "Unknown", "risk_score": 0.0}
    
    async def _generate_treatment_plan(self, combined_data: Dict[str, Any], primary_diagnosis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive treatment plan."""
        try:
            diagnosis = primary_diagnosis.get("diagnosis", "")
            risk_level = combined_data.get("risk_assessment", {}).get("risk_level", "Low")
            
            treatment_plan = {
                "immediate_actions": [],
                "medications": [],
                "procedures": [],
                "lifestyle_modifications": [],
                "follow_up": [],
                "monitoring": []
            }
            
            # Generate treatment based on diagnosis
            if "Hypertension" in diagnosis:
                treatment_plan["medications"].extend([
                    {"name": "ACE Inhibitor", "dosage": "10mg daily", "duration": "Long-term"},
                    {"name": "Calcium Channel Blocker", "dosage": "5mg daily", "duration": "Long-term"}
                ])
                treatment_plan["lifestyle_modifications"].extend([
                    "Reduce sodium intake",
                    "Regular exercise",
                    "Weight management",
                    "Stress reduction"
                ])
                treatment_plan["monitoring"].extend([
                    "Blood pressure monitoring",
                    "Regular kidney function tests",
                    "Cardiac evaluation"
                ])
            
            elif "Diabetes" in diagnosis:
                treatment_plan["medications"].extend([
                    {"name": "Metformin", "dosage": "500mg twice daily", "duration": "Long-term"},
                    {"name": "Insulin", "dosage": "As needed", "duration": "Long-term"}
                ])
                treatment_plan["lifestyle_modifications"].extend([
                    "Carbohydrate counting",
                    "Regular exercise",
                    "Foot care",
                    "Blood glucose monitoring"
                ])
                treatment_plan["monitoring"].extend([
                    "HbA1c every 3 months",
                    "Annual eye exam",
                    "Foot examination",
                    "Kidney function monitoring"
                ])
            
            # Add immediate actions based on risk level
            if risk_level == "High":
                treatment_plan["immediate_actions"].extend([
                    "Immediate medical evaluation",
                    "Continuous monitoring",
                    "Emergency contact established"
                ])
            
            return treatment_plan
            
        except Exception as e:
            logger.error(f"Error generating treatment plan: {e}")
            return {"error": str(e)}
    
    async def _generate_next_steps(self, combined_data: Dict[str, Any], primary_diagnosis: Dict[str, Any], risk_assessment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate next steps for patient care."""
        try:
            next_steps = []
            risk_level = risk_assessment.get("risk_level", "Low")
            
            # Immediate steps based on risk level
            if risk_level == "High":
                next_steps.extend([
                    {
                        "step": "Immediate medical evaluation",
                        "priority": "Critical",
                        "timeline": "Within 1 hour",
                        "responsible": "Emergency physician"
                    },
                    {
                        "step": "Continuous vital signs monitoring",
                        "priority": "High",
                        "timeline": "Immediate",
                        "responsible": "Nursing staff"
                    }
                ])
            
            # Diagnostic steps
            if combined_data["lab_analysis"].get("abnormal_results"):
                next_steps.append({
                    "step": "Follow-up laboratory tests",
                    "priority": "Medium",
                    "timeline": "Within 24 hours",
                    "responsible": "Laboratory"
                })
            
            if combined_data["imaging_analysis"].get("abnormalities"):
                next_steps.append({
                    "step": "Additional imaging studies",
                    "priority": "Medium",
                    "timeline": "Within 48 hours",
                    "responsible": "Radiology"
                })
            
            # Treatment steps
            diagnosis = primary_diagnosis.get("diagnosis", "")
            if diagnosis:
                next_steps.append({
                    "step": f"Initiate treatment for {diagnosis}",
                    "priority": "High",
                    "timeline": "Within 24 hours",
                    "responsible": "Attending physician"
                })
            
            # Follow-up steps
            next_steps.append({
                "step": "Schedule follow-up appointment",
                "priority": "Medium",
                "timeline": "Within 1 week",
                "responsible": "Primary care physician"
            })
            
            return next_steps
            
        except Exception as e:
            logger.error(f"Error generating next steps: {e}")
            return [{"step": "Error generating next steps", "priority": "Unknown", "timeline": "Unknown"}]
    
    def _calculate_confidence_score(self, combined_data: Dict[str, Any]) -> float:
        """Calculate confidence score for the diagnosis."""
        try:
            # Factors that increase confidence
            factors = []
            
            # Lab results
            if combined_data["lab_analysis"].get("abnormal_results"):
                factors.append(0.3)
            
            # Imaging findings
            if combined_data["imaging_analysis"].get("findings"):
                factors.append(0.2)
            
            # Clear symptoms
            if combined_data["notes_analysis"].get("symptoms"):
                factors.append(0.2)
            
            # Risk factors
            if combined_data["history_analysis"].get("risk_factors"):
                factors.append(0.1)
            
            # Primary diagnosis confidence
            primary_diagnosis = combined_data.get("primary_diagnosis", {})
            if primary_diagnosis.get("confidence"):
                factors.append(primary_diagnosis["confidence"] * 0.2)
            
            confidence = min(sum(factors), 1.0)
            return confidence
            
        except Exception as e:
            logger.error(f"Error calculating confidence score: {e}")
            return 0.5
    
    def _calculate_urgency_level(self, combined_data: Dict[str, Any]) -> str:
        """Calculate urgency level based on all data sources."""
        try:
            urgency_score = combined_data["notes_analysis"].get("urgency_score", 0)
            critical_labs = len(combined_data["lab_analysis"].get("critical_values", []))
            risk_level = combined_data.get("risk_assessment", {}).get("risk_level", "Low")
            
            total_urgency = urgency_score + (critical_labs * 0.3) + (0.5 if risk_level == "High" else 0)
            
            if total_urgency > 0.8:
                return "Critical"
            elif total_urgency > 0.6:
                return "High"
            elif total_urgency > 0.4:
                return "Medium"
            else:
                return "Low"
                
        except Exception as e:
            logger.error(f"Error calculating urgency level: {e}")
            return "Unknown"
    
    def _update_patient_context(self, patient_id: int, analysis_result: Dict[str, Any]):
        """Update patient context for real-time analysis."""
        if patient_id not in self.patient_contexts:
            self.patient_contexts[patient_id] = []
        
        self.patient_contexts[patient_id].append(analysis_result)
        
        # Keep only last 10 analyses to prevent memory issues
        if len(self.patient_contexts[patient_id]) > 10:
            self.patient_contexts[patient_id] = self.patient_contexts[patient_id][-10:]
    
    def _calculate_urgency(self, notes: str, sentiment_result: List[Dict[str, Any]]) -> float:
        """Calculate urgency score based on notes content and sentiment."""
        urgency_keywords = [
            "emergency", "urgent", "critical", "severe", "acute", "immediate",
            "chest pain", "shortness of breath", "unconscious", "bleeding",
            "high fever", "severe pain", "dizziness", "fainting"
        ]
        
        urgency_score = 0.0
        
        # Check for urgency keywords
        notes_lower = notes.lower()
        for keyword in urgency_keywords:
            if keyword in notes_lower:
                urgency_score += 0.2
        
        # Consider sentiment
        if sentiment_result[0]["label"] == "NEGATIVE":
            urgency_score += 0.3
        elif sentiment_result[0]["label"] == "POSITIVE":
            urgency_score -= 0.1
        
        return min(urgency_score, 1.0)
    
    def _extract_diagnosis_features(self, combined_data: Dict[str, Any]) -> List[float]:
        """Extract features for diagnosis prediction."""
        features = []
        
        # Symptom count
        symptoms = combined_data["notes_analysis"].get("symptoms", [])
        features.append(len(symptoms))
        
        # Abnormal lab count
        abnormal_labs = combined_data["lab_analysis"].get("abnormal_results", [])
        features.append(len(abnormal_labs))
        
        # Imaging findings count
        imaging_findings = combined_data["imaging_analysis"].get("findings", [])
        features.append(len(imaging_findings))
        
        # Risk factors count
        risk_factors = combined_data["history_analysis"].get("risk_factors", [])
        features.append(len(risk_factors))
        
        # Urgency score
        urgency_score = combined_data["notes_analysis"].get("urgency_score", 0)
        features.append(urgency_score)
        
        return features
    
    def _is_chronic_condition(self, condition: str) -> bool:
        """Check if a condition is chronic."""
        chronic_conditions = [
            "diabetes", "hypertension", "asthma", "copd", "heart disease",
            "kidney disease", "liver disease", "arthritis", "depression",
            "anxiety", "obesity", "sleep apnea"
        ]
        
        return any(chronic in condition.lower() for chronic in chronic_conditions)
    
    def _check_drug_interactions(self, medications: List[str]) -> List[Dict[str, str]]:
        """Check for potential drug interactions."""
        # This would typically use a drug interaction database
        # For now, return basic interactions
        interactions = []
        
        if "warfarin" in medications and "aspirin" in medications:
            interactions.append({
                "drug1": "warfarin",
                "drug2": "aspirin",
                "interaction": "Increased bleeding risk"
            })
        
        return interactions
    
    def _identify_risk_factors(self, patient_data: Dict[str, Any]) -> List[str]:
        """Identify risk factors from patient data."""
        risk_factors = []
        
        # Age-based risks
        age = patient_data.get("age", 0)
        if age > 65:
            risk_factors.append("Advanced age")
        
        # Medical history risks
        if patient_data.get("smoking"):
            risk_factors.append("Smoking")
        
        if patient_data.get("obesity"):
            risk_factors.append("Obesity")
        
        # Family history risks
        if patient_data.get("family_history"):
            risk_factors.extend(patient_data["family_history"])
        
        return risk_factors
    
    def _analyze_medical_patterns(self, patient_data: Dict[str, Any]) -> List[str]:
        """Analyze medical patterns in patient data."""
        patterns = []
        
        # This would typically use more sophisticated pattern recognition
        # For now, return basic patterns
        
        return patterns
    
    def _check_abnormal_value(self, value: float, reference_range: str) -> bool:
        """Check if a lab value is abnormal."""
        try:
            # Parse reference range (e.g., "10-20" or "<5" or ">100")
            if "-" in reference_range:
                min_val, max_val = map(float, reference_range.split("-"))
                return value < min_val or value > max_val
            elif "<" in reference_range:
                threshold = float(reference_range.replace("<", ""))
                return value >= threshold
            elif ">" in reference_range:
                threshold = float(reference_range.replace(">", ""))
                return value <= threshold
            else:
                return False
        except:
            return False
    
    def _is_critical_value(self, value: float, reference_range: str) -> bool:
        """Check if a lab value is critical."""
        # This would use critical value thresholds
        # For now, use a simple heuristic
        return self._check_abnormal_value(value, reference_range)
    
    def _calculate_severity(self, value: float, reference_range: str) -> str:
        """Calculate severity of abnormal value."""
        # This would use severity thresholds
        # For now, return basic severity
        return "Moderate"
    
    def _analyze_lab_trends(self, lab_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze trends in lab results."""
        trends = []
        
        # Group by test type and analyze trends
        test_groups = {}
        for test in lab_data:
            test_name = test.get("test_name", "")
            if test_name not in test_groups:
                test_groups[test_name] = []
            test_groups[test_name].append(test)
        
        for test_name, tests in test_groups.items():
            if len(tests) > 1:
                # Sort by date
                tests.sort(key=lambda x: x.get("test_date", ""))
                
                # Analyze trend
                values = [t.get("result_value", 0) for t in tests]
                if len(values) >= 2:
                    trend = "increasing" if values[-1] > values[0] else "decreasing"
                    trends.append({
                        "test_name": test_name,
                        "trend": trend,
                        "change": values[-1] - values[0]
                    })
        
        return trends
    
    def _interpret_lab_results(self, lab_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Interpret lab results and provide clinical significance."""
        interpretation = {
            "summary": "",
            "clinical_significance": [],
            "recommendations": []
        }
        
        abnormal_count = len(lab_analysis.get("abnormal_results", []))
        critical_count = len(lab_analysis.get("critical_values", []))
        
        if critical_count > 0:
            interpretation["summary"] = f"Critical lab values detected. Immediate attention required."
        elif abnormal_count > 0:
            interpretation["summary"] = f"{abnormal_count} abnormal lab values detected."
        else:
            interpretation["summary"] = "All lab values within normal range."
        
        return interpretation
    
    def _generate_lab_recommendations(self, lab_analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on lab results."""
        recommendations = []
        
        for abnormal in lab_analysis.get("abnormal_results", []):
            test_name = abnormal.get("test_name", "")
            if "glucose" in test_name.lower():
                recommendations.append("Monitor blood glucose levels closely")
            elif "creatinine" in test_name.lower():
                recommendations.append("Monitor kidney function")
            elif "liver" in test_name.lower():
                recommendations.append("Monitor liver function")
        
        return recommendations
    
    def _analyze_imaging_findings(self, findings: str) -> List[Dict[str, Any]]:
        """Analyze imaging findings text."""
        findings_list = []
        
        # Simple keyword-based analysis
        if "mass" in findings.lower():
            findings_list.append({
                "finding": "Mass detected",
                "severity": "High",
                "recommendation": "Further evaluation required"
            })
        
        if "fracture" in findings.lower():
            findings_list.append({
                "finding": "Fracture detected",
                "severity": "Medium",
                "recommendation": "Orthopedic consultation"
            })
        
        return findings_list
    
    def _identify_imaging_abnormalities(self, image_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify abnormalities in imaging data."""
        abnormalities = []
        
        # This would typically use computer vision models
        # For now, use basic analysis
        
        return abnormalities
    
    def _process_imaging_measurements(self, measurements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process imaging measurements."""
        processed = []
        
        for key, value in measurements.items():
            processed.append({
                "measurement": key,
                "value": value,
                "unit": "mm"  # Default unit
            })
        
        return processed
    
    def _compare_imaging_results(self, imaging_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Compare current imaging with previous studies."""
        comparisons = []
        
        # This would compare current imaging with previous studies
        # For now, return basic comparison
        
        return comparisons
    
    def _generate_imaging_recommendations(self, imaging_analysis: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on imaging analysis."""
        recommendations = []
        
        if imaging_analysis.get("abnormalities"):
            recommendations.append("Follow-up imaging recommended")
        
        if imaging_analysis.get("findings"):
            recommendations.append("Radiologist consultation recommended")
        
        return recommendations
    
    def _generate_risk_recommendations(self, risk_level: str, risk_factors: List[str]) -> List[str]:
        """Generate recommendations based on risk level."""
        recommendations = []
        
        if risk_level == "High":
            recommendations.extend([
                "Immediate medical evaluation",
                "Continuous monitoring",
                "Emergency contact established"
            ])
        elif risk_level == "Medium":
            recommendations.extend([
                "Close monitoring",
                "Regular follow-up",
                "Lifestyle modifications"
            ])
        else:
            recommendations.extend([
                "Routine monitoring",
                "Preventive care"
            ])
        
        return recommendations 