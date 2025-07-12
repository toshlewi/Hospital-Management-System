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

@router.post("/query", response_model=ClinicalSupportResponse)
async def get_clinical_support(request: ClinicalSupportRequest):
    """Get clinical decision support for medical questions"""
    try:
        # Mock implementation - in real system, this would use medical knowledge base
        answer = "Based on current medical guidelines and evidence..."
        
        return ClinicalSupportResponse(
            answer=answer,
            confidence=0.8,
            evidence=["Clinical guidelines", "Recent studies"],
            recommendations=["Follow standard protocols", "Monitor patient response"],
            sources=["PubMed", "Clinical guidelines"]
        )
    except Exception as e:
        logger.error(f"Error providing clinical support: {e}")
        raise HTTPException(status_code=500, detail="Failed to provide clinical support")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "clinical_support"} 