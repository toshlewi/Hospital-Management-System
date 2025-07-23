#!/usr/bin/env python3
"""
Medical AI Training System
Trains models on collected medical data for diagnosis and clinical decision support
"""

import os
import json
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import logging
from datetime import datetime
import asyncio

# Machine Learning libraries
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

# Deep Learning
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModel, TrainingArguments, Trainer
from sentence_transformers import SentenceTransformer

# Medical NLP
import spacy
from spacy.tokens import Doc
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedicalDataset(Dataset):
    """Custom dataset for medical data"""
    
    def __init__(self, texts, labels, tokenizer, max_length=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

class MedicalAITrainingSystem:
    """Comprehensive training system for medical AI models"""
    
    def __init__(self, data_dir: str = None, models_dir: str = "data/models"):
        # Always use absolute path to medical_knowledge directory
        base_dir = Path(__file__).parent.parent.parent.parent.resolve()
        self.data_dir = base_dir / "python-ai-project" / "data" / "medical_knowledge"
        self.models_dir = base_dir / "python-ai-project" / "data" / "models"
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        # Load spaCy model for medical NLP
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Installing...")
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
        # Download NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
            nltk.download('stopwords')
        
        self.stop_words = set(stopwords.words('english'))
        
        # Initialize models
        self.models = {}
        self.vectorizers = {}
        self.label_encoders = {}
    
    def load_medical_data(self) -> Dict[str, pd.DataFrame]:
        """Load all collected medical data"""
        logger.info("Loading medical data...")
        
        data_files = {
            'pubmed': 'pubmed_research.csv',
            'clinical_trials': 'clinical_trials.csv',
            'diseases': 'diseases_database.csv',
            'drugs': 'drugs_database.csv',
            'guidelines': 'medical_guidelines.csv',
            'symptoms': 'symptoms_database.csv',
            'protocols': 'treatment_protocols.csv',
            'lab_tests': 'lab_tests_reference.csv',
            'imaging': 'medical_imaging.csv',
            'pharmacology': 'pharmacology_data.csv'
        }
        
        loaded_data = {}
        
        for data_type, filename in data_files.items():
            file_path = self.data_dir / filename
            if file_path.exists():
                try:
                    df = pd.read_csv(file_path)
                    loaded_data[data_type] = df
                    logger.info(f"Loaded {len(df)} records from {filename}")
                except Exception as e:
                    logger.error(f"Error loading {filename}: {e}")
            else:
                logger.warning(f"File not found: {filename}")
        
        return loaded_data
    
    def preprocess_medical_text(self, text: str) -> str:
        """Preprocess medical text for analysis"""
        if pd.isna(text):
            return ""
        
        # Convert to string and lowercase
        text = str(text).lower()
        
        # Remove special characters but keep medical terms
        import re
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Tokenize and remove stop words
        tokens = word_tokenize(text)
        tokens = [token for token in tokens if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def create_diagnosis_dataset(self, data: Dict[str, pd.DataFrame]) -> Tuple[List[str], List[str]]:
        """Create dataset for diagnosis prediction"""
        logger.info("Creating diagnosis dataset...")
        
        texts = []
        labels = []
        
        # Extract from PubMed research
        if 'pubmed' in data:
            df = data['pubmed']
            for _, row in df.iterrows():
                if pd.notna(row.get('abstract')) and pd.notna(row.get('keywords')):
                    text = f"{row.get('title', '')} {row.get('abstract', '')}"
                    text = self.preprocess_medical_text(text)
                    if text.strip():
                        texts.append(text)
                        # Use first keyword as label
                        keywords = row.get('keywords', [])
                        if isinstance(keywords, list) and keywords:
                            labels.append(keywords[0])
                        else:
                            labels.append('general_medical')
        
        # Extract from diseases database
        if 'diseases' in data:
            df = data['diseases']
            for _, row in df.iterrows():
                if pd.notna(row.get('name')):
                    symptoms_text = ' '.join(row.get('symptoms', []))
                    treatments_text = ' '.join(row.get('treatments', []))
                    text = f"{row.get('name', '')} {symptoms_text} {treatments_text}"
                    text = self.preprocess_medical_text(text)
                    if text.strip():
                        texts.append(text)
                        labels.append(row.get('name', 'unknown_disease'))
        
        # Extract from symptoms database
        if 'symptoms' in data:
            df = data['symptoms']
            for _, row in df.iterrows():
                if pd.notna(row.get('symptom')):
                    causes_text = ' '.join(row.get('possible_causes', []))
                    text = f"{row.get('symptom', '')} {causes_text}"
                    text = self.preprocess_medical_text(text)
                    if text.strip():
                        texts.append(text)
                        labels.append(row.get('symptom', 'unknown_symptom'))
        
        logger.info(f"Created diagnosis dataset with {len(texts)} samples")
        return texts, labels
    
    def create_treatment_dataset(self, data: Dict[str, pd.DataFrame]) -> Tuple[List[str], List[str]]:
        """Create dataset for treatment recommendation"""
        logger.info("Creating treatment dataset...")
        
        texts = []
        labels = []
        
        # Extract from treatment protocols
        if 'protocols' in data:
            df = data['protocols']
            for _, row in df.iterrows():
                if pd.notna(row.get('condition')):
                    steps_text = ' '.join(row.get('steps', []))
                    meds_text = ' '.join(row.get('medications', []))
                    text = f"{row.get('condition', '')} {steps_text} {meds_text}"
                    text = self.preprocess_medical_text(text)
                    if text.strip():
                        texts.append(text)
                        labels.append(row.get('protocol', 'unknown_protocol'))
        
        # Extract from medical guidelines
        if 'guidelines' in data:
            df = data['guidelines']
            for _, row in df.iterrows():
                if pd.notna(row.get('condition')):
                    recs_text = ' '.join(row.get('recommendations', []))
                    text = f"{row.get('condition', '')} {recs_text}"
                    text = self.preprocess_medical_text(text)
                    if text.strip():
                        texts.append(text)
                        labels.append(row.get('guideline', 'unknown_guideline'))
        
        logger.info(f"Created treatment dataset with {len(texts)} samples")
        return texts, labels
    
    def train_diagnosis_model(self, texts: List[str], labels: List[str]):
        """Train diagnosis prediction model"""
        logger.info("Training diagnosis model...")
        
        if len(texts) < 10:
            logger.warning("Insufficient data for diagnosis model training")
            return None
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )
        
        # Create pipeline
        pipeline = Pipeline([
            ('vectorizer', vectorizer),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        
        # Train model
        pipeline.fit(X_train, y_train)
        
        # Evaluate
        y_pred = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Diagnosis model accuracy: {accuracy:.3f}")
        
        # Save model
        model_path = self.models_dir / "diagnosis_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(pipeline, f)
        
        # Save evaluation report
        report = classification_report(y_test, y_pred, output_dict=True)
        report_path = self.models_dir / "diagnosis_model_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.models['diagnosis'] = pipeline
        logger.info(f"Diagnosis model saved to {model_path}")
        
        return pipeline
    
    def train_treatment_model(self, texts: List[str], labels: List[str]):
        """Train treatment recommendation model"""
        logger.info("Training treatment model...")
        
        if len(texts) < 10:
            logger.warning("Insufficient data for treatment model training")
            return None
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_features=3000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )
        
        # Create pipeline
        pipeline = Pipeline([
            ('vectorizer', vectorizer),
            ('classifier', LogisticRegression(random_state=42, max_iter=1000))
        ])
        
        # Train model
        pipeline.fit(X_train, y_train)
        
        # Evaluate
        y_pred = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Treatment model accuracy: {accuracy:.3f}")
        
        # Save model
        model_path = self.models_dir / "treatment_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(pipeline, f)
        
        # Save evaluation report
        report = classification_report(y_test, y_pred, output_dict=True)
        report_path = self.models_dir / "treatment_model_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.models['treatment'] = pipeline
        logger.info(f"Treatment model saved to {model_path}")
        
        return pipeline
    
    def train_bert_medical_model(self, texts: List[str], labels: List[str], model_name: str = "medical_bert"):
        """Train BERT-based medical model"""
        logger.info(f"Training BERT medical model: {model_name}")
        
        if len(texts) < 10:
            logger.warning("Insufficient data for BERT model training")
            return None
        
        # Encode labels
        label_encoder = LabelEncoder()
        encoded_labels = label_encoder.fit_transform(labels)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, encoded_labels, test_size=0.2, random_state=42, stratify=encoded_labels
        )
        
        # Use a smaller BERT model for efficiency
        model_name = "distilbert-base-uncased"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name)
        
        # Create datasets
        train_dataset = MedicalDataset(X_train, y_train, tokenizer)
        test_dataset = MedicalDataset(X_test, y_test, tokenizer)
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir=f"./results/{model_name}",
            num_train_epochs=3,
            per_device_train_batch_size=8,
            per_device_eval_batch_size=8,
            warmup_steps=500,
            weight_decay=0.01,
            logging_dir=f"./logs/{model_name}",
            logging_steps=10,
            evaluation_strategy="steps",
            eval_steps=100,
            save_steps=1000,
            load_best_model_at_end=True,
        )
        
        # Create trainer
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=test_dataset,
        )
        
        # Train model
        trainer.train()
        
        # Save model
        model_path = self.models_dir / f"{model_name}_model"
        trainer.save_model(str(model_path))
        tokenizer.save_pretrained(str(model_path))
        
        # Save label encoder
        label_encoder_path = self.models_dir / f"{model_name}_label_encoder.pkl"
        with open(label_encoder_path, 'wb') as f:
            pickle.dump(label_encoder, f)
        
        self.models[model_name] = {
            'model': model,
            'tokenizer': tokenizer,
            'label_encoder': label_encoder
        }
        
        logger.info(f"BERT model saved to {model_path}")
        return model
    
    def train_sentence_transformer_model(self, texts: List[str], labels: List[str]):
        """Train sentence transformer for medical text similarity"""
        logger.info("Training sentence transformer model...")
        
        if len(texts) < 10:
            logger.warning("Insufficient data for sentence transformer training")
            return None
        
        # Create sentence pairs for training
        sentence_pairs = []
        for i in range(len(texts)):
            for j in range(i + 1, min(i + 5, len(texts))):  # Create pairs with nearby sentences
                if labels[i] == labels[j]:
                    sentence_pairs.append([texts[i], texts[j], 1.0])  # Similar
                else:
                    sentence_pairs.append([texts[i], texts[j], 0.0])  # Different
        
        # Initialize model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Train model (fine-tuning)
        train_sentences = [pair[0] for pair in sentence_pairs[:1000]]  # Limit for efficiency
        train_labels = [pair[2] for pair in sentence_pairs[:1000]]
        
        # Simple training loop
        model.fit(train_sentences, train_labels, epochs=3, batch_size=16)
        
        # Save model
        model_path = self.models_dir / "sentence_transformer_model"
        model.save(str(model_path))
        
        self.models['sentence_transformer'] = model
        logger.info(f"Sentence transformer model saved to {model_path}")
        
        return model
    
    def train_all_models(self):
        """Train all medical AI models"""
        logger.info("Starting comprehensive medical AI model training...")
        
        # Load data
        data = self.load_medical_data()
        
        if not data:
            logger.error("No medical data found. Please run data collection first.")
            return
        
        # Create datasets
        diagnosis_texts, diagnosis_labels = self.create_diagnosis_dataset(data)
        treatment_texts, treatment_labels = self.create_treatment_dataset(data)
        
        # Train models
        models_trained = {}
        
        if diagnosis_texts and diagnosis_labels:
            diagnosis_model = self.train_diagnosis_model(diagnosis_texts, diagnosis_labels)
            if diagnosis_model:
                models_trained['diagnosis'] = diagnosis_model
        
        if treatment_texts and treatment_labels:
            treatment_model = self.train_treatment_model(treatment_texts, treatment_labels)
            if treatment_model:
                models_trained['treatment'] = treatment_model
        
        # Train BERT model if enough data
        if len(diagnosis_texts) > 50:
            bert_model = self.train_bert_medical_model(diagnosis_texts, diagnosis_labels)
            if bert_model:
                models_trained['bert'] = bert_model
        
        # Train sentence transformer
        if len(diagnosis_texts) > 20:
            st_model = self.train_sentence_transformer_model(diagnosis_texts, diagnosis_labels)
            if st_model:
                models_trained['sentence_transformer'] = st_model
        
        # Save training summary
        summary = {
            "training_date": datetime.now().isoformat(),
            "models_trained": list(models_trained.keys()),
            "total_samples": len(diagnosis_texts) + len(treatment_texts),
            "diagnosis_samples": len(diagnosis_texts),
            "treatment_samples": len(treatment_texts)
        }
        
        summary_path = self.models_dir / "training_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Save model selector (for inference)
        selector = {}
        if 'bert' in models_trained:
            selector['diagnosis'] = 'bert'
        elif 'sentence_transformer' in models_trained:
            selector['diagnosis'] = 'sentence_transformer'
        elif 'diagnosis' in models_trained:
            selector['diagnosis'] = 'diagnosis'
        else:
            selector['diagnosis'] = None
        selector_path = self.models_dir / "model_selector.json"
        with open(selector_path, 'w') as f:
            json.dump(selector, f, indent=2)
        
        logger.info(f"Training completed. Models trained: {list(models_trained.keys())}. Model selector: {selector}")
        return models_trained

def main():
    """Main function to run the training system"""
    trainer = MedicalAITrainingSystem()
    trainer.train_all_models()

if __name__ == "__main__":
    main() 