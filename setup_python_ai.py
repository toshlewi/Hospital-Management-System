#!/usr/bin/env python3
"""
Setup script for Python AI Project for Hospital Management System
This script creates the project structure and sets up the initial files.
"""

import os
import sys
import subprocess
from pathlib import Path

def create_directory_structure():
    """Create the Python AI project directory structure."""
    
    # Define the project structure
    directories = [
        "python-ai-project/src/ai",
        "python-ai-project/src/data",
        "python-ai-project/src/models",
        "python-ai-project/src/api/routes",
        "python-ai-project/src/api/middleware",
        "python-ai-project/src/utils",
        "python-ai-project/src/tests",
        "python-ai-project/data/medical_knowledge",
        "python-ai-project/data/training_data",
        "python-ai-project/data/models",
        "python-ai-project/notebooks",
        "python-ai-project/scripts",
        "python-ai-project/docs"
    ]
    
    print("Creating directory structure...")
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"Created: {directory}")

def create_requirements_file():
    """Create requirements.txt with necessary dependencies."""
    
    requirements = """# Core dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
sqlalchemy==2.0.23
alembic==1.13.0
psycopg2-binary==2.9.9

# AI/ML libraries
tensorflow==2.15.0
torch==2.1.1
scikit-learn==1.3.2
pandas==2.1.4
numpy==1.24.4
matplotlib==3.8.2
seaborn==0.13.0

# Medical AI libraries
spacy==3.7.2
transformers==4.36.2
sentence-transformers==2.2.2

# Natural Language Processing
nltk==3.8.1
textblob==0.17.1

# Data processing
openpyxl==3.1.2
xlrd==2.0.1

# API and web
requests==2.31.0
aiohttp==3.9.1
websockets==12.0

# Database
redis==5.0.1
asyncpg==0.29.0

# Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Monitoring and logging
prometheus-client==0.19.0
structlog==23.2.0

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2

# Development
black==23.11.0
isort==5.12.0
flake8==6.1.0
mypy==1.7.1

# Jupyter notebooks
jupyter==1.0.0
ipykernel==6.27.1

# Environment management
python-dotenv==1.0.0
pyyaml==6.0.1

# Docker
docker==6.1.3

# Medical specific
med7==1.0.0
biomedical-bert==1.0.0
"""
    
    with open("python-ai-project/requirements.txt", "w") as f:
        f.write(requirements)
    print("Created: requirements.txt")

def create_config_file():
    """Create configuration file."""
    
    config = """# Hospital Management System AI Configuration

# Database Configuration
database:
  host: localhost
  port: 5432
  name: hospital_management
  user: postgres
  password: your_password
  pool_size: 20
  max_overflow: 30

# AI Model Configuration
ai_models:
  diagnosis:
    model_path: "data/models/diagnosis_model.pkl"
    confidence_threshold: 0.8
    max_predictions: 5
  
  risk_assessment:
    model_path: "data/models/risk_model.pkl"
    risk_threshold: 0.7
  
  recommendations:
    model_path: "data/models/recommendation_model.pkl"
    max_recommendations: 10

# API Configuration
api:
  host: "0.0.0.0"
  port: 8000
  debug: false
  workers: 4
  timeout: 30

# Security Configuration
security:
  secret_key: "your-secret-key-here"
  algorithm: "HS256"
  access_token_expire_minutes: 30
  refresh_token_expire_days: 7

# External APIs
external_apis:
  openai:
    api_key: "your-openai-api-key"
    model: "gpt-4"
    max_tokens: 1000
  
  pubmed:
    api_key: "your-pubmed-api-key"
    base_url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
  
  drugbank:
    api_key: "your-drugbank-api-key"
    base_url: "https://api.drugbank.com/v1/"

# Logging Configuration
logging:
  level: "INFO"
  format: "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
  file: "logs/ai_service.log"
  max_size: 10485760  # 10MB
  backup_count: 5

# Monitoring Configuration
monitoring:
  prometheus_port: 9090
  health_check_interval: 30
  metrics_interval: 60

# Cache Configuration
cache:
  redis_host: "localhost"
  redis_port: 6379
  redis_db: 0
  ttl: 3600  # 1 hour

# Hospital Management System Integration
hms_integration:
  api_url: "http://localhost:3001/api"
  websocket_url: "ws://localhost:3001/ws"
  auth_token: "your-hms-auth-token"
"""
    
    with open("python-ai-project/config.yaml", "w") as f:
        f.write(config)
    print("Created: config.yaml")

def create_dockerfile():
    """Create Dockerfile for containerization."""
    
    dockerfile = """# Use Python 3.9 slim image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "src.api.fastapi_app:app", "--host", "0.0.0.0", "--port", "8000"]
"""
    
    with open("python-ai-project/Dockerfile", "w") as f:
        f.write(dockerfile)
    print("Created: Dockerfile")

def create_docker_compose():
    """Create docker-compose.yml for local development."""
    
    compose = """version: '3.8'

services:
  ai-service:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/hospital_management
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    networks:
      - ai-network

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=hospital_management
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ai-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - ai-network

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - ai-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - ai-network

volumes:
  postgres_data:
  redis_data:
  grafana_data:

networks:
  ai-network:
    driver: bridge
"""
    
    with open("python-ai-project/docker-compose.yml", "w") as f:
        f.write(compose)
    print("Created: docker-compose.yml")

def create_main_app():
    """Create the main FastAPI application."""
    
    app_code = """from fastapi import FastAPI, HTTPException, Depends
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
"""
    
    with open("python-ai-project/src/api/fastapi_app.py", "w") as f:
        f.write(app_code)
    print("Created: src/api/fastapi_app.py")

