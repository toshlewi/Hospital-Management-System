#!/usr/bin/env python3
"""
Test script for AI service startup
"""

import sys
import os
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        from src.utils.config import get_settings
        print("✅ Config imported successfully")
    except Exception as e:
        print(f"❌ Config import failed: {e}")
        return False
    
    try:
        from src.utils.database import init_db
        print("✅ Database imported successfully")
    except Exception as e:
        print(f"❌ Database import failed: {e}")
        return False
    
    try:
        from src.utils.logging import setup_logging
        print("✅ Logging imported successfully")
    except Exception as e:
        print(f"❌ Logging import failed: {e}")
        return False
    
    try:
        from src.api.fastapi_app import app
        print("✅ FastAPI app imported successfully")
    except Exception as e:
        print(f"❌ FastAPI app import failed: {e}")
        return False
    
    return True

def test_nltk():
    """Test NLTK functionality"""
    print("\nTesting NLTK...")
    
    try:
        import nltk
        from nltk.tokenize import word_tokenize
        
        # Test tokenization
        text = "This is a test sentence."
        tokens = word_tokenize(text)
        print(f"✅ NLTK tokenization works: {tokens}")
        return True
    except Exception as e:
        print(f"❌ NLTK test failed: {e}")
        return False

def test_spacy():
    """Test spaCy functionality"""
    print("\nTesting spaCy...")
    
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        
        # Test processing
        text = "This is a test sentence."
        doc = nlp(text)
        print(f"✅ spaCy processing works: {len(doc)} tokens")
        return True
    except Exception as e:
        print(f"❌ spaCy test failed: {e}")
        return False

def main():
    """Main test function"""
    print("Hospital Management System AI - Service Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("❌ Import tests failed")
        return False
    
    # Test NLTK
    if not test_nltk():
        print("❌ NLTK tests failed")
        return False
    
    # Test spaCy
    if not test_spacy():
        print("❌ spaCy tests failed")
        return False
    
    print("\n" + "=" * 50)
    print("✅ All tests passed! AI service should start successfully.")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 