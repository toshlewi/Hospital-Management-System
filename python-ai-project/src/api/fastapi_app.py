from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
from contextlib import asynccontextmanager

from src.api.routes import diagnosis, recommendations, risk_assessment, clinical_support
from src.utils.config import get_settings
from src.utils.database import init_db
from src.utils.logging import setup_logging

# Global settings
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    await init_db()
    yield
    # Shutdown
    pass

# Create FastAPI app
app = FastAPI(
    title="Hospital Management System AI Service",
    description="AI-powered medical diagnosis and clinical decision support",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include routers
app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["diagnosis"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(risk_assessment.router, prefix="/api/v1/risk", tags=["risk-assessment"])
app.include_router(clinical_support.router, prefix="/api/v1/clinical", tags=["clinical-support"])

@app.get("/")
async def root():
    return {"message": "Hospital Management System AI Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service"}

@app.get("/api/v1/health")
async def api_health():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "ai-service"
    }

if __name__ == "__main__":
    uvicorn.run(
        "src.api.fastapi_app:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
