"""
FastAPI application for AI-powered hospital management system
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import asyncio

from .routes import diagnosis, clinical_support
from ..utils.logging import setup_logging
from ..ai.enhanced_diagnosis import EnhancedDiagnosisAI

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Hospital Management AI Service",
    description="AI-powered diagnosis and clinical support system",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize enhanced AI system
enhanced_ai = EnhancedDiagnosisAI()

@app.on_event("startup")
async def startup_event():
    """Initialize AI knowledge base on startup"""
    try:
        logger.info("Initializing enhanced AI knowledge base...")
        await enhanced_ai.initialize_knowledge_base()
        logger.info("Enhanced AI knowledge base initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing AI knowledge base: {e}")

# Include routers
app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["diagnosis"])
app.include_router(clinical_support.router, prefix="/api/v1/clinical-support", tags=["clinical-support"])

# Register custom 405 handler
diagnosis.add_custom_405_handler(app)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Hospital Management AI Service",
        "version": "2.0.0",
        "status": "running",
        "ai_status": "enhanced"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ai_system": "enhanced",
        "data_sources": {
            "who_data": len([k for k in enhanced_ai.medical_knowledge_base.keys() if k.startswith('who_')]),
            "drug_data": len([k for k in enhanced_ai.medical_knowledge_base.keys() if k.startswith('drug_')]),
            "research_data": len([k for k in enhanced_ai.medical_knowledge_base.keys() if k.startswith('research_')])
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
