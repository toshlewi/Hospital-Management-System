#!/usr/bin/env python3
"""
Install requirements and setup NLTK data for Hospital Management System AI
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    
    # Check if virtual environment exists
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Creating virtual environment...")
        if not run_command("python3 -m venv venv", "Creating virtual environment"):
            return False
    
    # Upgrade pip first
    pip_upgrade_cmd = "venv/bin/pip install --upgrade pip"
    if not run_command(pip_upgrade_cmd, "Upgrading pip"):
        return False
    
    # Install requirements with legacy peer deps for compatibility
    pip_cmd = "venv/bin/pip install -r requirements.txt --no-cache-dir"
    if not run_command(pip_cmd, "Installing requirements"):
        # Try with legacy peer deps if first attempt fails
        pip_cmd_legacy = "venv/bin/pip install -r requirements.txt --no-cache-dir --use-deprecated=legacy-resolver"
        if not run_command(pip_cmd_legacy, "Installing requirements with legacy resolver"):
            return False
    
    return True

def download_nltk_data():
    """Download required NLTK data"""
    print("\nDownloading NLTK data...")
    
    nltk_script = """
import nltk
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('omw-1.4')
print("NLTK data downloaded successfully")
"""
    
    try:
        result = subprocess.run([
            "venv/bin/python", "-c", nltk_script
        ], check=True, capture_output=True, text=True)
        print("✅ NLTK data downloaded successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to download NLTK data: {e.stderr}")
        return False

def download_spacy_model():
    """Download spaCy model"""
    print("\nDownloading spaCy model...")
    
    try:
        result = subprocess.run([
            "venv/bin/python", "-m", "spacy", "download", "en_core_web_sm"
        ], check=True, capture_output=True, text=True)
        print("✅ spaCy model downloaded successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to download spaCy model: {e.stderr}")
        return False

def create_directories():
    """Create necessary directories"""
    print("\nCreating directories...")
    
    directories = [
        "logs",
        "data/models",
        "data/medical_knowledge",
        "data/training_data",
        "uploads"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    return True

def verify_installation():
    """Verify that key packages are installed correctly"""
    print("\nVerifying installation...")
    
    verification_script = """
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
        print(f"✅ {package}")
    except ImportError:
        missing_packages.append(package)
        print(f"❌ {package}")

if missing_packages:
    print(f"\\nMissing packages: {missing_packages}")
    sys.exit(1)
else:
    print("\\n✅ All required packages installed successfully!")
"""
    
    try:
        result = subprocess.run([
            "venv/bin/python", "-c", verification_script
        ], check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Installation verification failed: {e.stderr}")
        return False

def main():
    """Main installation function"""
    print("Hospital Management System AI - Requirements Installation")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path("requirements.txt").exists():
        print("❌ requirements.txt not found. Please run this script from the python-ai-project directory.")
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        print("❌ Failed to install requirements")
        sys.exit(1)
    
    # Download NLTK data
    if not download_nltk_data():
        print("❌ Failed to download NLTK data")
        sys.exit(1)
    
    # Download spaCy model
    if not download_spacy_model():
        print("❌ Failed to download spaCy model")
        sys.exit(1)
    
    # Create directories
    if not create_directories():
        print("❌ Failed to create directories")
        sys.exit(1)
    
    # Verify installation
    if not verify_installation():
        print("❌ Installation verification failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All requirements installed successfully!")
    print("\nTo activate the virtual environment:")
    print("source venv/bin/activate")
    print("\nTo start the AI service:")
    print("python start_ai_service.py")
    print("\nTo run the complete setup:")
    print("python setup_and_run.py")

if __name__ == "__main__":
    main() 