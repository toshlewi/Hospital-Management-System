# 🔧 Environment Variables Setup for Railway Deployment

## 🎯 **Environment Variables Required for Hospital Management System**

This guide shows you how to set up all necessary environment variables for your Railway deployment.

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

# CORS
FRONTEND_URL=https://hospital-frontend-production-xxxx.up.railway.app

# AI Service
AI_SERVICE_URL=https://hospital-ai-production-xxxx.up.railway.app
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
REACT_APP_API_URL=https://hospital-backend-production-xxxx.up.railway.app
REACT_APP_AI_SERVICE_URL=https://hospital-ai-production-xxxx.up.railway.app

# Application Configuration
NODE_ENV=production
PORT=3000
```

## 🚀 **How to Set Environment Variables in Railway**

### **Step 1: Access Railway Dashboard**
1. Go to https://railway.app
2. Select your project
3. Click on each service (backend, AI, frontend)

### **Step 2: Add Environment Variables**
1. Click on the service
2. Go to "Variables" tab
3. Click "New Variable"
4. Add each variable from the lists above

### **Step 3: Update URLs After Deployment**
After deploying each service, update the URLs:
- Replace `hospital-backend-production-xxxx` with your actual backend URL
- Replace `hospital-ai-production-xxxx` with your actual AI service URL
- Replace `hospital-frontend-production-xxxx` with your actual frontend URL

## 🔧 **Your Supabase Configuration**

Your Supabase project is already set up with:
- **Project URL:** `https://cmcaobehivmrgyugwbxz.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzIzNTYsImV4cCI6MjA2NzMwODM1Nn0.wxPWpDeCbPMXTCyo__mHhmrLrX8396IPtZ3S9xQn8UM`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczMjM1NiwiZXhwIjoyMDY3MzA4MzU2fQ.WqBgdHz5v5PQ4OK4afNT1zuxyGz3BX-J55qklRF49dM`

## 🔍 **Verification Checklist**

After setting up environment variables:

- [ ] Backend service has all required variables
- [ ] AI service has API keys configured
- [ ] Frontend service has API URLs configured
- [ ] All URLs are updated with actual Railway URLs
- [ ] Supabase credentials are correct
- [ ] JWT secret is secure and unique
- [ ] All services can communicate with each other

## 🚨 **Important Notes**

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** in production
3. **Update URLs** after each service deployment
4. **Test connections** between services
5. **Monitor logs** for environment variable errors

## 🔄 **Deployment Order**

1. **Deploy Backend** first
2. **Deploy AI Service** second
3. **Deploy Frontend** last
4. **Update URLs** in environment variables
5. **Test all integrations**

## 📞 **Troubleshooting**

If you see environment variable errors:

1. Check Railway dashboard for missing variables
2. Verify variable names are correct
3. Ensure URLs are updated with actual Railway URLs
4. Check service logs for specific error messages
5. Verify Supabase credentials are working

## 🎯 **Example URLs After Deployment**

Your services will be available at URLs like:
- **Frontend:** `https://hospital-frontend-production-abc123.up.railway.app`
- **Backend:** `https://hospital-backend-production-def456.up.railway.app`
- **AI Service:** `https://hospital-ai-production-ghi789.up.railway.app`

Update your environment variables with these actual URLs. 