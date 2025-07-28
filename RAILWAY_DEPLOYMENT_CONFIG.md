# 🚀 Railway Deployment Configuration - Complete Setup

## 🎯 **Project Overview**

This Hospital Management System consists of three services that need to be deployed on Railway:

1. **🏥 Frontend (React)** - User interface
2. **🔧 Backend (Node.js)** - API server
3. **🤖 AI Service (Python)** - Medical AI analysis

## 📋 **Deployment Requirements**

### **✅ Frontend Requirements:**
- Node.js 18+
- React 18.2.0
- All dependencies in package.json
- Build process with npm run build
- Static file serving with serve

### **✅ Backend Requirements:**
- Node.js 18+
- Express.js server
- Supabase database connection
- CORS configuration
- Health check endpoint

### **✅ AI Service Requirements:**
- Python 3.11+
- FastAPI framework
- All ML dependencies (pandas, numpy, scikit-learn)
- NLTK data downloads
- PubMed and FDA API integration

## 🔧 **Configuration Files**

### **Frontend Configuration:**

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline --production=false
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
CMD ["serve", "-s", "build", "-l", "3000"]
```

**railway.json:**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "numReplicas": 1
  }
}
```

### **Backend Configuration:**

**backend/Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline
COPY . .
EXPOSE 3001
CMD ["node", "--max-old-space-size=512", "--expose-gc", "server.js"]
```

**backend/railway.json:**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "numReplicas": 1
  }
}
```

### **AI Service Configuration:**

**python-ai-project/Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc g++ curl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
COPY . .
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1
CMD ["uvicorn", "enhanced_medical_api:app", "--host", "0.0.0.0", "--port", "8000"]
```

**python-ai-project/railway.json:**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "numReplicas": 1
  }
}
```

## 🔑 **Environment Variables**

### **Backend Environment Variables:**
```env
SUPABASE_URL=https://cmcaobehivmrgyugwbxz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzIzNTYsImV4cCI6MjA2NzMwODM1Nn0.wxPWpDeCbPMXTCyo__mHhmrLrX8396IPtZ3S9xQn8UM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczMjM1NiwiZXhwIjoyMDY3MzA4MzU2fQ.WqBgdHz5v5PQ4OK4afNT1zuxyGz3BX-J55qklRF49dM
NODE_ENV=production
PORT=3001
JWT_SECRET=HPnFyDVK+z82DeWxLPTGBDvfCDBUdjsrIrQQeJU9HI+dCy2y+QX+0TBo2AKtV479KnfhbgniDBujDUeNeLxtKA==
FRONTEND_URL=https://hospital-frontend-production-xxxx.up.railway.app
AI_SERVICE_URL=https://hospital-ai-production-xxxx.up.railway.app
```

### **AI Service Environment Variables:**
```env
PUBMED_API_KEY=27feebcf45a02d89cf3d56590f31507de309
FDA_API_KEY=ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq
NODE_ENV=production
PORT=8000
```

### **Frontend Environment Variables:**
```env
REACT_APP_API_URL=https://hospital-backend-production-xxxx.up.railway.app
REACT_APP_AI_SERVICE_URL=https://hospital-ai-production-xxxx.up.railway.app
NODE_ENV=production
PORT=3000
```

## 🚀 **Deployment Steps**

### **Step 1: Deploy Backend**
1. Create new Railway project
2. Connect GitHub repository
3. Set service directory to `backend/`
4. Add environment variables
5. Deploy

### **Step 2: Deploy AI Service**
1. Create new Railway project
2. Connect GitHub repository
3. Set service directory to `python-ai-project/`
4. Add environment variables
5. Deploy

### **Step 3: Deploy Frontend**
1. Create new Railway project
2. Connect GitHub repository
3. Set service directory to root `/`
4. Add environment variables
5. Deploy

### **Step 4: Update URLs**
After deployment, update environment variables with actual Railway URLs.

## 🔍 **Verification Checklist**

- [ ] All Dockerfiles use correct base images
- [ ] All dependencies are properly installed
- [ ] Health checks are configured
- [ ] Environment variables are set
- [ ] Services can communicate with each other
- [ ] Database connections work
- [ ] AI service can access external APIs
- [ ] Frontend can build successfully
- [ ] All services are healthy

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **npm ci errors** - Use Dockerfile with npm install
2. **Missing dependencies** - Check requirements.txt and package.json
3. **Environment variables** - Verify all required variables are set
4. **Health check failures** - Check service logs
5. **CORS errors** - Update CORS configuration with correct URLs

### **Debug Commands:**
```bash
# Check Railway logs
railway logs

# Check service status
railway status

# View environment variables
railway variables

# Connect to service
railway connect
```

## 📊 **Performance Optimization**

- **Memory limits** - Backend uses 512MB heap
- **Health checks** - 30s intervals with 3 retries
- **Restart policy** - ON_FAILURE with 10 max retries
- **Replicas** - 1 replica per service for cost optimization

## 🎯 **Success Criteria**

✅ All services deploy successfully
✅ Health checks pass
✅ Services can communicate
✅ Database connections work
✅ AI service responds to requests
✅ Frontend loads without errors
✅ All features work as expected 