#!/usr/bin/env python3
"""
Quick installation script for Hospital Management System AI requirements
"""

import subprocess
import sys
import os

def main():
    """Quick installation of requirements"""
    print("Quick Installation of Hospital Management System AI Requirements")
    print("=" * 60)
    
    # Check if requirements.txt exists
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found. Please run this script from the python-ai-project directory.")
        sys.exit(1)
    
    # Install requirements
    print("Installing requirements...")
    try:
        # Upgrade pip first
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=True)
        
        # Install requirements
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        
        print("✅ Requirements installed successfully!")
        
        # Download NLTK data
        print("Downloading NLTK data...")
        nltk_script = """
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
print("NLTK data downloaded successfully")
"""
        subprocess.run([sys.executable, "-c", nltk_script], check=True)
        
        # Download spaCy model
        print("Downloading spaCy model...")
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
        
        print("✅ All installations completed successfully!")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Installation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 