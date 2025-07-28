#!/usr/bin/env python3
"""
Startup Training Script
This script ensures the AI model is trained when the service starts up.
It can be called from the Dockerfile or as a separate process.
"""

import asyncio
import os
import sys
from advanced_medical_ai import AdvancedMedicalAI

async def startup_training():
    """Initialize and train the AI model on startup"""
    try:
        print("🚀 Starting AI training on startup...")
        
        # Initialize the AI system
        ai = AdvancedMedicalAI()
        
        # Load existing data
        await ai.load_existing_data()
        print(f"✅ Loaded existing model with {ai.accuracy:.2%} accuracy")
        print(f"🏥 Diseases in database: {len(ai.diseases_database)}")
        
        # Check if training is needed
        if len(ai.diseases_database) < 10:
            print("⚠️ Not enough diseases in database, training required")
            await ai.train_model()
            print(f"✅ Training completed! New accuracy: {ai.accuracy:.2%}")
        else:
            print("✅ Sufficient diseases in database, training not required")
        
        print("🎉 Startup training process completed!")
        
    except Exception as e:
        print(f"❌ Error during startup training: {e}")
        # Don't exit with error - the service should still start
        return False
    
    return True

if __name__ == "__main__":
    # Run the startup training
    success = asyncio.run(startup_training())
    if not success:
        print("⚠️ Startup training failed, but continuing...")
    sys.exit(0 if success else 1) 