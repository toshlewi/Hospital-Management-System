# 🚀 Railway Deployment Guide - Full AI System

## 🎯 **Railway - Perfect for Your AI System**

### **✅ Why Railway is Better:**
- **Full Python 3.13 support** with all package compilation
- **500 free hours** per month
- **Better build environment** for complex dependencies
- **Auto-scaling** capabilities
- **Global CDN** for better performance
- **Custom domains** supported
- **Environment variables** management
- **Logs and monitoring** included

### **✅ Perfect for AI Systems:**
- **Handles pandas, numpy, scikit-learn** without issues
- **Supports large model training** and inference
- **Memory management** for ML workloads
- **Background tasks** for auto-training
- **File system** for model storage

## 🚀 **Deployment Steps**

### **1. Sign Up for Railway**
```bash
# Visit: https://railway.app
# Sign up with GitHub account
# Get 500 free hours per month
```

### **2. Deploy AI Service (Most Important)**
```bash
# Navigate to AI service directory
cd python-ai-project

# Deploy to Railway
railway init
railway up
```

### **3. Set AI Service Environment Variables**
```bash
# In Railway dashboard or CLI
railway variables set PUBMED_API_KEY=27feebcf45a02d89cf3d56590f31507de309
railway variables set FDA_API_KEY=ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq
railway variables set PORT=8000
```

### **4. Deploy Backend Service**
```bash
# Navigate to backend directory
cd backend

# Deploy to Railway
railway init
railway up
```

### **5. Set Backend Environment Variables**
```bash
railway variables set PORT=3001
railway variables set NODE_ENV=production
railway variables set AI_SERVICE_URL=https://your-ai-service.railway.app
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_ANON_KEY=your_supabase_key
railway variables set JWT_SECRET=your_jwt_secret
```

### **6. Deploy Frontend**
```bash
# Navigate to project root
cd ..

# Deploy to Railway
railway init
railway up
```

### **7. Set Frontend Environment Variables**
```bash
railway variables set REACT_APP_API_URL=https://your-backend.railway.app/api
railway variables set REACT_APP_AI_SERVICE_URL=https://your-ai-service.railway.app
```

## 🔧 **Railway Configuration Files**

### **python-ai-project/railway.json** (AI Service)
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

### **backend/railway.json** (Backend Service)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
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

### **railway.json** (Frontend Service)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx serve -s build -l $PORT",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **python-ai-project/requirements.txt** (Full Dependencies)
```
# Full AI System Dependencies - Railway Optimized
fastapi==0.104.1
uvicorn[standard]==0.24.0
aiohttp==3.9.1
pandas==2.1.4
numpy==1.26.2
scikit-learn==1.3.2
requests==2.31.0
beautifulsoup4==4.12.2
lxml==4.9.3
nltk==3.8.1
textblob==0.17.1
streamlit==1.28.1
plotly==5.17.0
python-dotenv==1.0.0
pydantic==2.5.0
schedule==1.2.0
gunicorn==21.2.0
```

## 🌐 **Service URLs**

After deployment, you'll get URLs like:
- **AI Service**: `https://hospital-ai-service-production.up.railway.app`
- **Backend**: `https://hospital-backend-production.up.railway.app`
- **Frontend**: `https://hospital-frontend-production.up.railway.app`

## 🔄 **Auto-Deployment**

### **GitHub Integration**
1. Connect your GitHub repository to Railway
2. Enable auto-deploy on push to main branch
3. Railway will automatically deploy changes

### **Environment Variables**
- Set all environment variables in Railway dashboard
- Variables are encrypted and secure
- Can be different per environment (dev/prod)

## 📊 **Monitoring**

### **Railway Dashboard Features:**
- **Real-time logs** for debugging
- **Resource usage** monitoring
- **Deployment history** and rollbacks
- **Custom domains** setup
- **SSL certificates** (automatic)

## 🚀 **Benefits of Railway Deployment**

### **✅ Full AI Capabilities:**
- **All ML libraries** work without issues
- **Auto-training** runs properly
- **Model storage** and persistence
- **Background tasks** for data collection

### **✅ Performance:**
- **Global CDN** for fast access
- **Auto-scaling** based on load
- **Better resource allocation**
- **Faster build times**

### **✅ Reliability:**
- **99.9% uptime** guarantee
- **Automatic restarts** on failure
- **Health checks** and monitoring
- **Rollback capabilities**

## 🎯 **Deployment Order**

### **1. AI Service First** (Most Complex)
```bash
cd python-ai-project
railway init
railway up
# Set environment variables
```

### **2. Backend Service**
```bash
cd backend
railway init
railway up
# Set environment variables with AI service URL
```

### **3. Frontend Service**
```bash
cd ..
railway init
railway up
# Set environment variables with backend and AI URLs
```

## 🔧 **Troubleshooting**

### **Common Issues:**
- **Build fails**: Check Railway logs for specific errors
- **Environment variables**: Ensure all required variables are set
- **Service communication**: Verify URLs are correct
- **Memory issues**: Railway handles this automatically

### **Railway CLI Commands:**
```bash
# View logs
railway logs

# Check status
railway status

# Redeploy
railway up

# View variables
railway variables
```

## 💰 **Cost**

### **Railway Free Tier:**
- **500 hours/month** free
- **Perfect for development** and testing
- **Upgrade when needed** for production

## 🎯 **Next Steps**

1. **Sign up for Railway** at https://railway.app
2. **Deploy AI service** first (most complex)
3. **Deploy backend** service
4. **Deploy frontend** service
5. **Configure environment variables**
6. **Test all functionality**
7. **Set up custom domains** (optional)

**Your full AI system will work perfectly on Railway!** 🚀 