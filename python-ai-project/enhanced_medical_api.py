#!/usr/bin/env python3
"""
Enhanced Medical AI API with Curated Mode
Uses curated dataset for deterministic 20-disease diagnoses
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import json
from datetime import datetime
import os

# Import the advanced AI system
from advanced_medical_ai import AdvancedMedicalAI

app = FastAPI(
    title="Enhanced Medical AI API",
    description="Advanced Medical AI with curated dataset for 20 diseases with deterministic diagnoses",
    version="3.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "https://hospital-frontend-5na8.onrender.com",
        "https://hospital-backend-g0oi.onrender.com"
    ],
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
    disease: str
    confidence: float
    severity: str
    symptoms: List[str]
    risk_factors: List[str]
    lab_tests: List[str]
    treatments: List[str]
    drug_interactions: List[str]
    model_accuracy: float
    diseases_learned: int
    timestamp: str

class ComprehensiveResponse(BaseModel):
    predictions: List[DiagnosisResponse]
    input_symptoms: str
    model_accuracy: float
    diseases_learned: int
    analysis_time: str

class TrainingStatusResponse(BaseModel):
    status: str
    diseases_collected: int
    training_data_count: int
    model_accuracy: float
    training_progress: str
    estimated_completion: Optional[str] = None

# Initialize the advanced AI system
advanced_ai = AdvancedMedicalAI()
training_task = None

@app.on_event("startup")
async def startup_event():
    """Initialize the advanced AI system on startup"""
    global advanced_ai
    
    try:
        # Load existing model if available
        await advanced_ai.load_existing_data()
        print(f"✅ Loaded AI model with {advanced_ai.accuracy:.2%} accuracy")
        print(f"🏥 Diseases in database: {len(advanced_ai.diseases_database)}")
        
        # Check if curated mode is enabled
        use_curated = os.getenv("USE_CURATED", "false").lower() == "true"
        auto_train = (os.getenv("AUTO_TRAIN_ON_STARTUP", "false").lower() == "true") and not use_curated
        
        if use_curated:
            print("🎯 Curated mode enabled - using deterministic dataset")
        elif auto_train:
            print("🚀 Auto-training enabled - starting training in background...")
            # Start training in background
            background_tasks = BackgroundTasks()
            background_tasks.add_task(train_advanced_ai)
            await background_tasks()
        else:
            print("⏸️ Auto-training disabled - skipping initial training")
        
        print("📅 Auto-update scheduler disabled (curated mode)")
        
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        # Continue anyway - the service should still be usable

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    # Nothing to stop now that scheduler is removed
    pass

@app.get("/")
async def root():
    """Root endpoint with basic information"""
    use_curated = os.getenv("USE_CURATED", "false").lower() == "true"
    return {
        "message": "Enhanced Medical AI API",
        "version": "3.0.0",
        "status": "operational",
        "model_accuracy": f"{advanced_ai.accuracy:.2%}",
        "diseases_learned": len(advanced_ai.diseases_database),
        "curated_mode": use_curated,
        "auto_training": (os.getenv("AUTO_TRAIN_ON_STARTUP", "false").lower() == "true") and not use_curated
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        use_curated = os.getenv("USE_CURATED", "false").lower() == "true"
        return {
            "status": "healthy",
            "model_loaded": advanced_ai.classifier is not None,
            "model_accuracy": f"{advanced_ai.accuracy:.2%}",
            "diseases_learned": len(advanced_ai.diseases_database),
            "curated_mode": use_curated,
            "auto_training_enabled": (os.getenv("AUTO_TRAIN_ON_STARTUP", "false").lower() == "true") and not use_curated,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/v1/status")
async def get_status():
    """Get detailed system status"""
    return {
        "model_accuracy": advanced_ai.accuracy,
        "diseases_learned": len(advanced_ai.diseases_database),
        "training_data_count": len(advanced_ai.training_data),
        "training_status": advanced_ai.training_status,
        "last_updated": datetime.now().isoformat(),
        "curated_mode": os.getenv("USE_CURATED", "false").lower() == "true"
    }

@app.post("/api/v1/start-training", response_model=TrainingStatusResponse)
async def start_training(background_tasks: BackgroundTasks):
    """Start the advanced AI training process"""
    global training_task
    
    use_curated = os.getenv("USE_CURATED", "false").lower() == "true"
    if use_curated:
        return TrainingStatusResponse(
            status="curated_mode",
            diseases_collected=len(advanced_ai.diseases_database),
            training_data_count=len(advanced_ai.training_data),
            model_accuracy=advanced_ai.accuracy,
            training_progress="Curated mode - no training needed"
        )
    
    if training_task and not training_task.done():
        return TrainingStatusResponse(
            status="training_in_progress",
            diseases_collected=len(advanced_ai.diseases_database),
            training_data_count=len(advanced_ai.training_data),
            model_accuracy=advanced_ai.accuracy,
            training_progress="Training already in progress"
        )
    
    # Start training in background
    training_task = asyncio.create_task(train_advanced_ai())
    
    return TrainingStatusResponse(
        status="training_started",
        diseases_collected=len(advanced_ai.diseases_database),
        training_data_count=len(advanced_ai.training_data),
        model_accuracy=advanced_ai.accuracy,
        training_progress="Training started in background"
    )

async def train_advanced_ai():
    """Background task to train the advanced AI"""
    global advanced_ai
    try:
        advanced_ai.training_status = "training"
        await advanced_ai.fetch_and_train_on_medical_data()
        advanced_ai.training_status = "completed"
        print(f"🎉 Training completed! Accuracy: {advanced_ai.accuracy:.2%}")
    except Exception as e:
        advanced_ai.training_status = "failed"
        print(f"❌ Training failed: {e}")

@app.get("/api/v1/training-status", response_model=TrainingStatusResponse)
async def get_training_status():
    """Get current training status"""
    global training_task
    
    use_curated = os.getenv("USE_CURATED", "false").lower() == "true"
    if use_curated:
        return TrainingStatusResponse(
            status="curated_mode",
            diseases_collected=len(advanced_ai.diseases_database),
            training_data_count=len(advanced_ai.training_data),
            model_accuracy=advanced_ai.accuracy,
            training_progress="Curated mode - deterministic diagnoses"
        )
    
    status = advanced_ai.training_status
    progress = "Not started"
    
    if training_task:
        if training_task.done():
            if training_task.exception():
                status = "failed"
                progress = f"Training failed: {training_task.exception()}"
            else:
                status = "completed"
                progress = "Training completed successfully"
        else:
            status = "training_in_progress"
            progress = "Training in progress..."
    
    return TrainingStatusResponse(
        status=status,
        diseases_collected=len(advanced_ai.diseases_database),
        training_data_count=len(advanced_ai.training_data),
        model_accuracy=advanced_ai.accuracy,
        training_progress=progress
    )

@app.post("/api/v1/diagnose", response_model=DiagnosisResponse)
async def diagnose_symptoms(request: SymptomRequest):
    """Analyze symptoms using the advanced AI model"""
    try:
        use_curated = os.getenv("USE_CURATED", "false").lower() == "true"
        
        if not use_curated and advanced_ai.training_status != "completed" and len(advanced_ai.diseases_database) < 10:
            raise HTTPException(
                status_code=503, 
                detail="AI model needs training. Please start training first or wait for completion."
            )
        
        result = await advanced_ai.analyze_symptoms(request.symptoms)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        if not result.get("predictions"):
            raise HTTPException(status_code=404, detail="No diagnosis found for given symptoms")
        
        # Get top prediction
        top_prediction = result["predictions"][0]
        
        return DiagnosisResponse(
            disease=top_prediction["disease"],
            confidence=top_prediction["confidence"],
            severity=top_prediction.get("severity", "moderate"),
            symptoms=top_prediction.get("symptoms", []),
            risk_factors=top_prediction.get("risk_factors", []),
            lab_tests=top_prediction.get("lab_tests", []),
            treatments=top_prediction.get("treatments", []),
            drug_interactions=top_prediction.get("drug_interactions", []),
            model_accuracy=advanced_ai.accuracy,
            diseases_learned=len(advanced_ai.diseases_database),
            timestamp=datetime.now().isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnosis failed: {str(e)}")

@app.post("/api/v1/comprehensive-analysis", response_model=ComprehensiveResponse)
async def comprehensive_analysis(request: SymptomRequest):
    """Perform comprehensive medical analysis"""
    try:
        use_curated = os.getenv("USE_CURATED", "false").lower() == "true"
        
        if not use_curated and advanced_ai.training_status != "completed" and len(advanced_ai.diseases_database) < 10:
            raise HTTPException(
                status_code=503, 
                detail="AI model needs training. Please start training first or wait for completion."
            )
        
        result = await advanced_ai.analyze_symptoms(request.symptoms)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        if not result.get("predictions"):
            raise HTTPException(status_code=404, detail="No diagnosis found for given symptoms")
        
        # Convert predictions to DiagnosisResponse format
        predictions = []
        for pred in result["predictions"][:3]:  # Top 3 predictions
            predictions.append(DiagnosisResponse(
                disease=pred["disease"],
                confidence=pred["confidence"],
                severity=pred.get("severity", "moderate"),
                symptoms=pred.get("symptoms", []),
                risk_factors=pred.get("risk_factors", []),
                lab_tests=pred.get("lab_tests", []),
                treatments=pred.get("treatments", []),
                drug_interactions=pred.get("drug_interactions", []),
                model_accuracy=advanced_ai.accuracy,
                diseases_learned=len(advanced_ai.diseases_database),
                timestamp=datetime.now().isoformat()
            ))
        
        return ComprehensiveResponse(
            predictions=predictions,
            input_symptoms=request.symptoms,
            model_accuracy=advanced_ai.accuracy,
            diseases_learned=len(advanced_ai.diseases_database),
            analysis_time=datetime.now().isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive analysis failed: {str(e)}")

@app.get("/api/v1/diseases")
async def get_diseases():
    """Get list of all diseases in the database"""
    return {
        "diseases": list(advanced_ai.diseases_database.keys()),
        "count": len(advanced_ai.diseases_database),
        "last_updated": datetime.now().isoformat()
    }

@app.get("/api/v1/disease/{disease_name}")
async def get_disease_info(disease_name: str):
    """Get detailed information about a specific disease"""
    if disease_name.lower() in advanced_ai.diseases_database:
        return advanced_ai.diseases_database[disease_name.lower()]
    else:
        raise HTTPException(status_code=404, detail=f"Disease '{disease_name}' not found")

@app.get("/api/v1/statistics")
async def get_statistics():
    """Get comprehensive system statistics"""
    use_curated = os.getenv("USE_CURATED", "false").lower() == "true"
    return {
        "ai_model": {
            "accuracy": advanced_ai.accuracy,
            "diseases_learned": len(advanced_ai.diseases_database),
            "training_data_count": len(advanced_ai.training_data),
            "training_status": advanced_ai.training_status
        },
        "curated_mode": use_curated,
        "system_info": {
            "version": "3.0.0",
            "last_updated": datetime.now().isoformat(),
            "data_sources": ["Curated Dataset"] if use_curated else ["PubMed", "FDA", "WHO"],
            "update_frequency": "Static" if use_curated else "Manual"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)