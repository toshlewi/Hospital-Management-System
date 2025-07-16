#!/usr/bin/env python3
"""
Clinical decision support API routes
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ClinicalSupportRequest(BaseModel):
    clinical_question: str
    patient_context: Optional[dict] = None
    evidence_level: Optional[str] = "moderate"

class ClinicalSupportResponse(BaseModel):
    answer: str
    confidence: float
    evidence: List[str]
    recommendations: List[str]
    sources: List[str]

# Simple FAQ/knowledge base for demo
FAQ_KB = {
    "what are the symptoms of malaria?": "Common symptoms of malaria include fever, chills, sweating, headache, nausea, vomiting, muscle pain, and fatigue.",
    "what is malaria?": "Malaria is a mosquito-borne infectious disease caused by Plasmodium parasites. It is characterized by fever, chills, and flu-like symptoms.",
    "what are the side effects of metformin?": "Common side effects of metformin include nausea, vomiting, diarrhea, abdominal pain, and loss of appetite.",
    "what is hypertension?": "Hypertension, or high blood pressure, is a condition in which the force of the blood against the artery walls is too high.",
    "what are the symptoms of covid-19?": "Common symptoms of COVID-19 include fever, cough, shortness of breath, fatigue, and loss of taste or smell.",
    "what is diabetes?": "Diabetes is a chronic condition that affects how your body turns food into energy, resulting in high blood sugar levels."
}

# Helper function for partial/keyword FAQ matching
FAQ_KEYWORDS = [
    (['malaria', 'symptom'], "Common symptoms of malaria include fever, chills, sweating, headache, nausea, vomiting, muscle pain, and fatigue."),
    (['malaria'], "Malaria is a mosquito-borne infectious disease caused by Plasmodium parasites. It is characterized by fever, chills, and flu-like symptoms."),
    (['metformin', 'side effect'], "Common side effects of metformin include nausea, vomiting, diarrhea, abdominal pain, and loss of appetite."),
    (['hypertension'], "Hypertension, or high blood pressure, is a condition in which the force of the blood against the artery walls is too high."),
    (['covid', 'symptom'], "Common symptoms of COVID-19 include fever, cough, shortness of breath, fatigue, and loss of taste or smell."),
    (['diabetes'], "Diabetes is a chronic condition that affects how your body turns food into energy, resulting in high blood sugar levels.")
]

@router.post("/query", response_model=ClinicalSupportResponse)
async def get_clinical_support(request: ClinicalSupportRequest):
    """Get clinical decision support for medical questions"""
    try:
        question = request.clinical_question.strip().lower()
        # Try to answer from FAQ/knowledge base (exact match)
        answer = FAQ_KB.get(question)
        # If not found, try partial/keyword match
        if not answer:
            for keywords, resp in FAQ_KEYWORDS:
                if all(k in question for k in keywords):
                    answer = resp
                    break
        if not answer:
            # Fallback generic answer
            answer = "I'm sorry, I don't have a specific answer for that question. Please consult a medical professional or refer to trusted medical resources."
        return ClinicalSupportResponse(
            answer=answer,
            confidence=0.9 if answer != "I'm sorry, I don't have a specific answer for that question. Please consult a medical professional or refer to trusted medical resources." else 0.5,
            evidence=["FAQ knowledge base" if answer else "General medical knowledge"],
            recommendations=["Consult a physician for further advice"],
            sources=["WHO", "CDC", "PubMed"]
        )
    except Exception as e:
        logger.error(f"Error providing clinical support: {e}")
        raise HTTPException(status_code=500, detail="Failed to provide clinical support")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "clinical_support"} 