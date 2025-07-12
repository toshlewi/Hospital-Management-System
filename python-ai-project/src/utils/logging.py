#!/usr/bin/env python3
"""
Logging configuration for the Hospital Management System AI Service
"""

import logging
import sys
from pathlib import Path
from loguru import logger
from .config import get_settings

def setup_logging():
    """Setup logging configuration"""
    settings = get_settings()
    
    # Remove default handler
    logger.remove()
    
    # Create logs directory
    log_file = Path(settings.LOG_FILE)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Add console handler
    logger.add(
        sys.stdout,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}",
        level=settings.LOG_LEVEL,
        colorize=True
    )
    
    # Add file handler
    logger.add(
        settings.LOG_FILE,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}",
        level=settings.LOG_LEVEL,
        rotation="10 MB",
        retention="7 days",
        compression="zip"
    )
    
    # Intercept standard logging
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            try:
                level = logger.level(record.levelname).name
            except ValueError:
                level = record.levelno
            
            frame, depth = logging.currentframe(), 2
            while frame.f_code.co_filename == logging.__file__:
                frame = frame.f_back
                depth += 1
            
            logger.opt(depth=depth, exception=record.exc_info).log(
                level, record.getMessage()
            )
    
    # Replace standard logging handlers
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Set loguru as the default logger
    logging.getLogger().handlers = [InterceptHandler()]
    
    logger.info("Logging setup completed")
    return logger 