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
        """Load all collected medical data including new structured data"""
        logger.info("Loading medical data...")
        
        # Load existing data files
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
        
        # Load new structured data
        try:
            # Load condition-symptoms mapping
            mapping_path = self.data_dir / "differential_diagnosis" / "condition_symptoms_mapping.json"
            if mapping_path.exists():
                with open(mapping_path, 'r') as f:
                    loaded_data['condition_mapping'] = json.load(f)
                logger.info(f"Loaded condition mapping with {len(loaded_data['condition_mapping'])} conditions")
            
            # Load new structured CSV files
            structured_files = {
                'common_conditions': 'differential_diagnosis/common_conditions.csv',
                'lab_tests_new': 'diagnostic_tests/lab_tests.csv',
                'treatments_new': 'treatment_protocols/standard_treatments.csv'
            }
            
            for data_type, filepath in structured_files.items():
                file_path = self.data_dir / filepath
                if file_path.exists():
                    try:
                        df = pd.read_csv(file_path)
                        loaded_data[data_type] = df
                        logger.info(f"Loaded {len(df)} records from {filepath}")
                    except Exception as e:
                        logger.error(f"Error loading {filepath}: {e}")
                else:
                    logger.warning(f"File not found: {filepath}")
                    
        except Exception as e:
            logger.error(f"Error loading structured data: {e}")
        
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
    
    def create_enhanced_diagnosis_dataset(self, data: Dict[str, pd.DataFrame]) -> Tuple[List[str], List[str], List[Dict]]:
        """Create enhanced dataset for diagnosis prediction using structured data"""
        logger.info("Creating enhanced diagnosis dataset...")
        
        texts = []
        labels = []
        metadata = []
        
        # Use new structured condition mapping if available
        if 'condition_mapping' in data:
            condition_mapping = data['condition_mapping']
            for cond_id, cond_info in condition_mapping.items():
                # Create text from condition information
                primary_symptoms = ' '.join(cond_info.get('primary_symptoms', []))
                secondary_symptoms = ' '.join(cond_info.get('secondary_symptoms', []))
                risk_factors = ' '.join(cond_info.get('risk_factors', []))
                
                text = f"{cond_info.get('condition_name', cond_id)} {primary_symptoms} {secondary_symptoms} {risk_factors}"
                text = self.preprocess_medical_text(text)
                
                if text.strip():
                    texts.append(text)
                    labels.append(cond_id)
                    metadata.append({
                        'condition_id': cond_id,
                        'condition_name': cond_info.get('condition_name', cond_id),
                        'severity': cond_info.get('severity', 'moderate'),
                        'urgency_level': cond_info.get('urgency_level', 'medium'),
                        'category': cond_info.get('category', 'general')
                    })
        
        # Fallback to old data if structured data not available
        if not texts:
            logger.info("Using fallback data sources...")
            # Extract from PubMed research
            if 'pubmed' in data:
                df = data['pubmed']
                for _, row in df.iterrows():
                    if pd.notna(row.get('abstract')) and pd.notna(row.get('keywords')):
                        text = f"{row.get('title', '')} {row.get('abstract', '')}"
                        text = self.preprocess_medical_text(text)
                        if text.strip():
                            texts.append(text)
                            keywords = row.get('keywords', [])
                            if isinstance(keywords, list) and keywords:
                                labels.append(keywords[0])
                            else:
                                labels.append('general_medical')
                            metadata.append({'source': 'pubmed', 'condition_name': keywords[0] if keywords else 'general_medical'})
            
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
                            metadata.append({'source': 'diseases', 'condition_name': row.get('name', 'unknown_disease')})
        
        logger.info(f"Created enhanced diagnosis dataset with {len(texts)} samples")
        return texts, labels, metadata

    def create_enhanced_treatment_dataset(self, data: Dict[str, pd.DataFrame]) -> Tuple[List[str], List[str], List[Dict]]:
        """Create enhanced dataset for treatment recommendation using structured data"""
        logger.info("Creating enhanced treatment dataset...")
        
        texts = []
        labels = []
        metadata = []
        
        # Use new structured treatments if available
        if 'treatments_new' in data:
            df = data['treatments_new']
            for _, row in df.iterrows():
                if pd.notna(row.get('treatment_name')):
                    condition_text = row.get('condition_id', '')
                    description = row.get('description', '')
                    contraindications = row.get('contraindications', '')
                    
                    text = f"{row.get('treatment_name', '')} {condition_text} {description} {contraindications}"
                    text = self.preprocess_medical_text(text)
                    
                    if text.strip():
                        texts.append(text)
                        labels.append(row.get('treatment_name', 'unknown_treatment'))
                        metadata.append({
                            'treatment_id': row.get('treatment_id', ''),
                            'treatment_name': row.get('treatment_name', ''),
                            'priority': row.get('priority', 'medium'),
                            'category': row.get('treatment_category', 'medication')
                        })
        
        # Fallback to old data
        if not texts:
            logger.info("Using fallback treatment data...")
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
                            metadata.append({'source': 'protocols', 'protocol': row.get('protocol', 'unknown_protocol')})
        
        logger.info(f"Created enhanced treatment dataset with {len(texts)} samples")
        return texts, labels, metadata

    def create_test_recommendation_dataset(self, data: Dict[str, pd.DataFrame]) -> Tuple[List[str], List[str], List[Dict]]:
        """Create dataset for test recommendation using structured data"""
        logger.info("Creating test recommendation dataset...")
        
        texts = []
        labels = []
        metadata = []
        
        if 'lab_tests_new' in data:
            df = data['lab_tests_new']
            for _, row in df.iterrows():
                if pd.notna(row.get('test_name')):
                    condition_text = row.get('condition_id', '')
                    description = row.get('description', '')
                    normal_range = row.get('normal_range', '')
                    
                    text = f"{row.get('test_name', '')} {condition_text} {description} {normal_range}"
                    text = self.preprocess_medical_text(text)
                    
                    if text.strip():
                        texts.append(text)
                        labels.append(row.get('test_name', 'unknown_test'))
                        metadata.append({
                            'test_id': row.get('test_id', ''),
                            'test_name': row.get('test_name', ''),
                            'priority': row.get('priority', 'medium'),
                            'category': row.get('test_category', 'laboratory')
                        })
        
        logger.info(f"Created test recommendation dataset with {len(texts)} samples")
        return texts, labels, metadata

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
    
    def train_enhanced_diagnosis_model(self, texts: List[str], labels: List[str], metadata: List[Dict]):
        """Train enhanced diagnosis prediction model with metadata"""
        logger.info("Training enhanced diagnosis model...")
        
        if len(texts) < 10:
            logger.warning("Insufficient data for enhanced diagnosis model training")
            return None
        
        # Check if we have enough samples per class for stratified split
        from collections import Counter
        label_counts = Counter(labels)
        min_samples_per_class = min(label_counts.values())
        
        if min_samples_per_class < 2:
            logger.warning(f"Insufficient samples per class (min: {min_samples_per_class}). Using regular split.")
            # Use regular split instead of stratified
            X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
                texts, labels, metadata, test_size=0.2, random_state=42
            )
        else:
            # Use stratified split
            X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
                texts, labels, metadata, test_size=0.2, random_state=42, stratify=labels
            )
        
        # Create TF-IDF vectorizer with medical-specific features
        vectorizer = TfidfVectorizer(
            max_features=10000,  # Increased for better coverage
            ngram_range=(1, 3),  # Include trigrams for medical terms
            min_df=2,
            max_df=0.8,
            stop_words='english'  # Use string instead of set
        )
        
        # Create enhanced pipeline with multiple classifiers
        from sklearn.ensemble import VotingClassifier
        from sklearn.svm import SVC
        
        clf1 = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
        clf2 = LogisticRegression(random_state=42, max_iter=2000, C=1.0)
        clf3 = SVC(probability=True, random_state=42, kernel='rbf')
        
        ensemble = VotingClassifier(
            estimators=[('rf', clf1), ('lr', clf2), ('svc', clf3)],
            voting='soft'
        )
        
        pipeline = Pipeline([
            ('vectorizer', vectorizer),
            ('classifier', ensemble)
        ])
        
        # Train model
        pipeline.fit(X_train, y_train)
        
        # Evaluate
        y_pred = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Enhanced diagnosis model accuracy: {accuracy:.3f}")
        
        # Save model with metadata
        model_data = {
            'pipeline': pipeline,
            'metadata': {
                'training_samples': len(X_train),
                'test_samples': len(X_test),
                'accuracy': accuracy,
                'unique_labels': len(set(labels)),
                'training_date': datetime.now().isoformat()
            }
        }
        
        model_path = self.models_dir / "enhanced_diagnosis_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        # Save evaluation report
        report = classification_report(y_test, y_pred, output_dict=True)
        report_path = self.models_dir / "enhanced_diagnosis_model_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.models['enhanced_diagnosis'] = pipeline
        logger.info(f"Enhanced diagnosis model saved to {model_path}")
        
        return pipeline

    def train_enhanced_treatment_model(self, texts: List[str], labels: List[str], metadata: List[Dict]):
        """Train enhanced treatment recommendation model"""
        logger.info("Training enhanced treatment model...")
        
        if len(texts) < 10:
            logger.warning("Insufficient data for enhanced treatment model training")
            return None
        
        # Check if we have enough samples per class for stratified split
        from collections import Counter
        label_counts = Counter(labels)
        min_samples_per_class = min(label_counts.values())
        
        if min_samples_per_class < 2:
            logger.warning(f"Insufficient samples per class (min: {min_samples_per_class}). Using regular split.")
            # Use regular split instead of stratified
            X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
                texts, labels, metadata, test_size=0.2, random_state=42
            )
        else:
            # Use stratified split
            X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
                texts, labels, metadata, test_size=0.2, random_state=42, stratify=labels
            )
        
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )
        
        # Create pipeline with multiple classifiers
        from sklearn.ensemble import VotingClassifier
        
        clf1 = RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1)
        clf2 = LogisticRegression(random_state=42, max_iter=1500)
        
        ensemble = VotingClassifier(
            estimators=[('rf', clf1), ('lr', clf2)],
            voting='soft'
        )
        
        pipeline = Pipeline([
            ('vectorizer', vectorizer),
            ('classifier', ensemble)
        ])
        
        # Train model
        pipeline.fit(X_train, y_train)
        
        # Evaluate
        y_pred = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Enhanced treatment model accuracy: {accuracy:.3f}")
        
        # Save model
        model_path = self.models_dir / "enhanced_treatment_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(pipeline, f)
        
        self.models['enhanced_treatment'] = pipeline
        logger.info(f"Enhanced treatment model saved to {model_path}")
        
        return pipeline

    def train_test_recommendation_model(self, texts: List[str], labels: List[str], metadata: List[Dict]):
        """Train test recommendation model"""
        logger.info("Training test recommendation model...")
        
        if len(texts) < 10:
            logger.warning("Insufficient data for test recommendation model training")
            return None
        
        # Check if we have enough samples per class for stratified split
        from collections import Counter
        label_counts = Counter(labels)
        min_samples_per_class = min(label_counts.values())
        
        if min_samples_per_class < 2:
            logger.warning(f"Insufficient samples per class (min: {min_samples_per_class}). Using regular split.")
            # Use regular split instead of stratified
            X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
                texts, labels, metadata, test_size=0.2, random_state=42
            )
        else:
            # Use stratified split
            X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
                texts, labels, metadata, test_size=0.2, random_state=42, stratify=labels
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
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))
        ])
        
        # Train model
        pipeline.fit(X_train, y_train)
        
        # Evaluate
        y_pred = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Test recommendation model accuracy: {accuracy:.3f}")
        
        # Save model
        model_path = self.models_dir / "test_recommendation_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(pipeline, f)
        
        self.models['test_recommendation'] = pipeline
        logger.info(f"Test recommendation model saved to {model_path}")
        
        return pipeline

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

    def train_automated_pipeline(self):
        """Automated training pipeline with all enhanced models"""
        logger.info("Starting automated enhanced training pipeline...")
        
        # Load data
        data = self.load_medical_data()
        
        if not data:
            logger.error("No medical data found. Please ensure data files exist.")
            return
        
        # Create enhanced datasets
        diagnosis_texts, diagnosis_labels, diagnosis_metadata = self.create_enhanced_diagnosis_dataset(data)
        treatment_texts, treatment_labels, treatment_metadata = self.create_enhanced_treatment_dataset(data)
        test_texts, test_labels, test_metadata = self.create_test_recommendation_dataset(data)
        
        # Train models
        models_trained = {}
        
        if diagnosis_texts and diagnosis_labels:
            logger.info("Training enhanced diagnosis model...")
            diagnosis_model = self.train_enhanced_diagnosis_model(diagnosis_texts, diagnosis_labels, diagnosis_metadata)
            if diagnosis_model:
                models_trained['enhanced_diagnosis'] = diagnosis_model
        
        if treatment_texts and treatment_labels:
            logger.info("Training enhanced treatment model...")
            treatment_model = self.train_enhanced_treatment_model(treatment_texts, treatment_labels, treatment_metadata)
            if treatment_model:
                models_trained['enhanced_treatment'] = treatment_model
        
        if test_texts and test_labels:
            logger.info("Training test recommendation model...")
            test_model = self.train_test_recommendation_model(test_texts, test_labels, test_metadata)
            if test_model:
                models_trained['test_recommendation'] = test_model
        
        # Train BERT model if enough data
        if len(diagnosis_texts) > 50:
            logger.info("Training BERT model...")
            bert_model = self.train_bert_medical_model(diagnosis_texts, diagnosis_labels)
            if bert_model:
                models_trained['bert'] = bert_model
        
        # Save comprehensive training summary
        summary = {
            "training_date": datetime.now().isoformat(),
            "models_trained": list(models_trained.keys()),
            "total_samples": {
                "diagnosis": len(diagnosis_texts),
                "treatment": len(treatment_texts),
                "tests": len(test_texts)
            },
            "data_sources": {
                "structured_data": 'condition_mapping' in data,
                "pubmed_data": 'pubmed' in data,
                "clinical_trials": 'clinical_trials' in data,
                "diseases_db": 'diseases' in data
            },
            "model_performance": {}
        }
        
        # Add performance metrics
        for model_name, model in models_trained.items():
            if hasattr(model, 'score'):
                summary["model_performance"][model_name] = "trained_successfully"
        
        summary_path = self.models_dir / "enhanced_training_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Save model selector for inference
        selector = {
            "diagnosis": "enhanced_diagnosis" if "enhanced_diagnosis" in models_trained else "diagnosis",
            "treatment": "enhanced_treatment" if "enhanced_treatment" in models_trained else "treatment",
            "tests": "test_recommendation" if "test_recommendation" in models_trained else None
        }
        selector_path = self.models_dir / "enhanced_model_selector.json"
        with open(selector_path, 'w') as f:
            json.dump(selector, f, indent=2)
        
        logger.info(f"Automated training completed. Models trained: {list(models_trained.keys())}")
        logger.info(f"Training summary saved to {summary_path}")
        logger.info(f"Model selector saved to {selector_path}")
        
        return models_trained

def main():
    """Main function to run the training system"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Medical AI Training System')
    parser.add_argument('--mode', choices=['legacy', 'enhanced', 'auto'], default='auto',
                       help='Training mode: legacy (old), enhanced (new structured), auto (recommended)')
    parser.add_argument('--models-dir', default='data/models',
                       help='Directory to save trained models')
    parser.add_argument('--data-dir', default=None,
                       help='Directory containing medical data (auto-detected if not specified)')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    trainer = MedicalAITrainingSystem(data_dir=args.data_dir, models_dir=args.models_dir)
    
    if args.mode == 'legacy':
        logger.info("Running legacy training pipeline...")
        trainer.train_all_models()
    elif args.mode == 'enhanced':
        logger.info("Running enhanced training pipeline...")
        trainer.train_automated_pipeline()
    else:  # auto mode
        logger.info("Running automated training pipeline (recommended)...")
        trainer.train_automated_pipeline()

if __name__ == "__main__":
    main() 