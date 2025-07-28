# 🚀 Railway Environment Variables Setup Guide

## 📋 **Environment Variables by Service**

### **1. Backend Service Environment Variables**

Set these in your Railway backend service dashboard:

```env
# Database Configuration (Supabase) - YOUR ACTUAL CREDENTIALS
SUPABASE_URL=https://cmcaobehivmrgyugwbxz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzIzNTYsImV4cCI6MjA2NzMwODM1Nn0.wxPWpDeCbPMXTCyo__mHhmrLrX8396IPtZ3S9xQn8UM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczMjM1NiwiZXhwIjoyMDY3MzA4MzU2fQ.WqBgdHz5v5PQ4OK4afNT1zuxyGz3BX-J55qklRF49dM

# Application Configuration
NODE_ENV=production
PORT=3001

# Security
JWT_SECRET=HPnFyDVK+z82DeWxLPTGBDvfCDBUdjsrIrQQeJU9HI+dCy2y+QX+0TBo2AKtV479KnfhbgniDBujDUeNeLxtKA==

# CORS - UPDATED WITH ACTUAL RAILWAY URLS
FRONTEND_URL=https://hospital-frontend-production-b896.up.railway.app

# AI Service - UPDATED WITH ACTUAL RAILWAY URL
AI_SERVICE_URL=https://hospital-ai-service-production.up.railway.app
```

### **2. AI Service Environment Variables**

Set these in your Railway AI service dashboard:

```env
# External API Keys
PUBMED_API_KEY=27feebcf45a02d89cf3d56590f31507de309
FDA_API_KEY=ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq

# Application Configuration
NODE_ENV=production
PORT=8000
```

### **3. Frontend Service Environment Variables**

Set these in your Railway frontend service dashboard:

```env
# React Environment Variables (must start with REACT_APP_)
REACT_APP_API_URL=https://hospital-backend-production-0e2e.up.railway.app
REACT_APP_AI_SERVICE_URL=https://hospital-ai-service-production.up.railway.app

# Application Configuration
NODE_ENV=production
PORT=3000
```

## 🔧 **Railway Service URLs**

### **✅ Deployed Services:**
- **Frontend:** https://hospital-frontend-production-b896.up.railway.app
- **Backend:** https://hospital-backend-production-0e2e.up.railway.app  
- **AI Service:** https://hospital-ai-service-production.up.railway.app

## 🚀 **Quick Setup Commands**

### **Backend Service:**
```bash
# In Railway backend service dashboard, set these environment variables:
SUPABASE_URL=https://cmcaobehivmrgyugwbxz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzIzNTYsImV4cCI6MjA2NzMwODM1Nn0.wxPWpDeCbPMXTCyo__mHhmrLrX8396IPtZ3S9xQn8UM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczMjM1NiwiZXhwIjoyMDY3MzA4MzU2fQ.WqBgdHz5v5PQ4OK4afNT1zuxyGz3BX-J55qklRF49dM
NODE_ENV=production
PORT=3001
JWT_SECRET=HPnFyDVK+z82DeWxLPTGBDvfCDBUdjsrIrQQeJU9HI+dCy2y+QX+0TBo2AKtV479KnfhbgniDBujDUeNeLxtKA==
FRONTEND_URL=https://hospital-frontend-production-b896.up.railway.app
AI_SERVICE_URL=https://hospital-ai-service-production.up.railway.app
```

### **AI Service:**
```bash
# In Railway AI service dashboard, set these environment variables:
PUBMED_API_KEY=27feebcf45a02d89cf3d56590f31507de309
FDA_API_KEY=ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq
NODE_ENV=production
PORT=8000
```

### **Frontend Service:**
```bash
# In Railway frontend service dashboard, set these environment variables:
REACT_APP_API_URL=https://hospital-backend-production-0e2e.up.railway.app
REACT_APP_AI_SERVICE_URL=https://hospital-ai-service-production.up.railway.app
NODE_ENV=production
PORT=3000
```

## 🔍 **Verification Steps**

### **1. Test Backend Health:**
```bash
curl https://hospital-backend-production-0e2e.up.railway.app/health
```

### **2. Test AI Service Health:**
```bash
curl https://hospital-ai-service-production.up.railway.app/
```

### **3. Test Frontend:**
```bash
curl https://hospital-frontend-production-b896.up.railway.app/
```

### **4. Test Service Communication:**
```bash
# Test backend API
curl https://hospital-backend-production-0e2e.up.railway.app/api/health

# Test AI service
curl https://hospital-ai-service-production.up.railway.app/health
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **CORS Errors:**
   - Ensure `FRONTEND_URL` in backend matches exactly
   - Check that all URLs are using HTTPS

2. **Service Communication:**
   - Verify all environment variables are set correctly
   - Check Railway logs for connection errors

3. **Database Connection:**
   - Verify Supabase credentials are correct
   - Check if database is accessible from Railway

4. **AI Service Issues:**
   - Verify PubMed and FDA API keys are valid
   - Check if AI service can access external APIs

## ✅ **Success Indicators**

- ✅ All services respond to health checks
- ✅ Frontend loads without errors
- ✅ Backend API endpoints work
- ✅ AI service can process requests
- ✅ Database operations work
- ✅ Services can communicate with each other

## 📞 **Support**

If you encounter issues:
1. Check Railway logs for each service
2. Verify environment variables are set correctly
3. Test individual service health endpoints
4. Check CORS configuration in backend
5. Verify API keys are valid and accessible

---

**🎉 Your Hospital Management System is now fully deployed and configured!** 