#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process..."

# Upgrade pip to latest version
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies using Render-specific requirements
echo "📦 Installing Python dependencies..."
if [ -f "requirements-render.txt" ]; then
    echo "Using Render-specific requirements..."
    pip install --no-cache-dir -r requirements-render.txt
else
    echo "Using standard requirements..."
    pip install --no-cache-dir -r requirements.txt
fi

# Download NLTK data
echo "📚 Downloading NLTK data..."
python -c "
import nltk
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    print('NLTK data downloaded successfully')
except Exception as e:
    print(f'NLTK download warning: {e}')
"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data/models
mkdir -p data/medical_knowledge
mkdir -p data/auto_updates
mkdir -p logs

# Set permissions
echo "🔐 Setting permissions..."
chmod +x start_enhanced_api.sh
chmod +x start_with_auto_training.sh

# Verify installation
echo "🔍 Verifying installation..."
python -c "
import fastapi
import uvicorn
import pandas
import numpy
import sklearn
import schedule
print('✅ All core dependencies installed successfully')
"

echo "✅ Build completed successfully!" 