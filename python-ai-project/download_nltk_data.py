#!/usr/bin/env python3
"""
Download NLTK data for Hospital Management System AI
"""

import nltk
import ssl

def download_nltk_data():
    """Download required NLTK data"""
    print("Downloading NLTK data...")
    
    # Handle SSL issues
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context
    
    # List of required NLTK data
    nltk_data = [
        'punkt',
        'punkt_tab', 
        'stopwords',
        'wordnet',
        'averaged_perceptron_tagger',
        'maxent_ne_chunker',
        'words',
        'omw-1.4'
    ]
    
    for data in nltk_data:
        try:
            print(f"Downloading {data}...")
            nltk.download(data)
            print(f"✅ Downloaded {data}")
        except Exception as e:
            print(f"❌ Failed to download {data}: {e}")
    
    print("NLTK data download completed!")

if __name__ == "__main__":
    download_nltk_data() 