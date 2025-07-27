#!/usr/bin/env python3
"""
Automated Medical AI Training Script
Trains enhanced AI models using structured medical data
"""

import os
import sys
import logging
import argparse
from pathlib import Path
from datetime import datetime

# Add the src directory to the path
sys.path.append(str(Path(__file__).parent / "src"))

from ai.training_system import MedicalAITrainingSystem

def setup_logging(verbose=False):
    """Setup logging configuration"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('training.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )

def check_prerequisites():
    """Check if all prerequisites are met"""
    logger = logging.getLogger(__name__)
    
    # Check if data directory exists
    data_dir = Path(__file__).parent / "data" / "medical_knowledge"
    if not data_dir.exists():
        logger.error(f"Data directory not found: {data_dir}")
        return False
    
    # Check for required structured data files
    required_files = [
        "differential_diagnosis/condition_symptoms_mapping.json",
        "differential_diagnosis/common_conditions.csv",
        "diagnostic_tests/lab_tests.csv",
        "treatment_protocols/standard_treatments.csv"
    ]
    
    missing_files = []
    for file_path in required_files:
        full_path = data_dir / file_path
        if not full_path.exists():
            missing_files.append(file_path)
    
    if missing_files:
        logger.warning(f"Missing structured data files: {missing_files}")
        logger.info("Training will proceed with available data and fallback to legacy sources")
    
    return True

def run_training(mode='auto', models_dir='data/models', verbose=False):
    """Run the training pipeline"""
    logger = logging.getLogger(__name__)
    
    try:
        # Initialize trainer
        trainer = MedicalAITrainingSystem(models_dir=models_dir)
        
        # Run training based on mode
        if mode == 'legacy':
            logger.info("Running legacy training pipeline...")
            models = trainer.train_all_models()
        elif mode == 'enhanced':
            logger.info("Running enhanced training pipeline...")
            models = trainer.train_automated_pipeline()
        else:  # auto mode
            logger.info("Running automated training pipeline (recommended)...")
            models = trainer.train_automated_pipeline()
        
        if models:
            logger.info(f"Training completed successfully! Trained models: {list(models.keys())}")
            return True
        else:
            logger.error("Training failed - no models were trained")
            return False
            
    except Exception as e:
        logger.error(f"Training failed with error: {e}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Automated Medical AI Training Script',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run automated training (recommended)
  python train_ai_models.py
  
  # Run with verbose logging
  python train_ai_models.py --verbose
  
  # Run legacy training
  python train_ai_models.py --mode legacy
  
  # Run enhanced training with custom models directory
  python train_ai_models.py --mode enhanced --models-dir ./my_models
        """
    )
    
    parser.add_argument('--mode', choices=['legacy', 'enhanced', 'auto'], default='auto',
                       help='Training mode: legacy (old), enhanced (new structured), auto (recommended)')
    parser.add_argument('--models-dir', default='data/models',
                       help='Directory to save trained models')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Enable verbose logging')
    parser.add_argument('--check-only', action='store_true',
                       help='Only check prerequisites without training')
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.verbose)
    logger = logging.getLogger(__name__)
    
    logger.info("=" * 60)
    logger.info("Medical AI Training System")
    logger.info("=" * 60)
    logger.info(f"Training mode: {args.mode}")
    logger.info(f"Models directory: {args.models_dir}")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info("=" * 60)
    
    # Check prerequisites
    if not check_prerequisites():
        logger.error("Prerequisites check failed. Please fix the issues and try again.")
        sys.exit(1)
    
    if args.check_only:
        logger.info("Prerequisites check passed. Use --check-only to verify setup.")
        return
    
    # Run training
    success = run_training(
        mode=args.mode,
        models_dir=args.models_dir,
        verbose=args.verbose
    )
    
    if success:
        logger.info("=" * 60)
        logger.info("Training completed successfully!")
        logger.info("Your AI models are ready to use.")
        logger.info("=" * 60)
        sys.exit(0)
    else:
        logger.error("=" * 60)
        logger.error("Training failed!")
        logger.error("Check the logs for details.")
        logger.error("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main() 