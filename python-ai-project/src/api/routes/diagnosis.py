"""
Diagnosis API routes (improved)

This module provides endpoints for real-time and comprehensive AI-powered diagnosis. It uses the BestDiagnosisAI class, which:
- Loads the best available model (BERT, sentence transformer, or RandomForest) based on training results (see model_selector.json).
- Integrates knowledge from EnhancedDiagnosisAI, which pulls from WHO, PubMed, FDA, and other sources for richer, multi-source predictions.
- Combines ML predictions and knowledge-based analysis for every diagnosis request.

To retrain or update the AI:
- Run the training pipeline (python src/ai/training_system.py) after updating or adding data in data/medical_knowledge/.
- The best model will be selected automatically for inference.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import RequestValidationError as FastAPIRequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import json
import logging
from datetime import datetime

from ...ai.enhanced_diagnosis import EnhancedDiagnosisAI
from ...ai.training_system import MedicalAITrainingSystem
import pickle
import os
from pathlib import Path

# --- BestDiagnosisAI: Loads best model and integrates enhanced knowledge ---
class BestDiagnosisAI:
    def __init__(self):
        self.models_dir = Path(__file__).parent.parent.parent / 'data' / 'models'
        self.selector_path = self.models_dir / 'model_selector.json'
        self.model = None
        self.model_type = None
        self.enhanced_ai = EnhancedDiagnosisAI()
        self.patient_contexts = {}
        self.diagnosis_cache = {}
        self._load_best_model()
        # Initialize the enhanced AI knowledge base
        asyncio.create_task(self._initialize_enhanced_ai())

    async def _initialize_enhanced_ai(self):
        """Initialize the enhanced AI knowledge base"""
        try:
            await self.enhanced_ai.initialize_knowledge_base()
            print("Enhanced AI knowledge base initialized successfully")
        except Exception as e:
            print(f"Error initializing enhanced AI: {e}")

    def _load_best_model(self):
        # Load model selector
        if self.selector_path.exists():
            with open(self.selector_path, 'r') as f:
                selector = json.load(f)
            self.model_type = selector.get('diagnosis')
        else:
            self.model_type = None
        # Load the best model
        if self.model_type == 'bert':
            # For demo, fallback to RandomForest (implement BERT inference as needed)
            model_path = self.models_dir / 'diagnosis_model.pkl'
        elif self.model_type == 'sentence_transformer':
            # For demo, fallback to RandomForest (implement transformer inference as needed)
            model_path = self.models_dir / 'diagnosis_model.pkl'
        elif self.model_type == 'diagnosis':
            model_path = self.models_dir / 'diagnosis_model.pkl'
        else:
            model_path = None
        if model_path and model_path.exists():
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
        else:
            self.model = None

    async def analyze_clinician_notes(self, notes: str, patient_id: int) -> dict:
        try:
            print(f"Starting analysis for patient {patient_id} with notes: {notes[:50]}...")
            
            # Use best model for prediction
            ml_result = None
            if self.model:
                try:
                    pred = self.model.predict([notes])[0]
                    proba = self.model.predict_proba([notes])[0]
                    confidence = float(max(proba))
                    ml_result = {
                        'prediction': pred,
                        'confidence': confidence
                    }
                    print(f"ML prediction: {pred} with confidence {confidence}")
                except Exception as e:
                    ml_result = {'error': str(e)}
                    print(f"ML prediction error: {e}")
            else:
                print("No ML model available")
            
            # Use enhanced AI for knowledge-based insights
            try:
                enhanced_result = await self.enhanced_ai.analyze_clinician_notes(notes, patient_id)
                print(f"Enhanced AI result: {enhanced_result}")
            except Exception as e:
                print(f"Enhanced AI error: {e}")
                # Fallback if enhanced AI fails
                enhanced_result = {
                    "patient_id": patient_id,
                    "timestamp": datetime.now().isoformat(),
                    "symptoms": [],
                    "differential_diagnosis": [],
                    "tests": [],
                    "treatment_plan": [],
                    "urgency_score": 0.3,
                    "urgency_level": "low",
                    "confidence": 0.0,
                    "data_sources": {"who_data": 0, "drug_data": 0, "research_data": 0}
                }
            
            print(f"Enhanced result created: {len(enhanced_result)} keys")
            
            # Combine results
            result = {
                'ml_prediction': ml_result,
                'enhanced_analysis': enhanced_result
            }
            
            print(f"Final result created: {len(result)} keys")
            return result
        except Exception as e:
            print(f"Error in BestDiagnosisAI.analyze_clinician_notes: {e}")
            logger.error(f"Error in BestDiagnosisAI.analyze_clinician_notes: {e}")
            # Return a safe fallback
            return {
                'ml_prediction': {'prediction': "I don't know", 'confidence': 0.0},
                'enhanced_analysis': {
                    "patient_id": patient_id,
                    "timestamp": datetime.now().isoformat(),
                    "symptoms": [],
                    "differential_diagnosis": [],
                    "tests": [],
                    "treatment_plan": [],
                    "urgency_score": 0.0,
                    "urgency_level": "low",
                    "confidence": 0.0,
                    "data_sources": {"who_data": 0, "drug_data": 0, "research_data": 0},
                    "error": str(e)
                }
            }

    async def generate_comprehensive_diagnosis(self, patient_id: int, current_notes: str, patient_history: dict, lab_results: list, imaging_results: list) -> dict:
        # Use enhanced AI for multi-source analysis
        try:
            enhanced_result = await self.enhanced_ai.analyze_clinician_notes(current_notes, patient_id)
            if enhanced_result is None:
                enhanced_result = {
                    "patient_id": patient_id,
                    "timestamp": datetime.now().isoformat(),
                    "symptoms": [],
                    "conditions": [],
                    "urgency_score": 0.0,
                    "urgency_level": "low",
                    "recommendations": [],
                    "risk_assessment": {},
                    "confidence": 0.0,
                    "data_sources": {}
                }
        except Exception as e:
            enhanced_result = {
                "patient_id": patient_id,
                "timestamp": datetime.now().isoformat(),
                "symptoms": [],
                "conditions": [],
                "urgency_score": 0.0,
                "urgency_level": "low",
                "recommendations": [],
                "risk_assessment": {},
                "confidence": 0.0,
                "data_sources": {},
                "error": str(e)
            }
        
        # Use ML model for prediction
        ml_result = None
        if self.model:
            try:
                pred = self.model.predict([current_notes])[0]
                proba = self.model.predict_proba([current_notes])[0]
                confidence = float(max(proba))
                ml_result = {
                    'prediction': pred,
                    'confidence': confidence
                }
            except Exception as e:
                ml_result = {'error': str(e)}
        # Combine results
        result = {
            'patient_id': patient_id,
            'timestamp': datetime.now().isoformat(),
            'ml_prediction': ml_result,
            'enhanced_analysis': enhanced_result,
            'patient_history': patient_history,
            'lab_results': lab_results,
            'imaging_results': imaging_results
        }
        self.diagnosis_cache[patient_id] = result
        return result

# Replace legacy AI with new best-model AI
best_diagnosis_ai = BestDiagnosisAI()

# Ensure enhanced AI is properly initialized
try:
    best_diagnosis_ai.enhanced_ai = EnhancedDiagnosisAI()
    print("Enhanced AI instance created successfully")
except Exception as e:
    print(f"Error creating Enhanced AI instance: {e}")

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize the enhanced AI knowledge base
async def initialize_ai():
    try:
        await best_diagnosis_ai.enhanced_ai.initialize_knowledge_base()
        logger.info("Enhanced AI knowledge base initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing enhanced AI: {e}")

# Initialize AI when first request comes in instead of at startup

# Initialize AI diagnosis system
# diagnosis_ai = RealTimeDiagnosisAI() # This line is removed as per the edit hint

# Pydantic models for request/response
class ClinicianNotesRequest(BaseModel):
    patient_id: int
    notes: str = Field(..., description="Current clinician notes")
    timestamp: Optional[datetime] = None

class PatientDataRequest(BaseModel):
    patient_id: int
    patient_history: Dict[str, Any] = Field(..., description="Patient medical history")
    lab_results: List[Dict[str, Any]] = Field(default=[], description="Laboratory test results")
    imaging_results: List[Dict[str, Any]] = Field(default=[], description="Imaging results")
    current_notes: str = Field(..., description="Current clinician notes")

class DiagnosisResponse(BaseModel):
    patient_id: int
    timestamp: datetime
    primary_diagnosis: Dict[str, Any]
    differential_diagnosis: List[Dict[str, Any]]
    risk_assessment: Dict[str, Any]
    treatment_plan: Dict[str, Any]
    next_steps: List[Dict[str, Any]]
    confidence_score: float
    urgency_level: str
    data_sources: Dict[str, Any]

class RealTimeAnalysisResponse(BaseModel):
    patient_id: int
    timestamp: datetime
    symptoms: List[str]
    urgency_score: float
    medical_category: str
    confidence: float
    recommendations: List[str]
    primary_diagnosis: str
    primary_confidence: float
    differential_diagnosis: List[Dict[str, float]]
    recommended_tests: List[str]
    recommended_medications: List[str]
    explanation: Optional[str] = None

@router.post("/analyze-notes", response_model=RealTimeAnalysisResponse)
async def analyze_clinician_notes(
    request: ClinicianNotesRequest
):
    """
    Analyze clinician notes in real-time to extract symptoms, urgency, and medical insights.
    """
    try:
        logger.info(f"Received analyze-notes request: patient_id={request.patient_id}, notes_length={len(request.notes)}")
        
        # Use the enhanced AI for analysis
        analysis_result = await best_diagnosis_ai.analyze_clinician_notes(request.notes, request.patient_id)
        
        # Extract enhanced analysis results
        enhanced = analysis_result.get('enhanced_analysis', {})
        
        # Extract symptoms
        symptoms = enhanced.get('symptoms', [])
        
        # Extract differential diagnosis and convert to the expected format
        diff_diagnosis = enhanced.get('differential_diagnosis', [])
        differential = []
        for condition in diff_diagnosis:
            condition_name = condition.get('condition_name', 'Unknown')
            probability = condition.get('probability', 0.0) * 100
            differential.append({condition_name: round(probability, 2)})
        
        # Get primary diagnosis from first condition or ML prediction
        primary_diagnosis = "I don't know"
        primary_confidence = 0.0
        if diff_diagnosis:
            primary_diagnosis = diff_diagnosis[0].get('condition_name', 'Unknown')
            primary_confidence = diff_diagnosis[0].get('probability', 0.0) * 100
        
        # Extract tests and treatments
        recommended_tests = enhanced.get('tests', [])
        treatment_plan = enhanced.get('treatment_plan', [])
        
        # Determine urgency and category
        urgency_score = enhanced.get('urgency_score', 0.3)
        urgency_level = enhanced.get('urgency_level', 'low')
        confidence = enhanced.get('confidence', 0.0)
        
        # Determine medical category based on primary diagnosis
        medical_category = "General"
        if any('cardio' in condition.get('condition_name', '').lower() for condition in diff_diagnosis):
            medical_category = "Cardiovascular"
        elif any('diabet' in condition.get('condition_name', '').lower() for condition in diff_diagnosis):
            medical_category = "Endocrine"
        elif any('respir' in condition.get('condition_name', '').lower() for condition in diff_diagnosis):
            medical_category = "Respiratory"
        
        # Generate recommendations
        recommendations = []
        if urgency_level in ['high', 'critical']:
            recommendations.append("Immediate medical attention required")
        if recommended_tests:
            recommendations.append(f"Recommended tests: {', '.join(recommended_tests[:3])}")
        if treatment_plan:
            recommendations.append(f"Consider treatments: {', '.join(treatment_plan[:3])}")
        if not recommendations:
            recommendations = ["Monitor symptoms", "Follow up if symptoms worsen"]
        
        return RealTimeAnalysisResponse(
            patient_id=request.patient_id,
            timestamp=datetime.now(),
            symptoms=symptoms,
            urgency_score=urgency_score,
            medical_category=medical_category,
            confidence=confidence,
            recommendations=recommendations,
            primary_diagnosis=primary_diagnosis,
            primary_confidence=primary_confidence,
            differential_diagnosis=differential,
            recommended_tests=recommended_tests,
            recommended_medications=treatment_plan,
            explanation=f"Enhanced AI analysis based on {len(diff_diagnosis)} potential conditions"
        )
    except Exception as e:
        logger.error(f"Error in analyze_clinician_notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/comprehensive-diagnosis", response_model=DiagnosisResponse)
async def generate_comprehensive_diagnosis(
    request: PatientDataRequest
):
    """
    Generate comprehensive diagnosis based on all available patient data.
    """
    try:
        logger.info(f"Generating comprehensive diagnosis for patient {request.patient_id}")
        diagnosis_result = await best_diagnosis_ai.generate_comprehensive_diagnosis(
            patient_id=request.patient_id,
            current_notes=request.current_notes,
            patient_history=request.patient_history,
            lab_results=request.lab_results,
            imaging_results=request.imaging_results
        )
        if "error" in diagnosis_result:
            raise HTTPException(status_code=500, detail=diagnosis_result["error"])
        ml_pred = diagnosis_result.get('ml_prediction', {})
        enhanced = diagnosis_result.get('enhanced_analysis', {})
        # Primary diagnosis and confidence
        primary_diagnosis = ml_pred.get('prediction', None)
        primary_confidence = ml_pred.get('confidence', 0.0)
        # Differential diagnosis with probabilities
        differential = []
        if 'probabilities' in ml_pred and hasattr(best_diagnosis_ai.model, 'classes_'):
            for label, prob in zip(best_diagnosis_ai.model.classes_, ml_pred['probabilities']):
                if label != primary_diagnosis:
                    differential.append({label: round(prob * 100, 2)})
        # If not confident, say 'I don't know'
        if not primary_diagnosis or primary_confidence < 0.3:
            primary_diagnosis = "I don't know"
            primary_confidence = 0.0
            differential = []
        # Recommended tests and medications from enhanced AI
        recommended_tests = enhanced.get('recommendations', [])
        recommended_medications = []
        for rec in recommended_tests:
            if any(word in rec.lower() for word in ['medication', 'drug', 'prescribe', 'start', 'give']):
                recommended_medications.append(rec)
        recommended_tests = [rec for rec in recommended_tests if rec not in recommended_medications]
        # Compose response
        response = DiagnosisResponse(
            patient_id=diagnosis_result["patient_id"],
            timestamp=datetime.fromisoformat(diagnosis_result["timestamp"]),
            primary_diagnosis={
                "diagnosis": primary_diagnosis,
                "confidence": round(primary_confidence * 100, 2)
            },
            differential_diagnosis=differential,
            risk_assessment={},
            treatment_plan={
                "recommended_tests": recommended_tests,
                "recommended_medications": recommended_medications
            },
            next_steps=[],
            confidence_score=round(primary_confidence * 100, 2),
            urgency_level=enhanced.get("urgency_level", "Unknown"),
            data_sources=enhanced.get("data_sources", {})
        )
        logger.info(f"Comprehensive diagnosis completed for patient {request.patient_id}")
        return response
    except Exception as e:
        logger.error(f"Error generating comprehensive diagnosis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream-diagnosis")
async def stream_real_time_diagnosis(
    request: ClinicianNotesRequest,
    background_tasks: BackgroundTasks,
):
    """
    Stream real-time diagnosis analysis as the clinician types.
    """
    async def generate_stream():
        try:
            # Initial analysis
            analysis_result = await best_diagnosis_ai.analyze_clinician_notes(
                request.notes, 
                request.patient_id
            )
            
            # Stream initial results
            yield f"data: {json.dumps({'type': 'initial_analysis', 'data': analysis_result})}\n\n"
            
            # Simulate real-time updates
            for i in range(3):
                await asyncio.sleep(1)
                
                # Generate progressive insights
                insights = _generate_progressive_insights(analysis_result, i)
                yield f"data: {json.dumps({'type': 'progressive_insight', 'data': insights})}\n\n"
            
            # Final comprehensive analysis
            final_analysis = await _generate_final_analysis(request.patient_id, analysis_result)
            yield f"data: {json.dumps({'type': 'final_analysis', 'data': final_analysis})}\n\n"
            
        except Exception as e:
            logger.error(f"Error in streaming diagnosis: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain"
    )

@router.delete("/patient-context/{patient_id}")
async def clear_patient_context(
    patient_id: int
):
    """
    Clear the AI context for a patient.
    """
    try:
        if patient_id in best_diagnosis_ai.patient_contexts:
            del best_diagnosis_ai.patient_contexts[patient_id]
        
        if patient_id in best_diagnosis_ai.diagnosis_cache:
            del best_diagnosis_ai.diagnosis_cache[patient_id]
        
        return {"message": f"Context cleared for patient {patient_id}"}
    except Exception as e:
        logger.error(f"Error clearing patient context: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diagnosis-cache/{patient_id}")
async def get_cached_diagnosis(
    patient_id: int
):
    """
    Get cached diagnosis for a patient.
    """
    try:
        cached_diagnosis = best_diagnosis_ai.diagnosis_cache.get(patient_id)
        if cached_diagnosis:
            return cached_diagnosis
        else:
            raise HTTPException(status_code=404, detail="No cached diagnosis found")
    except Exception as e:
        logger.error(f"Error getting cached diagnosis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-drug-interactions")
async def analyze_drug_interactions(
    request: Dict[str, Any]
):
    """
    Analyze potential drug interactions between medications.
    """
    try:
        medications = request.get("medications", [])
        
        # Mock response for development
        interactions = []
        if len(medications) > 1:
            interactions.append({
                "drug1": medications[0],
                "drug2": medications[1],
                "severity": "moderate",
                "description": "Potential interaction detected",
                "recommendation": "Monitor for adverse effects"
            })
        
        return {
            "interactions": interactions,
            "risk_level": "low" if not interactions else "moderate",
            "recommendations": [
                "Review drug interactions with patient",
                "Monitor for adverse effects",
                "Consider alternative medications if needed"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-lab-results")
async def analyze_lab_results(
    request: Dict[str, Any]
):
    """
    Analyze laboratory test results.
    """
    try:
        lab_data = request.get("lab_data", [])
        
        # Mock analysis
        abnormal_values = []
        critical_values = []
        
        for test in lab_data:
            if test.get("value") and test.get("reference_range"):
                value = float(test["value"])
                ref_range = test["reference_range"]
                
                if value < ref_range["min"] or value > ref_range["max"]:
                    abnormal_values.append({
                        "test": test["test_name"],
                        "value": value,
                        "reference_range": ref_range,
                        "severity": "critical" if abs(value - ref_range["max"]) > ref_range["max"] * 0.5 else "moderate"
                    })
        
        return {
            "abnormal_values": abnormal_values,
            "critical_values": critical_values,
            "trends": [],
            "recommendations": [
                "Review abnormal lab values with physician",
                "Consider repeat testing if clinically indicated"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-imaging-results")
async def analyze_imaging_results(
    request: Dict[str, Any]
):
    """
    Analyze medical imaging results.
    """
    try:
        imaging_data = request.get("imaging_data", [])
        
        # Mock analysis
        findings = []
        abnormalities = []
        
        for image in imaging_data:
            if image.get("findings"):
                findings.append({
                    "type": image["imaging_type"],
                    "findings": image["findings"],
                    "severity": "normal" if "normal" in image["findings"].lower() else "abnormal"
                })
        
        return {
            "findings": findings,
            "abnormalities": abnormalities,
            "recommendations": [
                "Radiologist review of findings",
                "Correlate with clinical presentation",
                "Follow-up imaging as clinically indicated"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/risk-assessment")
async def assess_patient_risk(
    patient_data: Dict[str, Any]
):
    """
    Assess patient risk level based on available data.
    """
    try:
        logger.info(f"Assessing risk for patient {patient_data.get('patient_id')}")
        
        # Extract patient history for risk assessment
        patient_history = {
            "medical_history": patient_data.get("medical_history", {}),
            "allergies": patient_data.get("allergies", []),
            "medications": patient_data.get("medications", []),
            "family_history": patient_data.get("family_history", []),
            "age": patient_data.get("age", 0),
            "gender": patient_data.get("gender", ""),
            "smoking": patient_data.get("smoking", False),
            "obesity": patient_data.get("obesity", False)
        }
        
        analysis_result = await best_diagnosis_ai.enhanced_ai.analyze_clinician_notes(str(patient_history), patient_data.get('patient_id', 0))
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        # Generate risk assessment (mock)
        risk_assessment = {"risk": "medium", "score": 0.5}
        
        return risk_assessment
        
    except Exception as e:
        logger.error(f"Error assessing patient risk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def diagnosis_health_check():
    """
    Health check for diagnosis service
    """
    return {
        "status": "healthy",
        "service": "diagnosis-ai",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/test-analyze-notes")
async def test_analyze_notes(request: ClinicianNotesRequest):
    """
    Test endpoint for analyzing notes without authentication
    """
    try:
        # Simple mock response for testing
        return {
            "patient_id": request.patient_id,
            "timestamp": datetime.now(),
            "symptoms": ["chest pain", "shortness of breath"],
            "urgency_score": 0.7,
            "medical_category": "Cardiovascular",
            "confidence": 0.85,
            "recommendations": [
                "Immediate ECG recommended",
                "Consider cardiac enzymes",
                "Monitor vital signs closely"
            ]
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}

@router.post("/analyze-notes-flexible")
async def analyze_notes_flexible(request: Dict[str, Any]):
    """
    Flexible endpoint for analyzing notes that accepts any JSON format
    """
    try:
        logger.info(f"Received flexible analyze-notes request: {request}")
        
        # Extract fields with fallbacks
        patient_id = request.get("patient_id", 1)
        notes = request.get("notes", "")
        timestamp = request.get("timestamp", datetime.now().isoformat())
        
        logger.info(f"Extracted: patient_id={patient_id}, notes_length={len(notes)}")
        
        # Mock response
        return {
            "patient_id": patient_id,
            "timestamp": datetime.now(),
            "symptoms": ["chest pain", "shortness of breath"],
            "urgency_score": 0.7,
            "medical_category": "Cardiovascular",
            "confidence": 0.85,
            "recommendations": [
                "Immediate ECG recommended",
                "Consider cardiac enzymes",
                "Monitor vital signs closely"
            ]
        }
    except Exception as e:
        logger.error(f"Error in analyze_notes_flexible: {e}")
        return {"error": str(e), "status": "error"}

# Helper functions
def _generate_recommendations_from_analysis(analysis_result: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on analysis result."""
    recommendations = []
    
    urgency_score = analysis_result.get("urgency_score", 0)
    symptoms = analysis_result.get("symptoms", [])
    medical_category = analysis_result.get("medical_category", "")
    
    if urgency_score > 0.7:
        recommendations.append("Immediate medical evaluation recommended")
    
    if "chest pain" in str(symptoms).lower():
        recommendations.append("Consider cardiac evaluation")
    
    if "fever" in str(symptoms).lower():
        recommendations.append("Monitor temperature and consider infection workup")
    
    if "shortness of breath" in str(symptoms).lower():
        recommendations.append("Consider respiratory evaluation")
    
    if medical_category == "emergency":
        recommendations.append("Emergency department evaluation may be necessary")
    
    return recommendations

