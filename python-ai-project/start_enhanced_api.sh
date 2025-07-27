#!/bin/bash

echo "🏥 Starting Enhanced Medical AI API..."
echo "======================================"

# Navigate to the correct directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if API is already running
if pgrep -f "uvicorn enhanced_medical_api" > /dev/null; then
    echo "⚠️ Enhanced Medical API is already running!"
    echo "🔄 Stopping existing process..."
    pkill -f "uvicorn enhanced_medical_api"
    sleep 2
fi

# Start the enhanced API
echo "🚀 Starting Enhanced Medical AI API on http://localhost:8000"
echo "📊 This API includes:"
echo "   - PubMed integration for real medical data"
echo "   - FDA drug information and interactions"
echo "   - 1000+ diseases training capability"
echo "   - 95%+ accuracy target"
echo ""
echo "🔗 API Endpoints:"
echo "   - GET  /                    - API status"
echo "   - POST /api/v1/start-training - Start AI training"
echo "   - GET  /api/v1/training-status - Check training progress"
echo "   - POST /api/v1/diagnose     - Single diagnosis"
echo "   - POST /api/v1/comprehensive-analysis - Multiple predictions"
echo "   - GET  /api/v1/diseases     - List all diseases"
echo "   - GET  /api/v1/statistics   - System statistics"
echo ""
echo "⏳ Starting server..."

uvicorn enhanced_medical_api:app --host 0.0.0.0 --port 8000 --reload 