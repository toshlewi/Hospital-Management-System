# 🏥 Hospital Management System

A comprehensive hospital management system with AI-powered medical analysis, built with React, Node.js, and Python FastAPI.

## 📋 **Project Presentation**

**🎯 Pitch Deck:** [View Presentation](https://www.canva.com/design/DAGsys5pfFo/TY1YGaU0WphaBJCMexpXIA/edit?utm_content=DAGsys5pfFo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

**🎥 Project Demo Video:** [Watch Video](https://drive.google.com/drive/folders/12RwmxxgN78jPZzNgciScD1UrC1_-3PNu)

## 🌐 **Live Demo**

**Frontend:** https://hospital-frontend-shye.onrender.com
**Backend:** https://hospital-backend-g0oi.onrender.com
**AI Service:** https://hospital-ai-service.onrender.com

**⚠️ Note:** The project is hosted on [Render](https://render.com/) in three separate services (Frontend, Backend, AI Service). Because these are on the free Render plan, the services may spin down when idle and take up to a minute to load when first accessed. Please be patient if the site takes time to load.

## 🚀 **Quick Start**

### **Clone and Setup**

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
   # Edit .env with your credentials
   ```

4. **Start all services**
   ```bash
   npm run dev
   ```

## 🤖 **AI Features & Usage**

### **What You Can Ask the AI:**
- **Symptom Analysis:** "I have a cough and fever"
- **Differential Diagnosis:** "Patient presents with chest pain"
- **Lab Test Recommendations:** "What tests for diabetes screening?"
- **Treatment Plans:** "Treatment for hypertension"
- **Drug Interactions:** "Check interactions between aspirin and warfarin"

### **AI Training Status:**
- ✅ **20 diseases** currently trained and available
- ✅ **Auto-training** enabled for continuous learning
- ✅ **Real-time analysis** working perfectly
- 🔄 **Additional training** can be performed for more diseases

**Note:** The AI is fully functional with the current training data. Additional diseases can be added to expand the knowledge base.

## 🏗️ **Architecture**

### **Frontend (React)**
- **Location:** `/` (root directory)
- **Port:** 3000
- **Framework:** React 18.2.0
- **UI Library:** Material-UI
- **Features:** Responsive design, real-time updates

### **Backend (Node.js)**
- **Location:** `/backend`
- **Port:** 3001
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Features:** RESTful API, JWT authentication

### **AI Service (Python)**
- **Location:** `/python-ai-project`
- **Port:** 8000
- **Framework:** FastAPI
- **ML Libraries:** scikit-learn, pandas, numpy
- **Features:** Medical diagnosis, drug interactions, lab test recommendations

## 🔧 **Features**

### **🏥 Hospital Management**
- Patient registration and management
- Appointment scheduling
- Medical records management
- Pharmacy management
- Laboratory management
- Imaging department
- Billing and invoicing

### **🤖 AI-Powered Analysis**
- **Differential Diagnosis:** AI analyzes symptoms and suggests possible conditions
- **Lab Test Recommendations:** Suggests appropriate diagnostic tests
- **Treatment Plans:** Provides evidence-based treatment recommendations
- **Drug Interactions:** Checks for potential drug-drug interactions
- **Medical Knowledge Base:** Continuously updated from PubMed, FDA, and WHO

### **📊 Real-time Features**
- Live patient data updates
- Real-time AI analysis
- Interactive medical dashboards
- Automated training and updates

## 🔑 **Environment Variables**

### **Required for Local Development**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NODE_ENV=development
PORT=3001

# Security
JWT_SECRET=your_jwt_secret

# CORS
FRONTEND_URL=http://localhost:3000

# AI Service
AI_SERVICE_URL=http://localhost:8000

# External APIs
PUBMED_API_KEY=your_pubmed_api_key
FDA_API_KEY=your_fda_api_key
```

For complete environment setup, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

## 🚀 **Deployment**

### **Render (Current Deployment)**

The project is currently deployed on Render with the following services:
- **Frontend:** React app with optimized build
- **Backend:** Node.js API with Supabase integration
- **AI Service:** Python FastAPI with ML models

### **Railway Deployment**

For production deployment on Railway, see [RAILWAY_DEPLOYMENT_CONFIG.md](./RAILWAY_DEPLOYMENT_CONFIG.md)

### **Docker**

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### **Manual Deployment**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📁 **Project Structure**

```
Hospital-Management-System/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── utils/             # Utility functions
├── backend/               # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── server.js         # Main server file
├── python-ai-project/     # Python AI service
│   ├── models/           # AI models
│   ├── data/             # Training data
│   ├── cache/            # Cached data
│   └── enhanced_medical_api.py  # FastAPI app
├── public/               # Static files
├── Dockerfile            # Frontend Dockerfile
├── docker-compose.yml    # Docker Compose config
└── package.json          # Frontend dependencies
```

## 🔧 **Development Scripts**

```bash
# Install all dependencies
npm run install-all

# Start all services (development)
npm run dev

# Start individual services
npm start                    # Frontend only
cd backend && npm run dev    # Backend only
cd python-ai-project && python -m uvicorn enhanced_medical_api:app --reload  # AI only

# Build for production
npm run build

# Railway deployment
npm run railway-build
```

## 🤖 **AI Features**

### **Medical Analysis**
- **Symptom Analysis:** Input patient symptoms for AI diagnosis
- **Differential Diagnosis:** Multiple possible conditions with confidence scores
- **Lab Test Recommendations:** Evidence-based test suggestions
- **Treatment Plans:** Comprehensive treatment protocols
- **Drug Interactions:** Real-time drug interaction checking

### **Data Sources**
- **PubMed:** Latest medical research and publications
- **FDA:** Drug information and safety data
- **WHO:** International health guidelines
- **LOINC:** Laboratory test standardization
- **SNOMED CT:** Clinical terminology

### **Auto-Training**
- **Daily Updates:** Automatic data collection from APIs
- **Model Retraining:** Scheduled AI model updates
- **Knowledge Expansion:** Continuous learning from new data

## 🔒 **Security**

- JWT-based authentication
- CORS protection
- Environment variable security
- Input validation and sanitization
- Rate limiting
- Secure API endpoints

## 📊 **Performance**

- **Frontend:** Optimized React build with code splitting
- **Backend:** Memory-optimized Node.js with garbage collection
- **AI Service:** Efficient ML models with caching
- **Database:** Optimized Supabase queries

## 🧪 **Testing**

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# AI service tests
cd python-ai-project && python -m pytest
```

## 📈 **Monitoring**

- Health check endpoints
- Real-time logging
- Performance metrics
- Error tracking
- Service status monitoring

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation:** [RAILWAY_DEPLOYMENT_CONFIG.md](./RAILWAY_DEPLOYMENT_CONFIG.md)
- **Environment Setup:** [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues:** Create an issue on GitHub

## 🎯 **Roadmap**

- [ ] Mobile app development
- [ ] Advanced AI features
- [ ] Telemedicine integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with medical devices

---

**Built with ❤️ for better healthcare management**