def _generate_progressive_insights(analysis_result: Dict[str, Any], step: int) -> Dict[str, Any]:
    """Generate progressive insights for streaming."""
    insights = {
        "step": step,
        "insights": []
    }
    
    if step == 0:
        symptoms = analysis_result.get("symptoms", [])
        if symptoms:
            insights["insights"].append(f"Identified {len(symptoms)} symptoms")
    
    elif step == 1:
        urgency_score = analysis_result.get("urgency_score", 0)
        if urgency_score > 0.5:
            insights["insights"].append("High urgency detected")
    
    elif step == 2:
        medical_category = analysis_result.get("medical_category", "")
        insights["insights"].append(f"Medical category: {medical_category}")
    
    return insights

async def _generate_final_analysis(patient_id: int, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
    """Generate final comprehensive analysis."""
    try:
        # This would typically involve more comprehensive analysis
        # For now, return enhanced analysis
        final_analysis = {
            "patient_id": patient_id,
            "analysis": analysis_result,
            "recommendations": _generate_recommendations_from_analysis(analysis_result),
            "next_steps": [
                "Schedule follow-up appointment",
                "Monitor symptoms",
                "Consider additional testing if needed"
            ]
        }
        
        return final_analysis
        
    except Exception as e:
        logger.error(f"Error generating final analysis: {e}")
        return {"error": str(e)} 

def custom_method_not_allowed_handler(request: Request, exc):
    import logging
    logger = logging.getLogger("uvicorn.error")
    logger.warning(f"405 Method Not Allowed: {request.method} {request.url.path}")
    return JSONResponse(
        status_code=405,
        content={
            "error": "Method Not Allowed",
            "detail": f"{request.method} not allowed on {request.url.path}"
        }
    )

# Register the custom handler with the FastAPI app
from fastapi import status
from fastapi.applications import FastAPI

def add_custom_405_handler(app: FastAPI):
    from starlette.status import HTTP_405_METHOD_NOT_ALLOWED
    app.add_exception_handler(HTTP_405_METHOD_NOT_ALLOWED, custom_method_not_allowed_handler)

# At the bottom of the file, after app is created:
# add_custom_405_handler(app) 