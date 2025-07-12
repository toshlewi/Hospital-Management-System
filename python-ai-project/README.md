# Hospital Management System AI Service

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
source venv/bin/activate  # On Windows: venv\Scripts\activate
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
