#!/usr/bin/env python3
"""
Deployment Configuration for Hospital Management System AI Service
This file contains configuration settings for production deployment
"""

import os
from typing import Dict, Any
from pydantic import BaseSettings

class DeploymentSettings(BaseSettings):
    """Production deployment settings"""
    
    # Service Configuration
    SERVICE_NAME: str = "hospital-ai-service"
    SERVICE_VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    RELOAD: bool = False
    
    # API Configuration
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://hospital-management-system.vercel.app",
        "https://hospital-management-system.netlify.app"
    ]
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # AI Model Configuration
    AI_MODEL_CACHE_DIR: str = "./models"
    AI_MODEL_DOWNLOAD: bool = True
    
    # API Keys (for production)
    PUBMED_API_KEY: str = os.getenv("PUBMED_API_KEY", "27feebcf45a02d89cf3d56590f31507de309")
    FDA_API_KEY: str = os.getenv("FDA_API_KEY", "ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq")
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Security Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Cache Configuration
    CACHE_TTL: int = 3600  # 1 hour
    CACHE_MAX_SIZE: int = 1000
    
    # Health Check Configuration
    HEALTH_CHECK_INTERVAL: int = 30  # seconds
    HEALTH_CHECK_TIMEOUT: int = 10   # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
deployment_settings = DeploymentSettings()

def get_deployment_config() -> Dict[str, Any]:
    """Get deployment configuration as dictionary"""
    return deployment_settings.dict()

def get_uvicorn_config() -> Dict[str, Any]:
    """Get uvicorn server configuration"""
    return {
        "host": deployment_settings.HOST,
        "port": deployment_settings.PORT,
        "workers": deployment_settings.WORKERS,
        "reload": deployment_settings.RELOAD,
        "log_level": deployment_settings.LOG_LEVEL.lower(),
        "access_log": True,
        "use_colors": False
    }

def get_cors_config() -> Dict[str, Any]:
    """Get CORS configuration"""
    return {
        "allow_origins": deployment_settings.CORS_ORIGINS,
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
    }

def get_rate_limit_config() -> Dict[str, Any]:
    """Get rate limiting configuration"""
    return {
        "rate_limit_per_minute": deployment_settings.RATE_LIMIT_PER_MINUTE,
        "rate_limit_per_hour": deployment_settings.RATE_LIMIT_PER_HOUR,
    }

def get_cache_config() -> Dict[str, Any]:
    """Get cache configuration"""
    return {
        "ttl": deployment_settings.CACHE_TTL,
        "max_size": deployment_settings.CACHE_MAX_SIZE,
    }

def get_health_check_config() -> Dict[str, Any]:
    """Get health check configuration"""
    return {
        "interval": deployment_settings.HEALTH_CHECK_INTERVAL,
        "timeout": deployment_settings.HEALTH_CHECK_TIMEOUT,
    }

# Export configuration
__all__ = [
    "deployment_settings",
    "get_deployment_config",
    "get_uvicorn_config",
    "get_cors_config",
    "get_rate_limit_config",
    "get_cache_config",
    "get_health_check_config"
] 