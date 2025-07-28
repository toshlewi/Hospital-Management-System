#!/bin/bash

# Medical AI API Startup Script
echo "🏥 Starting Medical AI API Service..."
echo "📅 $(date)"
echo "=================================="

# Navigate to the correct directory
cd "$(dirname "$0")"

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if API is already running
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "⚠️  API is already running on port 8000"
    echo "🌐 API URL: http://localhost:8000"
    echo "📋 Available endpoints:"
    echo "   • POST /api/v1/comprehensive-analysis"
    echo "   • POST /api/v1/diagnose"
    echo "   • GET /api/v1/diseases"
    echo "   • GET /api/v1/statistics"
    exit 0
fi

# Start the API using enhanced_medical_api.py
echo "🚀 Starting uvicorn server (enhanced_medical_api.py)..."
echo "🌐 API will be available at: http://localhost:8000"
echo "📋 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

uvicorn enhanced_medical_api:app --host 0.0.0.0 --port 8000 --reload 