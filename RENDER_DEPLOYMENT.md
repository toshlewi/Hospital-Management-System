# 🚀 Render Deployment Guide - Hospital Management System

## 📋 Overview

This guide will help you deploy the Hospital Management System on Render with three separate services:
- **Frontend**: React.js application
- **Backend**: Node.js API server  
- **AI Service**: Python FastAPI with medical AI capabilities

## 🎯 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your API keys and secrets

## 🔧 Deployment Steps

### Step 1: Connect Your Repository

1. Log into Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing this project

### Step 2: Configure Environment Variables

Before deploying, you'll need to set up these environment variables in Render:

#### Backend Service Variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

#### AI Service Variables:
```
PUBMED_API_KEY=your_pubmed_api_key
FDA_API_KEY=your_fda_api_key
```

### Step 3: Deploy Services

The `render.yaml` file will automatically create three services:

#### 1. Backend Service (hospital-backend)
- **Type**: Web Service
- **Environment**: Node.js
- **Root Directory**: `backend/`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check**: `/health`

#### 2. Frontend Service (hospital-frontend)
- **Type**: Web Service
- **Environment**: Node.js
- **Root Directory**: `.` (root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s build -l 3000`
- **Health Check**: `/`

#### 3. AI Service (hospital-ai-service)
- **Type**: Web Service
- **Environment**: Python
- **Root Directory**: `python-ai-project/`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn enhanced_medical_api:app --host 0.0.0.0 --port 8000`
- **Health Check**: `/`

### Step 4: Update Service URLs

After deployment, update the environment variables in each service with the correct URLs:

#### Frontend Service:
```
REACT_APP_API_URL=https://your-backend-service-name.onrender.com
REACT_APP_AI_API_URL=https://your-ai-service-name.onrender.com
```

#### Backend Service:
```
AI_SERVICE_URL=https://your-ai-service-name.onrender.com
```

## 🔍 Service URLs

Your services will be available at:
- **Frontend**: `https://hospital-frontend.onrender.com`
- **Backend**: `https://hospital-backend.onrender.com`
- **AI Service**: `https://hospital-ai-service.onrender.com`

## 🏥 Testing the Deployment

### 1. Test Frontend
Visit your frontend URL and verify:
- ✅ Application loads without errors
- ✅ Can navigate between pages
- ✅ AI panel is accessible

### 2. Test Backend API
```bash
curl https://hospital-backend.onrender.com/health
```

### 3. Test AI Service
```bash
curl https://hospital-ai-service.onrender.com/
```

### 4. Test AI Diagnosis
```bash
curl -X POST https://hospital-ai-service.onrender.com/api/v1/diagnose \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "fever, headache"}'
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. Build Failures
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json` and `requirements.txt`
- Ensure Python version is compatible (3.11+)

#### 2. Environment Variables
- Verify all required environment variables are set
- Check variable names match exactly
- Ensure API keys are valid

#### 3. Service Communication
- Verify service URLs are correct
- Check CORS settings in AI service
- Ensure health check endpoints are working

#### 4. AI Service Issues
- Check if training data is loaded
- Verify API keys for PubMed and FDA
- Monitor AI service logs

### Debugging Commands:

#### Check Service Status:
```bash
# Backend health
curl https://hospital-backend.onrender.com/health

# AI service status
curl https://hospital-ai-service.onrender.com/

# Frontend
curl https://hospital-frontend.onrender.com/
```

#### Test AI Training:
```bash
# Start training
curl -X POST https://hospital-ai-service.onrender.com/api/v1/start-training

# Check training status
curl https://hospital-ai-service.onrender.com/api/v1/training-status
```

## 📊 Monitoring

### Render Dashboard Features:
- **Logs**: Real-time service logs
- **Metrics**: CPU, memory, and network usage
- **Health Checks**: Automatic service monitoring
- **Deployments**: Deployment history and rollback

### Health Check Endpoints:
- Backend: `/health`
- AI Service: `/`
- Frontend: `/`

## 🔄 Updates and Maintenance

### Automatic Deployments:
- Services automatically deploy on git push to main branch
- Manual deployments available from Render dashboard
- Rollback to previous versions if needed

### Environment Variable Updates:
- Update variables in Render dashboard
- Services restart automatically
- No code changes required

## 💰 Cost Optimization

### Free Tier Limits:
- **Services**: 3 web services
- **Build Time**: 500 minutes/month
- **Runtime**: 750 hours/month
- **Bandwidth**: 100 GB/month

### Optimization Tips:
- Use free tier for development/testing
- Upgrade to paid plans for production
- Monitor usage in Render dashboard
- Optimize build times and dependencies

## 🆘 Support

### Render Support:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

### Project Issues:
- Check service logs in Render dashboard
- Verify environment variables
- Test endpoints individually
- Review deployment configuration

## 🎉 Success Checklist

After deployment, verify:
- ✅ All three services are running
- ✅ Frontend loads without errors
- ✅ Backend API responds to health checks
- ✅ AI service is accessible
- ✅ Environment variables are set correctly
- ✅ Services can communicate with each other
- ✅ AI training can be started
- ✅ Diagnosis endpoints work

Your Hospital Management System is now live on Render! 🚀 