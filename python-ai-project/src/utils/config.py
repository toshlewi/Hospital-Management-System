#!/usr/bin/env python3
"""
Configuration settings for the Hospital Management System AI Service
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_HOST: str = Field(default="0.0.0.0", env="API_HOST")
    API_PORT: int = Field(default=8000, env="API_PORT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Database Settings
    DATABASE_URL: str = Field(default="postgresql://postgres:password@localhost:5432/hospital_management", env="DATABASE_URL")
    DATABASE_HOST: str = Field(default="localhost", env="DATABASE_HOST")
    DATABASE_PORT: int = Field(default=5432, env="DATABASE_PORT")
    DATABASE_NAME: str = Field(default="hospital_management", env="DATABASE_NAME")
    DATABASE_USER: str = Field(default="postgres", env="DATABASE_USER")
    DATABASE_PASSWORD: str = Field(default="password", env="DATABASE_PASSWORD")
    
    # Redis Settings
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    
    # AI Model Settings
    AI_MODEL_PATH: str = Field(default="data/models", env="AI_MODEL_PATH")
    AI_CONFIDENCE_THRESHOLD: float = Field(default=0.8, env="AI_CONFIDENCE_THRESHOLD")
    AI_MAX_PREDICTIONS: int = Field(default=5, env="AI_MAX_PREDICTIONS")
    
    # External APIs
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4", env="OPENAI_MODEL")
    OPENAI_MAX_TOKENS: int = Field(default=1000, env="OPENAI_MAX_TOKENS")
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
        env="ALLOWED_ORIGINS"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1", "0.0.0.0"],
        env="ALLOWED_HOSTS"
    )
    
    # Logging Settings
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field(default="logs/ai_service.log", env="LOG_FILE")
    
    # Medical Data Settings
    MEDICAL_DATA_PATH: str = Field(default="data/medical_knowledge", env="MEDICAL_DATA_PATH")
    TRAINING_DATA_PATH: str = Field(default="data/training_data", env="TRAINING_DATA_PATH")
    
    # Security Settings
    SECRET_KEY: str = Field(default="your-secret-key-here", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
_settings = None

def get_settings() -> Settings:
    """Get application settings"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings

# Convenience functions
def get_database_url() -> str:
    """Get database URL from settings"""
    settings = get_settings()
    return settings.DATABASE_URL

def get_redis_url() -> str:
    """Get Redis URL from settings"""
    settings = get_settings()
    return settings.REDIS_URL

def get_ai_model_path() -> str:
    """Get AI model path from settings"""
    settings = get_settings()
    return settings.AI_MODEL_PATH

def get_openai_config() -> dict:
    """Get OpenAI configuration"""
    settings = get_settings()
    return {
        "api_key": settings.OPENAI_API_KEY,
        "model": settings.OPENAI_MODEL,
        "max_tokens": settings.OPENAI_MAX_TOKENS
    } 