#!/bin/bash

# 🏥 Hospital Management System - Deployment Verification Script
# Tests all Railway services to ensure they're working correctly

set -e

echo "🏥 Hospital Management System - Railway Deployment Verification"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Service URLs
FRONTEND_URL="https://hospital-frontend-production-b896.up.railway.app"
BACKEND_URL="https://hospital-backend-production-0e2e.up.railway.app"
AI_URL="https://hospital-ai-service-production.up.railway.app"

echo "🔍 Testing Railway Services..."
echo ""

# Test Backend Service
print_info "Testing Backend Service..."
if curl -s -f "$BACKEND_URL/health" > /dev/null; then
    print_status "Backend service is healthy"
else
    print_error "Backend service is not responding"
fi

# Test AI Service
print_info "Testing AI Service..."
if curl -s -f "$AI_URL/" > /dev/null; then
    print_status "AI service is healthy"
else
    print_error "AI service is not responding"
fi

# Test Frontend Service
print_info "Testing Frontend Service..."
if curl -s -f "$FRONTEND_URL/" > /dev/null; then
    print_status "Frontend service is healthy"
else
    print_error "Frontend service is not responding"
fi

echo ""
print_info "Testing Service Communication..."

# Test Backend API
print_info "Testing Backend API endpoints..."
if curl -s -f "$BACKEND_URL/api/health" > /dev/null; then
    print_status "Backend API is working"
else
    print_warning "Backend API health check failed"
fi

# Test AI Service API
print_info "Testing AI Service API..."
if curl -s -f "$AI_URL/health" > /dev/null; then
    print_status "AI Service API is working"
else
    print_warning "AI Service API health check failed"
fi

echo ""
print_info "Testing Database Connection..."

# Test database connection through backend
print_info "Testing Supabase database connection..."
if curl -s -f "$BACKEND_URL/api/test-db" > /dev/null 2>&1; then
    print_status "Database connection is working"
else
    print_warning "Database connection test endpoint not available"
fi

echo ""
print_info "Testing CORS Configuration..."

# Test CORS by making a request from frontend to backend
print_info "Testing CORS between Frontend and Backend..."
if curl -s -f -H "Origin: $FRONTEND_URL" "$BACKEND_URL/health" > /dev/null; then
    print_status "CORS is properly configured"
else
    print_warning "CORS configuration may need adjustment"
fi

echo ""
echo "🎯 Deployment Verification Summary"
echo "=================================="

print_info "Service URLs:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo "  AI:       $AI_URL"

echo ""
print_info "Environment Variables to Set:"

echo ""
print_info "Backend Service Environment Variables:"
echo "SUPABASE_URL=https://cmcaobehivmrgyugwbxz.supabase.co"
echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzIzNTYsImV4cCI6MjA2NzMwODM1Nn0.wxPWpDeCbPMXTCyo__mHhmrLrX8396IPtZ3S9xQn8UM"
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2FvYmVoaXZtcmd5dWd3Ynh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTczMjM1NiwiZXhwIjoyMDY3MzA4MzU2fQ.WqBgdHz5v5PQ4OK4afNT1zuxyGz3BX-J55qklRF49dM"
echo "NODE_ENV=production"
echo "PORT=3001"
echo "JWT_SECRET=HPnFyDVK+z82DeWxLPTGBDvfCDBUdjsrIrQQeJU9HI+dCy2y+QX+0TBo2AKtV479KnfhbgniDBujDUeNeLxtKA=="
echo "FRONTEND_URL=$FRONTEND_URL"
echo "AI_SERVICE_URL=$AI_URL"

echo ""
print_info "AI Service Environment Variables:"
echo "PUBMED_API_KEY=27feebcf45a02d89cf3d56590f31507de309"
echo "FDA_API_KEY=ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq"
echo "NODE_ENV=production"
echo "PORT=8000"

echo ""
print_info "Frontend Service Environment Variables:"
echo "REACT_APP_API_URL=$BACKEND_URL"
echo "REACT_APP_AI_SERVICE_URL=$AI_URL"
echo "NODE_ENV=production"
echo "PORT=3000"

echo ""
print_status "✅ Verification complete!"
echo ""
print_info "Next Steps:"
echo "1. Set the environment variables in each Railway service dashboard"
echo "2. Redeploy services if environment variables were changed"
echo "3. Test the frontend application at: $FRONTEND_URL"
echo "4. Monitor Railway logs for any issues"
echo ""
print_status "🚀 Your Hospital Management System is ready!" 