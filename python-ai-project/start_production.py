#!/usr/bin/env python3
"""
Production Startup Script for Hospital Management System AI Service
This script starts the AI service in production mode with proper configuration
"""

import os
import sys
import uvicorn
import logging
from pathlib import Path

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from deployment_config import get_uvicorn_config, deployment_settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, deployment_settings.LOG_LEVEL),
    format=deployment_settings.LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("ai_service.log")
    ]
)

logger = logging.getLogger(__name__)

def main():
    """Main function to start the production server"""
    try:
        logger.info("🚀 Starting Hospital Management System AI Service in Production Mode")
        logger.info(f"📊 Service Version: {deployment_settings.SERVICE_VERSION}")
        logger.info(f"🌐 Host: {deployment_settings.HOST}")
        logger.info(f"🔌 Port: {deployment_settings.PORT}")
        logger.info(f"👥 Workers: {deployment_settings.WORKERS}")
        
        # Get uvicorn configuration
        uvicorn_config = get_uvicorn_config()
        
        # Start the server
        uvicorn.run(
            "src.api.fastapi_app:app",
            **uvicorn_config
        )
        
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 