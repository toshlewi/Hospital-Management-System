# 🏥 Hospital Management System with AI

A comprehensive hospital management system with AI-powered features for patient care, diagnosis, and medical decision support.

## 🌐 Live Demo

**🚀 [Access the Live System](https://hospital-frontend-production.up.railway.app)**

Experience the full Hospital Management System with AI-powered features, patient management, and medical modules in action!

## ✨ Features

### 🏥 Core Hospital Management
- **Patient Management**: Complete patient records, medical history, and demographics
- **Appointment Scheduling**: Calendar-based appointment booking and management
- **Pharmacy Management**: Drug inventory, prescription dispensing, and stock tracking
- **Laboratory Management**: Test orders, results tracking, and sample management
- **Imaging Department**: Radiology orders, image storage, and report generation
- **Billing & Payments**: Automated billing, payment tracking, and financial reports

### 🤖 AI-Powered Features
- **Medical Diagnosis**: AI-powered symptom analysis and differential diagnosis
- **Lab Test Recommendations**: Intelligent test suggestions based on symptoms
- **Drug Interaction Analysis**: Real-time drug interaction checking
- **Treatment Planning**: AI-assisted treatment recommendations
- **Patient History Analysis**: Comprehensive patient data analysis
- **Auto-Training**: Daily updates from PubMed, FDA, and WHO APIs

### 📊 Advanced Analytics
- **Real-time Dashboards**: Live hospital metrics and KPIs
- **Patient Analytics**: Treatment outcomes and patient flow analysis
- **Financial Reports**: Revenue tracking and cost analysis
- **Operational Insights**: Resource utilization and efficiency metrics

## 🛠️ Tech Stack

### Frontend
- **React 18** with hooks and functional components
- **Material-UI (MUI)** for modern, responsive design
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **Supabase** for PostgreSQL database
- **JWT** for authentication
- **Memory-optimized** for AI service communication

### AI Service
- **Python FastAPI** for high-performance API
- **Machine Learning**: scikit-learn, pandas, numpy
- **Natural Language Processing**: NLTK, TextBlob
- **Auto-Training**: Schedule-based daily updates
- **External APIs**: PubMed, FDA, WHO integration

### Deployment
- **Railway** for reliable, scalable hosting
- **Global CDN** for fast worldwide access
- **Auto-scaling** based on demand
- **SSL certificates** and custom domains

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.13+
- Git
- Railway account (free tier available)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/toshlewi/Hospital-Management-System.git
cd Hospital-Management-System
```

2. **Install dependencies**
```bash
# Install all dependencies
npm run install-all
```

3. **Set up environment variables**
```bash
# Copy environment template
cp env.example .env

# Add your configuration
# - Supabase credentials
# - API keys for PubMed and FDA
# - JWT secret
```

4. **Start development servers**
```bash
# Start all services (frontend, backend, AI)
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- AI Service: http://localhost:8000

## 🚀 Railway Deployment

### Deploy to Railway (Recommended)

1. **Sign up for Railway**
   - Visit https://railway.app
   - Sign up with GitHub account
   - Get 500 free hours per month

2. **Deploy AI Service**
```bash
cd python-ai-project
railway init
railway up
```

3. **Deploy Backend**
```bash
cd backend
railway init
railway up
```

4. **Deploy Frontend**
```bash
cd ..
railway init
railway up
```

5. **Set Environment Variables**
   - Configure all required environment variables in Railway dashboard
   - See `RAILWAY_DEPLOYMENT.md` for detailed instructions

### Why Railway?
- **Full Python 3.13 support** with all package compilation
- **500 free hours/month** - more generous than alternatives
- **Better build environment** for complex AI dependencies
- **Auto-scaling** and global CDN
- **Perfect for ML workloads**

## 📚 API Documentation

### Core Endpoints
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient

### AI Endpoints
- `POST /api/ai/diagnose` - AI-powered diagnosis
- `POST /api/ai/analyze-comprehensive` - Comprehensive analysis
- `POST /api/ai/analyze-drug-interactions` - Drug interaction analysis
- `POST /api/ai/analyze-lab-results` - Lab results analysis

### Pharmacy Endpoints
- `GET /api/pharmacy/stock` - Get pharmacy inventory
- `POST /api/pharmacy/drugs` - Add new drug
- `PUT /api/pharmacy/dispense/:id` - Dispense prescription

### Laboratory Endpoints
- `GET /api/lab/tests` - Get test orders
- `POST /api/lab/orders` - Create test order
- `PUT /api/lab/results/:id` - Update test results

## 🤖 AI Features

### Medical Diagnosis
- **Symptom Analysis**: AI analyzes patient symptoms
- **Differential Diagnosis**: Multiple possible conditions
- **Confidence Scoring**: AI confidence in diagnosis
- **Treatment Recommendations**: Suggested treatments

### Lab Test Recommendations
- **Intelligent Suggestions**: Based on symptoms and history
- **Test Prioritization**: Most important tests first
- **Cost Considerations**: Affordable test options
- **Result Interpretation**: AI helps interpret results

### Drug Interactions
- **Real-time Checking**: Instant interaction analysis
- **FDA Database**: Latest drug information
- **Patient-specific**: Considers patient history
- **Safety Alerts**: Warnings for dangerous combinations

### Auto-Training System
- **Daily Updates**: Fetches latest medical data
- **Multiple Sources**: PubMed, FDA, WHO APIs
- **Continuous Learning**: Improves accuracy over time
- **Model Persistence**: Saves trained models

## 📊 Database Schema

### Core Tables
- `patients` - Patient information and demographics
- `appointments` - Appointment scheduling
- `prescriptions` - Medication prescriptions
- `lab_orders` - Laboratory test orders
- `imaging_orders` - Radiology orders
- `bills` - Billing and payments

### AI Tables
- `ai_models` - Trained AI models
- `medical_knowledge` - Medical data and training
- `auto_updates` - Update history and logs

## 🔧 Configuration

### Environment Variables
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret

# AI Service
AI_SERVICE_URL=https://your-ai-service.railway.app
PUBMED_API_KEY=your_pubmed_api_key
FDA_API_KEY=your_fda_api_key

# Frontend
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_AI_SERVICE_URL=https://your-ai-service.railway.app
```

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# AI service tests
cd python-ai-project && python -m pytest
```

## 📈 Performance

### Optimization Features
- **Memory Management**: Optimized for AI workloads
- **Caching**: Intelligent data caching
- **Lazy Loading**: Components load on demand
- **Code Splitting**: Optimized bundle sizes
- **CDN**: Global content delivery

### Monitoring
- **Real-time Logs**: Railway dashboard monitoring
- **Health Checks**: Automatic service monitoring
- **Performance Metrics**: Response time tracking
- **Error Tracking**: Comprehensive error logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [Railway Deployment Guide](RAILWAY_DEPLOYMENT.md)
- [API Documentation](API_DOCUMENTATION.md)
- [AI System Guide](AI_SYSTEM_GUIDE.md)

### Issues
- Report bugs via GitHub Issues
- Request features through GitHub Discussions
- Get help in GitHub Discussions

## 🏥 About

This Hospital Management System is designed to provide comprehensive healthcare management with AI-powered decision support. It combines traditional hospital management features with cutting-edge AI capabilities to improve patient care and operational efficiency.

**Built with ❤️ for better healthcare**
