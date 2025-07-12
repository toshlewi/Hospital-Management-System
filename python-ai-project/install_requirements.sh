#!/bin/bash

echo "Hospital Management System AI - Requirements Installation"
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found. Please run this script from the python-ai-project directory."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install requirements
echo "Installing Python requirements..."
source venv/bin/activate
pip install --upgrade pip

# Try installing with regular pip first
echo "Installing requirements..."
if ! pip install -r requirements.txt --no-cache-dir; then
    echo "First attempt failed, trying with legacy resolver..."
    pip install -r requirements.txt --no-cache-dir --use-deprecated=legacy-resolver
fi

# Download NLTK data
echo "Downloading NLTK data..."
python -c "
import nltk
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('omw-1.4')
print('NLTK data downloaded successfully')
"

# Download spaCy model
echo "Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Create necessary directories
echo "Creating directories..."
mkdir -p logs
mkdir -p data/models
mkdir -p data/medical_knowledge
mkdir -p data/training_data
mkdir -p uploads

# Verify installation
echo "Verifying installation..."
python -c "
import sys
import importlib

required_packages = [
    'fastapi', 'uvicorn', 'pydantic', 'sqlalchemy',
    'torch', 'transformers', 'sklearn', 'pandas', 'numpy',
    'spacy', 'nltk', 'Bio', 'requests'
]

missing_packages = []
for package in required_packages:
    try:
        importlib.import_module(package)
        print(f'✅ {package}')
    except ImportError:
        missing_packages.append(package)
        print(f'❌ {package}')

if missing_packages:
    print(f'Missing packages: {missing_packages}')
    sys.exit(1)
else:
    print('✅ All required packages installed successfully!')
"

echo ""
echo "✅ All requirements installed successfully!"
echo ""
echo "To activate the virtual environment:"
echo "source venv/bin/activate"
echo ""
echo "To start the AI service:"
echo "python start_ai_service.py"
echo ""
echo "To run the complete setup:"
echo "python setup_and_run.py" 