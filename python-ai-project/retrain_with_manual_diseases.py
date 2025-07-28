#!/usr/bin/env python3
"""
Retrain AI with Manual Diseases Only
This script retrains the AI model using only the 20 manually added diseases
"""

import json
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def retrain_with_manual_diseases():
    """Retrain the AI model with only the 20 manual diseases"""
    
    # Define the manual diseases (using exact names from database)
    manual_diseases = [
        "Diabetes Mellitus", "Hypertension", "Malaria", "HIV/AIDS", "Tuberculosis",
        "Pneumonia", "Asthma", "Epilepsy"
    ]
    
    logger.info("🔄 Retraining AI with manual diseases only...")
    
    # Load the diseases database
    try:
        with open("data/diseases_database.json", "r") as f:
            diseases_database = json.load(f)
        logger.info(f"📚 Loaded {len(diseases_database)} diseases from database")
    except Exception as e:
        logger.error(f"❌ Error loading diseases database: {e}")
        return
    
    # Filter to only manual diseases
    manual_diseases_data = {}
    for disease_name in manual_diseases:
        if disease_name in diseases_database:
            manual_diseases_data[disease_name] = diseases_database[disease_name]
            logger.info(f"✅ Found manual disease: {disease_name}")
        else:
            logger.warning(f"⚠️ Manual disease not found: {disease_name}")
    
    logger.info(f"📋 Using {len(manual_diseases_data)} manual diseases for training")
    
    # Generate training data from manual diseases
    training_data = []
    
    for disease_name, disease_data in manual_diseases_data.items():
        symptoms = disease_data.get('symptoms', [])
        
        # Create training examples for each symptom
        for symptom in symptoms:
            training_data.append({
                'symptoms': symptom.lower(),
                'disease': disease_name
            })
        
        # Create training examples for symptom combinations
        for i in range(len(symptoms)):
            for j in range(i+1, min(i+3, len(symptoms))):
                symptom_combo = " ".join(symptoms[i:j+1]).lower()
                training_data.append({
                    'symptoms': symptom_combo,
                    'disease': disease_name
                })
    
    logger.info(f"📊 Generated {len(training_data)} training examples")
    
    if len(training_data) < 10:
        logger.error("❌ Insufficient training data")
        return
    
    # Prepare training data
    X = [item['symptoms'] for item in training_data]
    y = [item['disease'] for item in training_data]
    
    logger.info(f"🎯 Training on {len(X)} examples with {len(set(y))} unique diseases")
    
    # Create and train vectorizer
    vectorizer = TfidfVectorizer(
        max_features=1000,
        stop_words='english',
        ngram_range=(1, 2)
    )
    
    X_vectorized = vectorizer.fit_transform(X)
    
    # Split data
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X_vectorized, y, test_size=0.2, random_state=42, stratify=y
        )
    except ValueError:
        logger.warning("⚠️ Using regular split due to insufficient samples per class")
        X_train, X_test, y_train, y_test = train_test_split(
            X_vectorized, y, test_size=0.2, random_state=42
        )
    
    # Train model
    classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    classifier.fit(X_train, y_train)
    
    # Evaluate
    y_pred = classifier.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    logger.info(f"🎯 Model accuracy: {accuracy:.2%}")
    
    # Save the new model
    model_data = {
        'vectorizer': vectorizer,
        'classifier': classifier,
        'accuracy': accuracy,
        'diseases': list(manual_diseases_data.keys())
    }
    
    try:
        with open("models/manual_diseases_model.pkl", "wb") as f:
            pickle.dump(model_data, f)
        logger.info("💾 New model saved as manual_diseases_model.pkl")
    except Exception as e:
        logger.error(f"❌ Error saving model: {e}")
    
    # Save updated training data
    try:
        with open("data/manual_training_data.json", "w") as f:
            json.dump(training_data, f, indent=2)
        logger.info("💾 Manual training data saved")
    except Exception as e:
        logger.error(f"❌ Error saving training data: {e}")
    
    # Test the model
    logger.info("🧪 Testing the model...")
    test_symptoms = [
        "increased thirst frequent urination",
        "high blood pressure headache",
        "fever chills body aches",
        "cough fever chest pain"
    ]
    
    for symptoms in test_symptoms:
        X_test_single = vectorizer.transform([symptoms])
        prediction = classifier.predict(X_test_single)[0]
        probability = classifier.predict_proba(X_test_single)[0].max()
        logger.info(f"📋 Symptoms: '{symptoms}' -> {prediction} ({probability:.2%})")
    
    logger.info("✅ Retraining completed!")

if __name__ == "__main__":
    retrain_with_manual_diseases() 