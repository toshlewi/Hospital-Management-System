#!/bin/bash

# Startup script for Enhanced Medical AI API with Auto-Training
echo "🚀 Starting Enhanced Medical AI API with Auto-Training..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data/auto_updates
mkdir -p data/models
mkdir -p data/medical_knowledge
mkdir -p logs

# Set permissions
echo "🔐 Setting permissions..."
chmod +x start_enhanced_api.sh

# Start the enhanced medical API with auto-training
echo "🤖 Starting Enhanced Medical AI API with Auto-Training..."
echo "🔄 Auto-updates will run daily at midnight"
echo "📚 Data sources: PubMed, FDA, WHO"
echo "🌐 API will be available at: http://localhost:8000"
echo "📊 Auto-update status: http://localhost:8000/api/v1/auto-update-status"

# Start the API server
uvicorn enhanced_medical_api:app --host 0.0.0.0 --port 8000 --reload 