def create_init_files():
    """Create __init__.py files for Python packages."""
    
    init_files = [
        "python-ai-project/src/__init__.py",
        "python-ai-project/src/ai/__init__.py",
        "python-ai-project/src/data/__init__.py",
        "python-ai-project/src/models/__init__.py",
        "python-ai-project/src/api/__init__.py",
        "python-ai-project/src/api/routes/__init__.py",
        "python-ai-project/src/api/middleware/__init__.py",
        "python-ai-project/src/utils/__init__.py",
        "python-ai-project/src/tests/__init__.py",
    ]
    
    for init_file in init_files:
        Path(init_file).touch()
        print(f"Created: {init_file}")

def create_readme():
    """Create README.md for the Python AI project."""
    
    readme = """# Hospital Management System AI Service

## Overview
This Python AI service provides advanced artificial intelligence capabilities for the Hospital Management System, including medical diagnosis, treatment recommendations, risk assessment, and clinical decision support.

## Features

### Medical Diagnosis AI
- Symptom analysis and differential diagnosis
- Laboratory result interpretation
- Medical imaging analysis
- Disease prediction with confidence scores

### Treatment Recommendations
- Personalized medication recommendations
- Dosage optimization
- Drug interaction checking
- Evidence-based treatment protocols

### Risk Assessment
- Patient risk scoring
- Disease progression prediction
- Complication risk assessment
- Readmission risk prediction

### Clinical Decision Support
- Clinical guidelines integration
- Best practices recommendations
- Resource optimization
- Quality metrics monitoring

## Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL
- Redis
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd python-ai-project
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the service:
```bash
uvicorn src.api.fastapi_app:app --reload
```

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

2. Access the API:
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## API Documentation

### Diagnosis Endpoints
- `POST /api/v1/diagnosis/symptoms` - Analyze symptoms
- `POST /api/v1/diagnosis/lab-results` - Interpret lab results
- `POST /api/v1/diagnosis/imaging` - Analyze medical imaging
- `GET /api/v1/diagnosis/differential/{patient_id}` - Get differential diagnosis

### Recommendation Endpoints
- `POST /api/v1/recommendations/treatment` - Get treatment recommendations
- `POST /api/v1/recommendations/medication` - Get medication recommendations
- `POST /api/v1/recommendations/dosage` - Optimize dosages
- `GET /api/v1/recommendations/protocols/{condition}` - Get treatment protocols

### Risk Assessment Endpoints
- `POST /api/v1/risk/patient-assessment` - Assess patient risk
- `POST /api/v1/risk/disease-progression` - Predict disease progression
- `POST /api/v1/risk/complications` - Assess complication risk
- `GET /api/v1/risk/readmission/{patient_id}` - Predict readmission risk

### Clinical Support Endpoints
- `GET /api/v1/clinical/guidelines/{condition}` - Get clinical guidelines
- `POST /api/v1/clinical/decision-support` - Get decision support
- `GET /api/v1/clinical/quality-metrics` - Get quality metrics
- `POST /api/v1/clinical/audit-support` - Get audit support

## Development

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_diagnosis.py
```

### Code Quality
```bash
# Format code
black src/

# Sort imports
isort src/

# Lint code
flake8 src/

# Type checking
mypy src/
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Configuration

The service is configured using `config.yaml` and environment variables:

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `OPENAI_API_KEY` - OpenAI API key
- `SECRET_KEY` - JWT secret key
- `DEBUG` - Debug mode (true/false)

### Configuration File
See `config.yaml` for detailed configuration options.

## Monitoring

### Health Checks
- `GET /health` - Service health check
- `GET /api/v1/health` - API health check

### Metrics
- Prometheus metrics available at `/metrics`
- Grafana dashboard for visualization

### Logging
- Structured logging with JSON format
- Log levels: DEBUG, INFO, WARNING, ERROR
- Log rotation with size limits

## Security

### Authentication
- JWT-based authentication
- Role-based access control
- API key authentication for external services

### Data Protection
- All data encrypted at rest and in transit
- HIPAA-compliant data handling
- Audit logging for all operations
- Data anonymization for research

## Integration

### Hospital Management System
The AI service integrates with the main Hospital Management System:

- **Database Integration**: Direct access to HMS PostgreSQL database
- **API Integration**: RESTful API communication
- **Real-time Updates**: WebSocket connections for live updates
- **Event-driven**: Responds to HMS events and triggers

### External Services
- **OpenAI API**: GPT models for medical text analysis
- **PubMed API**: Medical literature access
- **DrugBank API**: Drug information and interactions
- **ICD-10 API**: Disease classification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Roadmap

### Phase 1 (Current)
- Basic diagnosis and recommendation models
- API endpoints and integration
- Security and monitoring

### Phase 2 (Next)
- Advanced AI models
- Multi-modal analysis
- Real-time learning

### Phase 3 (Future)
- Federated learning
- Explainable AI
- Clinical trial support
"""
    
    with open("python-ai-project/README.md", "w") as f:
        f.write(readme)
    print("Created: README.md")

def main():
    """Main setup function."""
    print("Setting up Python AI Project for Hospital Management System...")
    print("=" * 60)
    
    # Create directory structure
    create_directory_structure()
    
    # Create configuration files
    create_requirements_file()
    create_config_file()
    create_dockerfile()
    create_docker_compose()
    
    # Create application files
    create_main_app()
    create_init_files()
    create_readme()
    
    print("\n" + "=" * 60)
    print("Python AI Project setup completed!")
    print("\nNext steps:")
    print("1. cd python-ai-project")
    print("2. python -m venv venv")
    print("3. source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
    print("4. pip install -r requirements.txt")
    print("5. Edit config.yaml with your settings")
    print("6. uvicorn src.api.fastapi_app:app --reload")
    print("\nFor Docker deployment:")
    print("docker-compose up --build")

if __name__ == "__main__":
    main() 