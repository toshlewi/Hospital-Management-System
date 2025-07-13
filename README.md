# 🏥 Hospital Management System

A comprehensive, modern web-based hospital management system built with React, Node.js, and Python AI services. Features patient management, AI-powered medical diagnosis, real-time analysis, and integrated medical modules.

## ✨ Features

### 🧠 AI-Powered Medical Assistant
- **Real-time Diagnosis Analysis**: AI analyzes clinician notes for symptoms and urgency
- **Multi-source AI Integration**: Combines diagnosis, lab results, and imaging data
- **Smart Recommendations**: Provides medical insights and treatment suggestions
- **Universal AI Panel**: Accessible across all medical modules

### 👥 Patient Management
- **Comprehensive Patient Records**: Complete medical history and demographics
- **Real-time Patient Data**: Live updates and status tracking
- **Patient Search & Filtering**: Advanced search capabilities
- **Medical History Tracking**: Complete treatment and prescription history

### 🏥 Medical Modules
- **Outpatient Management**: Appointment scheduling and patient consultations
- **Pharmacy System**: Prescription management and medication tracking
- **Laboratory Services**: Lab results management and analysis
- **Imaging Department**: DICOM viewer and medical imaging
- **Inpatient Care**: Hospital admission and ward management
- **Cashier Module**: Billing and payment processing

### 📊 Dashboard & Analytics
- **Real-time Dashboard**: Live system metrics and patient statistics
- **Medical Analytics**: Treatment outcomes and performance metrics
- **Responsive Design**: Works seamlessly on all devices
- **Modern UI/UX**: Clean, intuitive interface

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Material-UI** - Component library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Cornerstone.js** - DICOM medical imaging
- **Axios** - HTTP client

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Supabase** - Cloud database
- **PostgreSQL** - Database
- **JWT** - Authentication

### AI Services
- **Python FastAPI** - AI service framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Medical AI Models** - Diagnosis and analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- PostgreSQL (or Supabase account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hospital-Management-System-1
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

4. **Setup Python AI Service**
   ```bash
   cd python-ai-project
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

6. **Start All Services**

   **Terminal 1 - Backend Server:**
   ```bash
   cd backend
   node server.js
   ```

   **Terminal 2 - AI Service:**
   ```bash
   cd python-ai-project
   source venv/bin/activate
   python -m uvicorn src.api.fastapi_app:app --host 0.0.0.0 --port 8000 --reload
   ```

   **Terminal 3 - Frontend:**
   ```bash
   npm start
   ```

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
│   │   └── ...            # Other modules
│   ├── services/          # API services
│   └── store/             # Redux store
├── backend/               # Node.js backend
│   ├── controllers/       # API controllers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── config/           # Configuration
├── python-ai-project/    # Python AI service
│   ├── src/
│   │   ├── api/          # FastAPI routes
│   │   ├── ai/           # AI models
│   │   └── utils/        # Utilities
│   └── data/             # Medical knowledge base
└── database/             # Database schemas
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Supabase Configuration (if using Supabase)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-key

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000

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

### AI Service API (Port 8000)
- `POST /api/v1/diagnosis/analyze-notes` - Analyze clinician notes
- `POST /api/v1/diagnosis/analyze-notes-flexible` - Flexible note analysis
- `GET /health` - Service health check

## 🤖 AI Features

### Real-time Diagnosis Analysis
The AI system analyzes clinician notes in real-time to:
- Extract symptoms and medical conditions
- Assess urgency levels
- Provide medical recommendations
- Categorize medical conditions
- Generate confidence scores

### Multi-source Integration
- **Diagnosis Analysis**: Real-time note processing
- **Lab Results**: Automated lab result interpretation
- **Imaging Analysis**: Medical image analysis
- **Treatment Recommendations**: AI-powered treatment suggestions

## 🔒 Security Features

- **JWT Authentication**: Secure user authentication
- **Role-based Access**: Different access levels for staff
- **Data Encryption**: Secure data transmission
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin resource sharing security

## 📱 User Interface

### Modern Design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Material Design**: Clean, professional interface
- **Dark/Light Themes**: Customizable appearance
- **Accessibility**: WCAG compliant design

### Key Components
- **AI Assistant Panel**: Universal AI access across modules
- **Patient Dashboard**: Comprehensive patient overview
- **Medical Modules**: Specialized interfaces for each department
- **Real-time Updates**: Live data synchronization

## 🚀 Deployment

### Development
```bash
# Start all services in development mode
npm run dev:all
```

### Production
```bash
# Build frontend
npm run build

# Start production servers
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Version History

- **v2.0.0** - AI Integration & Enhanced Features
- **v1.5.0** - Multi-module Support
- **v1.0.0** - Initial Release

---

**Built with ❤️ for modern healthcare management**
