#!/usr/bin/env python3
"""
Diagnosis Model for Hospital Management System AI
"""

import pickle
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

class DiagnosisModel:
    """Simple diagnosis prediction model"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = Path(model_path) if model_path else Path("data/models/diagnosis_model.pkl")
        self.pipeline = None
        self.is_trained = False
        
        # Try to load existing model
        self.load_model()
    
    def load_model(self) -> bool:
        """Load trained model from file"""
        try:
            if self.model_path.exists():
                with open(self.model_path, 'rb') as f:
                    self.pipeline = pickle.load(f)
                self.is_trained = True
                logger.info(f"Loaded diagnosis model from {self.model_path}")
                return True
            else:
                logger.warning(f"Model file not found: {self.model_path}")
                return False
        except Exception as e:
            logger.error(f"Error loading diagnosis model: {e}")
            return False
    
    def save_model(self) -> bool:
        """Save trained model to file"""
        try:
            if self.pipeline is not None:
                self.model_path.parent.mkdir(parents=True, exist_ok=True)
                with open(self.model_path, 'wb') as f:
                    pickle.dump(self.pipeline, f)
                logger.info(f"Saved diagnosis model to {self.model_path}")
                return True
            else:
                logger.warning("No model to save")
                return False
        except Exception as e:
            logger.error(f"Error saving diagnosis model: {e}")
            return False
    
    def train(self, texts: List[str], labels: List[str]) -> bool:
        """Train the diagnosis model"""
        try:
            if len(texts) < 2:
                logger.warning("Not enough data to train model")
                return False
            
            # Create pipeline
            self.pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
                ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
            ])
            
            # Train model
            self.pipeline.fit(texts, labels)
            self.is_trained = True
            
            # Save model
            self.save_model()
            
            logger.info(f"Trained diagnosis model with {len(texts)} samples")
            return True
            
        except Exception as e:
            logger.error(f"Error training diagnosis model: {e}")
            return False
    
    def predict(self, text: str) -> Dict[str, Any]:
        """Predict diagnosis from text"""
        try:
            if not self.is_trained or self.pipeline is None:
                return {
                    "prediction": "unknown",
                    "confidence": 0.0,
                    "error": "Model not trained"
                }
            
            # Make prediction
            prediction = self.pipeline.predict([text])[0]
            probabilities = self.pipeline.predict_proba([text])[0]
            confidence = np.max(probabilities)
            
            return {
                "prediction": prediction,
                "confidence": float(confidence),
                "probabilities": probabilities.tolist()
            }
            
        except Exception as e:
            logger.error(f"Error making diagnosis prediction: {e}")
            return {
                "prediction": "error",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Predict diagnoses for multiple texts"""
        try:
            if not self.is_trained or self.pipeline is None:
                return [{"prediction": "unknown", "confidence": 0.0, "error": "Model not trained"} for _ in texts]
            
            # Make predictions
            predictions = self.pipeline.predict(texts)
            probabilities = self.pipeline.predict_proba(texts)
            confidences = np.max(probabilities, axis=1)
            
            results = []
            for i, text in enumerate(texts):
                results.append({
                    "prediction": predictions[i],
                    "confidence": float(confidences[i]),
                    "probabilities": probabilities[i].tolist()
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error making batch diagnosis predictions: {e}")
            return [{"prediction": "error", "confidence": 0.0, "error": str(e)} for _ in texts]
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "is_trained": self.is_trained,
            "model_path": str(self.model_path),
            "model_exists": self.model_path.exists()
        } 