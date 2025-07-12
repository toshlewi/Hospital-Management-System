# Hospital Management System - Project Structure

## Overview
This is a comprehensive Hospital Management System built with React frontend and Node.js backend, using PostgreSQL database with Supabase. The system includes AI integration for medical diagnosis and recommendations.

## Project Organization

### Root Directory Structure
```
Hospital-Management-System/
├── backend/                 # Node.js backend server
├── src/                     # React frontend application
├── database/                # Database schema and migrations
├── public/                  # Static assets
├── uploads/                 # File uploads directory
├── package.json             # Project dependencies
├── README.md               # Project documentation
└── .gitignore              # Git ignore rules
```

### Backend Structure (`backend/`)
```
backend/
├── config/
│   └── db.config.js        # Database configuration
├── controllers/
│   ├── ai.controller.js     # AI diagnosis endpoints
│   ├── billing.controller.js # Billing management
│   ├── patient.controller.js # Patient management
│   ├── pharmacy.controller.js # Pharmacy operations
│   └── procedures.controller.js # Medical procedures
├── routes/
│   ├── billing.routes.js    # Billing API routes
│   ├── patient.routes.js    # Patient API routes
│   └── pharmacy.routes.js   # Pharmacy API routes
├── services/
│   └── database.js          # Database service layer
├── database/                # Database migrations
│   ├── schema.sql           # Main database schema
│   ├── billing_system_schema.sql # Billing tables
│   └── [migration files]   # Individual migrations
└── server.js               # Express server entry point
```

### Frontend Structure (`src/`)
```
src/
├── components/              # Reusable React components
│   ├── ai/
│   │   └── AIDiagnosis.jsx # AI diagnosis component
│   ├── imaging/
│   │   └── DICOMViewer.jsx # Medical imaging viewer
│   ├── layout/
│   │   ├── Footer.jsx      # Application footer
│   │   ├── Header.jsx      # Application header
│   │   └── Layout.jsx      # Main layout wrapper
│   └── patient/
│       ├── PatientForm.jsx # Patient registration form
│       ├── PatientTable.jsx # Patient list component
│       └── mockPatients.js # Mock patient data
├── pages/                   # Main application pages
│   ├── Clinicians/          # Clinician-specific pages
│   │   ├── ClinicianPortal.jsx # Main clinician portal
│   │   ├── Inpatient.jsx   # Inpatient management
│   │   └── Outpatient.jsx  # Outpatient management
│   ├── Appointments.jsx     # Appointment management
│   ├── Cashier.jsx         # Billing and payments
│   ├── Dashboard.jsx        # Main dashboard
│   ├── Diagnosis.jsx        # Medical diagnosis
│   ├── Home.jsx            # Home page
│   ├── Imaging.jsx         # Medical imaging
│   ├── Lab.jsx             # Laboratory management
│   ├── Patients.jsx        # Patient management
│   ├── Pharmacy.jsx        # Pharmacy operations
│   ├── Reception.jsx       # Reception desk
│   └── Settings.jsx        # System settings
├── services/                # API and external services
│   ├── aiService.js         # AI integration service
│   ├── api.js              # Main API service
│   ├── auth.js             # Authentication service
│   ├── billingService.js   # Billing API service
│   └── pharmacyService.js  # Pharmacy API service
├── store/                   # Redux state management
│   ├── reducers/
│   │   ├── authReducer.js  # Authentication state
│   │   └── patientReducer.js # Patient state
│   └── store.js            # Redux store configuration
├── styles/                  # Styling and theming
│   └── theme.js            # Material-UI theme
├── App.jsx                  # Main application component
├── index.js                 # Application entry point
└── routes.jsx              # Application routing
```

## Database Schema Overview

### Core Entities
- **Patients**: Patient information and demographics
- **Doctors**: Medical staff information
- **Departments**: Hospital departments and specialties
- **Rooms**: Hospital room management
- **Admissions**: Patient admission records

### Medical Records
- **Medical History**: Patient medical history
- **Medical Notes**: Clinical notes and observations
- **Appointments**: Patient appointments and scheduling
- **Prescriptions**: Medication prescriptions

