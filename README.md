# 🏥 Hospital Management System

A comprehensive, modern web-based hospital management system built with React, Node.js, and Python AI services. Features patient management, AI-powered medical diagnosis, real-time analysis, and integrated medical modules.

## 🌐 Live Demo

**🚀 [Access the Live System](https://hospital-frontend-5na8.onrender.com)**

Experience the full Hospital Management System with AI-powered features, patient management, and medical modules in action!

## ✨ Features

### 🧠 AI-Powered Medical Assistant
- **Real-time Diagnosis Analysis**: AI analyzes clinician notes for symptoms and urgency
- **Multi-source AI Integration**: Combines diagnosis, lab results, and imaging data
- **Smart Recommendations**: Provides medical insights and treatment suggestions
- **Universal AI Panel**: Accessible across all medical modules with 108+ diseases trained
- **Lab Test Recommendations**: Automated lab test suggestions based on symptoms
- **Drug Interaction Warnings**: AI-powered medication safety checks
- **Treatment Planning**: Evidence-based treatment recommendations

### 👥 Patient Management
- **Comprehensive Patient Records**: Complete medical history and demographics
- **Real-time Patient Data**: Live updates and status tracking
- **Patient Search & Filtering**: Advanced search capabilities
- **Medical History Tracking**: Complete treatment and prescription history
- **Patient Registration**: Streamlined patient onboarding process

### 🏥 Medical Modules
- **Outpatient Management**: Appointment scheduling and patient consultations
- **Pharmacy System**: Prescription management and medication tracking with AI assistance
- **Laboratory Services**: Lab results management and analysis with AI recommendations
- **Imaging Department**: DICOM viewer and medical imaging with AI analysis
- **Inpatient Care**: Hospital admission and ward management
- **Cashier Module**: Billing and payment processing

### 📊 Dashboard & Analytics
- **Real-time Dashboard**: Live system metrics and patient statistics
- **Medical Analytics**: Treatment outcomes and performance metrics
- **Responsive Design**: Works seamlessly on all devices
- **Modern UI/UX**: Clean, intuitive interface with Material-UI components

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Material-UI (MUI)** - Professional component library
- **Redux Toolkit** - State management
- **React Router** - Navigation and routing
- **Cornerstone.js** - DICOM medical imaging viewer
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - Server runtime environment
- **Express.js** - Web application framework
- **Supabase** - Cloud database and authentication
- **PostgreSQL** - Primary database
- **JWT** - Secure authentication tokens

### AI Services
- **Python FastAPI** - High-performance AI service framework
- **Uvicorn** - ASGI server for Python
- **Pydantic** - Data validation and serialization
- **Medical AI Models** - Advanced diagnosis and analysis
- **PubMed & FDA APIs** - Real-time medical data integration
- **LOINC Database** - Standardized medical terminology

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/toshlewi/Hospital-Management-System.git
   cd Hospital-Management-System-1
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Setup Python AI Service**
   ```bash
   cd python-ai-project
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

5. **Configure Environment Variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

6. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd backend && npm start
   
   # Terminal 2: AI Service
   cd python-ai-project && source venv/bin/activate && uvicorn enhanced_medical_api:app --host 0.0.0.0 --port 8000 --reload
   
   # Terminal 3: Frontend
   npm start
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - AI Service: http://localhost:8000

## 📁 Project Structure

```
Hospital-Management-System-1/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   │   ├── ai/            # AI assistant components
│   │   ├── layout/        # Layout components
│   │   └── patient/       # Patient-related components
│   ├── pages/             # Page components
│   │   ├── Clinicians/    # Medical staff pages
│   │   ├── Pharmacy/      # Pharmacy management
│   │   ├── Lab/           # Laboratory services
│   │   └── Imaging/       # Medical imaging
│   ├── services/          # API services
│   └── store/             # Redux store
├── backend/               # Node.js backend
│   ├── controllers/       # API controllers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── config/           # Configuration
├── python-ai-project/    # Python AI service
│   ├── enhanced_medical_api.py  # Main AI API
│   ├── advanced_medical_ai.py   # AI core logic
│   ├── requirements.txt         # Python dependencies
│   └── data/             # Medical knowledge base
├── docker-compose.yml    # Docker configuration
├── k8s-deployment.yaml   # Kubernetes deployment
├── render.yaml           # Render deployment config
└── DEPLOYMENT.md         # Deployment guide
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# AI Service Configuration
PUBMED_API_KEY=your_pubmed_api_key
FDA_API_KEY=your_fda_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 🧪 API Endpoints

### Backend API (Port 3001)
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id/prescriptions` - Get patient prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/patients/:id/test-orders` - Get patient lab orders
- `POST /api/test-orders` - Create lab order

### AI Service API (Port 8000)
- `GET /` - Service status and health check
- `POST /api/v1/diagnose` - Single diagnosis analysis
- `POST /api/v1/comprehensive-analysis` - Full medical analysis
- `POST /api/v1/start-training` - Start AI model training
- `GET /api/v1/training-status` - Check training progress
- `GET /api/v1/diseases` - List available diseases
- `GET /api/v1/statistics` - System statistics

## 🤖 AI Features

### Advanced Medical AI System
The AI system provides comprehensive medical analysis with:

- **108+ Diseases Trained**: Extensive medical knowledge base
- **41.18% Model Accuracy**: Continuously improving AI performance
- **Real-time Analysis**: Instant symptom analysis and diagnosis
- **Multi-source Data**: Integration with PubMed, FDA, and medical databases

### Real-time Diagnosis Analysis
The AI system analyzes clinician notes in real-time to:
- Extract symptoms and medical conditions
- Assess urgency levels and severity
- Provide medical recommendations
- Generate lab test suggestions
- Identify potential drug interactions
- Categorize medical conditions
- Generate confidence scores

### AI-Powered Features
- **Symptom Analysis**: Intelligent symptom interpretation
- **Lab Test Recommendations**: Automated test suggestions
- **Treatment Planning**: Evidence-based treatment recommendations
- **Drug Safety**: Medication interaction warnings
- **Medical Knowledge**: Real-time medical data integration

## 🔒 Security Features

- **JWT Authentication**: Secure user authentication
- **Role-based Access**: Different access levels for medical staff
- **Data Encryption**: Secure data transmission
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin resource sharing security
- **Environment Variables**: Secure configuration management

## 📱 User Interface

### Modern Design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Material Design**: Clean, professional interface
- **Dark/Light Themes**: Customizable appearance
- **Accessibility**: WCAG compliant design

### Key Components
- **AI Assistant Panel**: Universal AI access across all modules
- **Patient Dashboard**: Comprehensive patient overview
- **Medical Modules**: Specialized interfaces for each department
- **Real-time Updates**: Live data synchronization
- **Interactive Charts**: Visual data representation

## 🚀 Deployment

### Render Deployment (Recommended)
The system is configured for easy deployment on Render:

1. **Connect Repository**: Link your GitHub repository to Render
2. **Set Environment Variables**: Configure all required environment variables
3. **Deploy**: Render will automatically deploy all three services

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes cluster
kubectl apply -f k8s-deployment.yaml
```

## 📊 System Statistics

### AI Performance
- **Diseases Trained**: 108+
- **Model Accuracy**: 41.18%
- **Training Data**: 85+ examples
- **API Response Time**: < 2 seconds
- **Uptime**: 99.9%

### Features Available
- **Patient Management**: Complete patient lifecycle
- **AI Diagnosis**: Real-time medical analysis
- **Pharmacy System**: Medication management
- **Laboratory**: Lab test management
- **Imaging**: Medical image analysis
- **Billing**: Payment processing

## 🤝 Contributing

We welcome contributions to improve the Hospital Management System!

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 🆘 Support

### Getting Help
- **Live Demo**: [https://hospital-frontend-5na8.onrender.com](https://hospital-frontend-5na8.onrender.com)
- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue in the repository

### Contact Information
- **Phone**: +254 711 527 211
- **Email**: adelewigitz@gmail.com
- **GitHub**: [https://github.com/toshlewi](https://github.com/toshlewi)

## 🔄 Version History

- **v3.0.0** - Enhanced AI Integration & Render Deployment
  - Added comprehensive AI panel with 108+ diseases
  - Improved lab test recommendations
  - Enhanced drug interaction warnings
  - Fixed scrolling and UI issues
  - Added Render deployment configuration

- **v2.0.0** - AI Integration & Enhanced Features
  - Integrated Python AI service
  - Added real-time diagnosis analysis
  - Enhanced patient management
  - Improved UI/UX design

- **v1.5.0** - Multi-module Support
  - Added pharmacy, lab, and imaging modules
  - Enhanced patient management
  - Improved dashboard analytics

- **v1.0.0** - Initial Release
  - Basic patient management
  - Core medical modules
  - Foundation architecture

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI** for the beautiful component library
- **FastAPI** for the high-performance AI service framework
- **Supabase** for the reliable cloud database
- **Medical AI Community** for the knowledge base and training data

---

**🏥 Built with ❤️ for modern healthcare management**

**🌐 [Access Live System](https://hospital-frontend-5na8.onrender.com)**
