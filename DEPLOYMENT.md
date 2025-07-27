# 🏥 Hospital Management System - Deployment Guide

## 📋 Overview

This Hospital Management System consists of three main components:
- **Frontend**: React.js application
- **Backend**: Node.js API server
- **AI Service**: Python FastAPI with medical AI capabilities

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Git

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hospital-Management-System-1
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - AI Service: http://localhost:8000

### Option 2: Kubernetes Deployment

1. **Build Docker images**
   ```bash
   # Backend
   docker build -t hospital-management/backend:latest ./backend
   
   # Frontend
   docker build -t hospital-management/frontend:latest -f Dockerfile.frontend .
   
   # AI Service
   docker build -t hospital-management/ai-service:latest ./python-ai-project
   ```

2. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s-deployment.yaml
   ```

3. **Check deployment status**
   ```bash
   kubectl get pods -n hospital-management
   kubectl get services -n hospital-management
   ```

## 🔧 Local Development

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
npm install
npm start
```

### AI Service Setup
```bash
cd python-ai-project
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn enhanced_medical_api:app --host 0.0.0.0 --port 8000 --reload
```

## 📊 AI Service Features

The AI service provides:
- **Medical Diagnosis**: Symptom analysis and disease prediction
- **Lab Test Recommendations**: Based on symptoms and conditions
- **Treatment Suggestions**: Evidence-based treatment plans
- **Drug Interactions**: Safety checks for medication combinations
- **Real-time Training**: Continuous learning from medical data

### AI Training
```bash
# Start AI training
curl -X POST http://localhost:8000/api/v1/start-training

# Check training status
curl http://localhost:8000/api/v1/training-status

# Test diagnosis
curl -X POST http://localhost:8000/api/v1/diagnose \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "fever, headache"}'
```

## 🔐 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

### AI Service
```env
PUBMED_API_KEY=your_pubmed_api_key
FDA_API_KEY=your_fda_api_key
```

## 📁 Project Structure

```
Hospital-Management-System-1/
├── src/                    # React frontend
├── backend/               # Node.js backend
├── python-ai-project/     # Python AI service
├── docker-compose.yml     # Docker Compose configuration
├── k8s-deployment.yaml    # Kubernetes deployment
├── Dockerfile.frontend    # Frontend Dockerfile
└── DEPLOYMENT.md         # This file
```

## 🏥 Features

### Core Features
- **Patient Management**: Registration, history, and records
- **Appointment Scheduling**: Calendar and booking system
- **Pharmacy Management**: Drug inventory and dispensing
- **Laboratory Management**: Test orders and results
- **Imaging Services**: Radiology and diagnostic imaging
- **Billing System**: Invoicing and payment tracking

### AI-Powered Features
- **Smart Diagnosis**: AI-powered symptom analysis
- **Lab Recommendations**: Automated test suggestions
- **Treatment Planning**: Evidence-based treatment options
- **Drug Safety**: Interaction checking and warnings
- **Medical Knowledge**: Real-time medical data integration

## 🔍 API Endpoints

### Backend API (Port 3001)
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment

### AI Service API (Port 8000)
- `GET /` - Service status
- `POST /api/v1/diagnose` - Single diagnosis
- `POST /api/v1/comprehensive-analysis` - Full analysis
- `POST /api/v1/start-training` - Start AI training
- `GET /api/v1/training-status` - Training progress

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :3001
   lsof -i :8000
   ```

2. **AI service not responding**
   ```bash
   # Check if training is complete
   curl http://localhost:8000/api/v1/training-status
   
   # Restart training if needed
   curl -X POST http://localhost:8000/api/v1/start-training
   ```

3. **Database connection issues**
   ```bash
   # Check database status
   docker-compose ps
   
   # View logs
   docker-compose logs database
   ```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ai-service
```

## 📈 Monitoring

### Health Checks
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/health
- AI Service: http://localhost:8000/

### Metrics
- Container resource usage: `docker stats`
- Kubernetes metrics: `kubectl top pods -n hospital-management`

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Backup and Restore
```bash
# Backup database
docker-compose exec database pg_dump -U admin hospital_management > backup.sql

# Restore database
docker-compose exec -T database psql -U admin hospital_management < backup.sql
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Create an issue in the repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 