### Laboratory & Testing
- **Test Types**: Available laboratory and imaging tests
- **Test Orders**: Test orders and requests
- **Test Results**: Test results and findings

### Pharmacy System
- **Medications**: Medication catalog
- **Pharmacy Stock**: Inventory management
- **Prescriptions**: Medication prescriptions

### Billing System
- **Billing Items**: Billable services and items
- **Bills**: Patient billing records
- **Bill Items**: Individual bill line items
- **Payments**: Payment records
- **Insurance Claims**: Insurance claim management

### Procedures & Services
- **Procedures**: Medical procedures and services
- **Patient Procedures**: Patient procedure records
- **Imaging**: Medical imaging records

### AI & Analytics
- **AI Suggestions**: AI-generated medical suggestions

## Key Features

### 1. Patient Management
- Patient registration and profile management
- Medical history tracking
- Appointment scheduling
- Admission and discharge management

### 2. Clinical Operations
- Medical notes and diagnosis
- Prescription management
- Laboratory test ordering and results
- Medical imaging management
- Procedure scheduling and tracking

### 3. Pharmacy Management
- Medication inventory management
- Prescription processing
- Stock level monitoring
- Drug interaction checking

### 4. Billing & Finance
- Comprehensive billing system
- Payment processing
- Insurance claim management
- Financial reporting

### 5. AI Integration
- Medical diagnosis assistance
- Treatment recommendations
- Risk assessment
- Clinical decision support

### 6. Imaging & Radiology
- DICOM image viewing
- Medical image management
- Radiology report generation
- Image analysis tools

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Material-UI**: UI component library
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **PostgreSQL**: Primary database
- **Supabase**: Database hosting and real-time features

### AI & External Services
- **OpenAI API**: AI diagnosis and recommendations
- **DICOM Libraries**: Medical imaging support

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control

## File Organization Principles

### 1. Separation of Concerns
- Frontend and backend are clearly separated
- Each component has a single responsibility
- Services handle external API calls
- Controllers handle business logic

### 2. Modular Architecture
- Components are reusable and modular
- Pages are organized by department/function
- Services are organized by domain
- Database schema is normalized and well-structured

### 3. Scalability
- Database indexes for performance
- API endpoints are RESTful
- State management is centralized
- File uploads are properly organized

### 4. Maintainability
- Consistent naming conventions
- Clear file organization
- Comprehensive documentation
- Type-safe database schema

## Development Workflow

### 1. Database Changes
- All schema changes go through migration files
- Complete schema is maintained in `database/complete_schema.sql`
- Individual migrations for incremental changes

### 2. API Development
- Controllers handle business logic
- Routes define API endpoints
- Services handle external integrations
- Database service provides data access

### 3. Frontend Development
- Components are reusable and testable
- Pages are organized by functionality
- Services handle API communication
- State management is centralized

### 4. AI Integration
- AI service handles external API calls
- AI components provide user interface
- AI suggestions are stored in database
- AI analysis is integrated into clinical workflow

## Security Considerations

### 1. Data Protection
- Patient data is encrypted at rest
- API endpoints are secured
- File uploads are validated
- Database access is controlled

### 2. Authentication
- User authentication required
- Role-based access control
- Session management
- Secure password handling

### 3. HIPAA Compliance
- Patient data privacy
- Audit logging
- Data retention policies
- Secure communication

## Deployment

### 1. Frontend
- React app builds to static files
- Served by web server
- Environment variables for configuration
- CDN for static assets

### 2. Backend
- Node.js server deployment
- Database connection pooling
- Environment variable configuration
- Process management

### 3. Database
- PostgreSQL hosted on Supabase
- Automated backups
- Performance monitoring
- Connection pooling

## Future Enhancements

### 1. AI Features
- Enhanced medical diagnosis
- Predictive analytics
- Clinical decision support
- Automated reporting

### 2. Mobile Application
- React Native mobile app
- Offline capabilities
- Push notifications
- Mobile-optimized UI

### 3. Advanced Analytics
- Business intelligence dashboard
- Performance metrics
- Predictive modeling
- Data visualization

### 4. Integration
- Electronic Health Records (EHR)
- Insurance provider APIs
- Laboratory information systems
- Pharmacy management systems 