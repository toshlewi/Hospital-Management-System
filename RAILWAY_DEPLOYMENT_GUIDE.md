# 🚀 Railway Deployment Guide - Hospital Management System

## 🎯 **Railway Deployment Strategy**

This project uses a **monorepo structure** with three separate services that need to be deployed individually on Railway:

1. **🏥 Frontend (React)** - Root directory
2. **🔧 Backend (Node.js)** - `backend/` directory  
3. **🤖 AI Service (Python)** - `python-ai-project/` directory

## 📋 **Prerequisites**

- Railway account: https://railway.app
- GitHub repository connected
- 500 free hours per month available

## 🚀 **Step-by-Step Deployment**

### **1. Deploy Backend Service**

```bash
# Navigate to backend directory
cd backend

# Deploy to Railway
railway init
railway up
```

**Backend Configuration:**
- **Service Name:** `hospital-backend`
- **Directory:** `backend/`
- **Build Command:** `npm install`
- **Start Command:** `node --max-old-space-size=512 --expose-gc server.js`
- **Health Check:** `/health`

**Environment Variables for Backend:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=your_supabase_url
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=https://hospital-ai-production-xxxx.up.railway.app
```

### **2. Deploy AI Service**

```bash
# Navigate to AI service directory
cd python-ai-project

# Deploy to Railway
railway init
railway up
```

**AI Service Configuration:**
- **Service Name:** `hospital-ai`
- **Directory:** `python-ai-project/`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn enhanced_medical_api:app --host 0.0.0.0 --port $PORT --workers 1`
- **Health Check:** `/`

**Environment Variables for AI Service:**
```env
PUBMED_API_KEY=27feebcf45a02d89cf3d56590f31507de309
FDA_API_KEY=ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq
```

### **3. Deploy Frontend Service**

```bash
# Navigate to root directory
cd ..

# Deploy to Railway
railway init
railway up
```

**Frontend Configuration:**
- **Service Name:** `hospital-frontend`
- **Directory:** Root (`./`)
- **Build Command:** `npm install`
- **Start Command:** `npm run build && npx serve -s build -l $PORT`
- **Health Check:** `/`

**Environment Variables for Frontend:**
```env
NODE_ENV=production
REACT_APP_API_URL=https://hospital-backend-production-xxxx.up.railway.app
REACT_APP_AI_SERVICE_URL=https://hospital-ai-production-xxxx.up.railway.app
```

## 🔧 **Railway Configuration Files**

### **Backend (`backend/railway.json`):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "node --max-old-space-size=512 --expose-gc server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **AI Service (`python-ai-project/railway.json`):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn enhanced_medical_api:app --host 0.0.0.0 --port $PORT --workers 1",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **Frontend (`railway.json`):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm run build && npx serve -s build -l $PORT",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🔍 **Troubleshooting**

### **npm ci Errors:**
- **Problem:** Railway using `npm ci` instead of `npm install`
- **Solution:** Added explicit `buildCommand: "npm install"` in railway.json

### **Package Lock Sync Issues:**
- **Problem:** package.json and package-lock.json out of sync
- **Solution:** Each service has its own package.json and dependencies

### **Build Failures:**
- **Problem:** Missing dependencies or build errors
- **Solution:** Check railway.toml and railway.json configurations

## 📊 **Service URLs**

After deployment, your services will be available at:

- **Frontend:** `https://hospital-frontend-production-xxxx.up.railway.app`
- **Backend:** `https://hospital-backend-production-xxxx.up.railway.app`
- **AI Service:** `https://hospital-ai-production-xxxx.up.railway.app`

## 🔄 **Auto-Deployment**

Railway automatically deploys when you push to your GitHub repository. Each service will deploy from its respective directory.

## 💰 **Cost Management**

- **Free Tier:** 500 hours per month
- **3 Services:** ~167 hours each per month
- **Monitoring:** Use Railway dashboard to track usage

## 🎯 **Success Checklist**

- [ ] Backend deployed and healthy
- [ ] AI service deployed and healthy  
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Services can communicate with each other
- [ ] Health checks passing
- [ ] Application fully functional

## 🚀 **Next Steps**

1. Deploy backend first
2. Deploy AI service second
3. Deploy frontend last
4. Test all integrations
5. Monitor performance
6. Set up custom domains (optional) 