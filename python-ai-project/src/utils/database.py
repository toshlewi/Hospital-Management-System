#!/usr/bin/env python3
"""
Database utilities for the Hospital Management System AI Service
"""

import asyncio
import logging
from typing import Optional
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from .config import get_settings

logger = logging.getLogger(__name__)

# Global database engine
_engine = None
_async_engine = None
_session_factory = None

def get_database_engine():
    """Get database engine"""
    global _engine
    if _engine is None:
        settings = get_settings()
        database_url = settings.DATABASE_URL
        _engine = create_engine(
            database_url,
            poolclass=NullPool,
            echo=settings.DEBUG
        )
    return _engine

def get_async_database_engine():
    """Get async database engine"""
    global _async_engine
    if _async_engine is None:
        settings = get_settings()
        database_url = settings.DATABASE_URL
        # Convert to async URL if needed
        if database_url.startswith('postgresql://'):
            database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://')
        _async_engine = create_async_engine(
            database_url,
            poolclass=NullPool,
            echo=settings.DEBUG
        )
    return _async_engine

def get_session_factory():
    """Get database session factory"""
    global _session_factory
    if _session_factory is None:
        engine = get_database_engine()
        _session_factory = sessionmaker(
            bind=engine,
            autocommit=False,
            autoflush=False
        )
    return _session_factory

async def init_db():
    """Initialize database connection"""
    try:
        settings = get_settings()
        logger.info(f"Initializing database connection to {settings.DATABASE_HOST}:{settings.DATABASE_PORT}")
        
        # Test database connection
        engine = get_database_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")
        
        # Initialize async engine
        async_engine = get_async_database_engine()
        async with async_engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            logger.info("Async database connection successful")
        
        logger.info("Database initialization completed")
        return True
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

async def test_database_connection() -> bool:
    """Test database connection"""
    try:
        engine = get_database_engine()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

def get_db_session():
    """Get database session"""
    session_factory = get_session_factory()
    return session_factory()

async def get_async_db_session() -> AsyncSession:
    """Get async database session"""
    async_engine = get_async_database_engine()
    async_session = sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    async with async_session() as session:
        yield session 