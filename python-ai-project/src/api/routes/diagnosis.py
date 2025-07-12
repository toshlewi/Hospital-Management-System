"""
FastAPI routes for real-time AI diagnosis
Provides endpoints for analyzing clinician notes, patient data, and generating comprehensive diagnosis.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import json
import logging
from datetime import datetime

from ...ai.diagnosis import RealTimeDiagnosisAI
from ...utils.auth import get_current_user
from ...utils.database import get_db_session

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize AI diagnosis system
diagnosis_ai = RealTimeDiagnosisAI()

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

@router.post("/analyze-notes", response_model=RealTimeAnalysisResponse)
async def analyze_clinician_notes(
    request: ClinicianNotesRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Analyze clinician notes in real-time to extract symptoms, urgency, and medical insights.
    """
    try:
        logger.info(f"Analyzing notes for patient {request.patient_id}")
        
        # Analyze the notes
        analysis_result = await diagnosis_ai.analyze_clinician_notes(
            request.notes, 
            request.patient_id
        )
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        # Generate recommendations based on analysis
        recommendations = _generate_recommendations_from_analysis(analysis_result)
        
        response = RealTimeAnalysisResponse(
            patient_id=request.patient_id,
            timestamp=datetime.now(),
            symptoms=analysis_result.get("symptoms", []),
            urgency_score=analysis_result.get("urgency_score", 0.0),
            medical_category=analysis_result.get("medical_category", "Unknown"),
            confidence=analysis_result.get("medical_confidence", 0.0),
            recommendations=recommendations
        )
        
        logger.info(f"Analysis completed for patient {request.patient_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing clinician notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/comprehensive-diagnosis", response_model=DiagnosisResponse)
async def generate_comprehensive_diagnosis(
    request: PatientDataRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Generate comprehensive diagnosis based on all available patient data.
    """
    try:
        logger.info(f"Generating comprehensive diagnosis for patient {request.patient_id}")
        
        # Generate comprehensive diagnosis
        diagnosis_result = await diagnosis_ai.generate_comprehensive_diagnosis(
            patient_id=request.patient_id,
            current_notes=request.current_notes,
            patient_history=request.patient_history,
            lab_results=request.lab_results,
            imaging_results=request.imaging_results
        )
        
        if "error" in diagnosis_result:
            raise HTTPException(status_code=500, detail=diagnosis_result["error"])
        
        # Convert to response model
        response = DiagnosisResponse(
            patient_id=diagnosis_result["patient_id"],
            timestamp=datetime.fromisoformat(diagnosis_result["timestamp"]),
            primary_diagnosis=diagnosis_result["primary_diagnosis"],
            differential_diagnosis=diagnosis_result["differential_diagnosis"],
            risk_assessment=diagnosis_result["risk_assessment"],
            treatment_plan=diagnosis_result["treatment_plan"],
            next_steps=diagnosis_result["next_steps"],
            confidence_score=diagnosis_result["confidence_score"],
            urgency_level=diagnosis_result["urgency_level"],
            data_sources=diagnosis_result["data_sources"]
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
    current_user: Dict = Depends(get_current_user)
):
    """
    Stream real-time diagnosis analysis as the clinician types.
    """
    async def generate_stream():
        try:
            # Initial analysis
            analysis_result = await diagnosis_ai.analyze_clinician_notes(
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
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@router.get("/patient-context/{patient_id}")
async def get_patient_context(
    patient_id: int,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get the current AI context for a patient.
    """
    try:
        context = diagnosis_ai.patient_contexts.get(patient_id, [])
        return {
            "patient_id": patient_id,
            "context": context,
            "context_count": len(context)
        }
    except Exception as e:
        logger.error(f"Error getting patient context: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/patient-context/{patient_id}")
async def clear_patient_context(
    patient_id: int,
    current_user: Dict = Depends(get_current_user)
):
    """
    Clear the AI context for a patient.
    """
    try:
        if patient_id in diagnosis_ai.patient_contexts:
            del diagnosis_ai.patient_contexts[patient_id]
        
        if patient_id in diagnosis_ai.diagnosis_cache:
            del diagnosis_ai.diagnosis_cache[patient_id]
        
        return {"message": f"Context cleared for patient {patient_id}"}
    except Exception as e:
        logger.error(f"Error clearing patient context: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diagnosis-cache/{patient_id}")
async def get_cached_diagnosis(
    patient_id: int,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get cached diagnosis for a patient.
    """
    try:
        cached_diagnosis = diagnosis_ai.diagnosis_cache.get(patient_id)
        if cached_diagnosis:
            return cached_diagnosis
        else:
            raise HTTPException(status_code=404, detail="No cached diagnosis found")
    except Exception as e:
        logger.error(f"Error getting cached diagnosis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-lab-results")
async def analyze_lab_results(
    lab_data: List[Dict[str, Any]],
    patient_id: int,
    current_user: Dict = Depends(get_current_user)
):
    """
    Analyze laboratory test results.
    """
    try:
        logger.info(f"Analyzing lab results for patient {patient_id}")
        
        analysis_result = await diagnosis_ai.analyze_lab_results(lab_data)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error analyzing lab results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-imaging-results")
async def analyze_imaging_results(
    imaging_data: List[Dict[str, Any]],
    patient_id: int,
    current_user: Dict = Depends(get_current_user)
):
    """
    Analyze medical imaging results.
    """
    try:
        logger.info(f"Analyzing imaging results for patient {patient_id}")
        
        analysis_result = await diagnosis_ai.analyze_imaging_results(imaging_data)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error analyzing imaging results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/risk-assessment")
async def assess_patient_risk(
    patient_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user)
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
        
        analysis_result = await diagnosis_ai.analyze_patient_history(patient_history)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        # Generate risk assessment
        risk_assessment = await diagnosis_ai._assess_patient_risk({
            "history_analysis": analysis_result,
            "lab_analysis": {"critical_values": []},
            "notes_analysis": {"urgency_score": 0}
        })
        
        return risk_assessment
        
    except Exception as e:
        logger.error(f"Error assessing patient risk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def diagnosis_health_check():
    """
    Health check for the diagnosis AI service.
    """
    try:
        # Check if AI models are loaded
        models_loaded = (
            hasattr(diagnosis_ai, 'diagnosis_classifier') and
            hasattr(diagnosis_ai, 'risk_assessor') and
            hasattr(diagnosis_ai, 'nlp')
        )
        
        return {
            "status": "healthy" if models_loaded else "degraded",
            "models_loaded": models_loaded,
            "timestamp": datetime.now().isoformat(),
            "service": "diagnosis-ai"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
            "service": "diagnosis-ai"
        }

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