#!/usr/bin/env python3
"""
Startup script for the Hospital Management System AI Service
"""

import os
import sys
import uvicorn
import yaml
from pathlib import Path

def load_config():
    """Load configuration from config.yaml"""
    config_path = Path(__file__).parent / "config.yaml"
    
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    else:
        # Default configuration
        return {
            "api": {
                "host": "0.0.0.0",
                "port": 8000,
                "debug": True,
                "workers": 1,
                "timeout": 30
            },
            "database": {
                "host": "localhost",
                "port": 5432,
                "name": "hospital_management",
                "user": "postgres",
                "password": "password",
                "pool_size": 20,
                "max_overflow": 30
            },
            "ai_models": {
                "diagnosis": {
                    "model_path": "data/models/diagnosis_model.pkl",
                    "confidence_threshold": 0.8,
                    "max_predictions": 5
                },
                "risk_assessment": {
                    "model_path": "data/models/risk_model.pkl",
                    "risk_threshold": 0.7
                },
                "recommendations": {
                    "model_path": "data/models/recommendation_model.pkl",
                    "max_recommendations": 10
                }
            },
            "external_apis": {
                "openai": {
                    "api_key": os.getenv("OPENAI_API_KEY", ""),
                    "model": "gpt-4",
                    "max_tokens": 1000
                }
            },
            "logging": {
                "level": "INFO",
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "file": "logs/ai_service.log",
                "max_size": 10485760,
                "backup_count": 5
            }
        }

def setup_environment():
    """Setup environment variables and directories"""
    
    # Create necessary directories
    directories = [
        "logs",
        "data/models",
        "data/medical_knowledge",
        "data/training_data"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")
    
    # Set environment variables
    os.environ.setdefault("PYTHONPATH", str(Path(__file__).parent / "src"))
    os.environ.setdefault("AI_SERVICE_ENV", "development")

def main():
    """Main startup function"""
    
    print("Starting Hospital Management System AI Service...")
    print("=" * 50)
    
    # Setup environment
    setup_environment()
    
    # Load configuration
    config = load_config()
    
    # Set environment variables from config
    for key, value in config.get("external_apis", {}).get("openai", {}).items():
        env_key = f"OPENAI_{key.upper()}"
        if not os.getenv(env_key):
            os.environ[env_key] = str(value)
    
    # Configure logging
    import logging
    logging.basicConfig(
        level=getattr(logging, config["logging"]["level"]),
        format=config["logging"]["format"],
        handlers=[
            logging.FileHandler(config["logging"]["file"]),
            logging.StreamHandler()
        ]
    )
    
    print(f"Configuration loaded:")
    print(f"  - API Host: {config['api']['host']}")
    print(f"  - API Port: {config['api']['port']}")
    print(f"  - Debug Mode: {config['api']['debug']}")
    print(f"  - Workers: {config['api']['workers']}")
    print(f"  - Database: {config['database']['host']}:{config['database']['port']}")
    print(f"  - Log Level: {config['logging']['level']}")
    
    # Start the server
    try:
        uvicorn.run(
            "src.api.fastapi_app:app",
            host=config["api"]["host"],
            port=config["api"]["port"],
            reload=config["api"]["debug"],
            workers=config["api"]["workers"] if not config["api"]["debug"] else 1,
            log_level=config["logging"]["level"].lower(),
            access_log=True
        )
    except KeyboardInterrupt:
        print("\nShutting down AI service...")
    except Exception as e:
        print(f"Error starting AI service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 