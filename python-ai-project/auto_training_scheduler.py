#!/usr/bin/env python3
"""
Automatic Training Scheduler for Medical AI
Updates data from PubMed, FDA, and WHO APIs daily at midnight
Implements continuous learning and self-improvement
"""

import asyncio
import aiohttp
import json
import schedule
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import os
import pickle
from pathlib import Path

# Import the advanced AI system
from advanced_medical_ai import AdvancedMedicalAI

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auto_training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AutoTrainingScheduler:
    def __init__(self):
        self.advanced_ai = AdvancedMedicalAI()
        self.is_running = False
        self.last_update = None
        self.update_count = 0
        
        # API Keys for different sources
        self.api_keys = {
            'pubmed': "27feebcf45a02d89cf3d56590f31507de309",
            'fda': "ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq",
            'who': None  # WHO API is public
        }
        
        # Data sources configuration
        self.data_sources = {
            'pubmed': {
                'base_url': 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
                'enabled': True,
                'update_frequency': 'daily'
            },
            'fda': {
                'base_url': 'https://api.fda.gov/',
                'enabled': True,
                'update_frequency': 'daily'
            },
            'who': {
                'base_url': 'https://www.who.int/data/gho/info/gho-odata-api',
                'enabled': True,
                'update_frequency': 'weekly'
            }
        }
        
    async def initialize(self):
        """Initialize the auto-training scheduler"""
        logger.info("🚀 Initializing Auto Training Scheduler...")
        
        # Load existing AI system
        await self.advanced_ai.load_existing_data()
        
        # Create necessary directories
        os.makedirs("data/auto_updates", exist_ok=True)
        os.makedirs("logs", exist_ok=True)
        
        # Load scheduler state
        await self.load_scheduler_state()
        
        logger.info("✅ Auto Training Scheduler initialized successfully!")
        
    async def load_scheduler_state(self):
        """Load scheduler state from file"""
        try:
            if os.path.exists("data/auto_updates/scheduler_state.json"):
                with open("data/auto_updates/scheduler_state.json", "r") as f:
                    state = json.load(f)
                    self.last_update = state.get('last_update')
                    self.update_count = state.get('update_count', 0)
                logger.info(f"📊 Loaded scheduler state: {self.update_count} updates completed")
        except Exception as e:
            logger.warning(f"⚠️ Could not load scheduler state: {e}")
            
    async def save_scheduler_state(self):
        """Save scheduler state to file"""
        try:
            state = {
                'last_update': self.last_update,
                'update_count': self.update_count,
                'ai_accuracy': self.advanced_ai.accuracy,
                'diseases_count': len(self.advanced_ai.diseases_database)
            }
            with open("data/auto_updates/scheduler_state.json", "w") as f:
                json.dump(state, f, indent=2)
        except Exception as e:
            logger.error(f"❌ Could not save scheduler state: {e}")
            
    async def fetch_who_data(self) -> Dict[str, Any]:
        """Fetch data from WHO API"""
        logger.info("🌍 Fetching data from WHO API...")
        
        try:
            async with aiohttp.ClientSession() as session:
                # WHO GHO API endpoints for health data
                who_endpoints = [
                    'https://www.who.int/data/gho/info/gho-odata-api',
                    'https://www.who.int/data/gho/data/indicators',
                    'https://www.who.int/data/gho/data/themes'
                ]
                
                who_data = {}
                
                for endpoint in who_endpoints:
                    try:
                        async with session.get(endpoint, timeout=30) as response:
                            if response.status == 200:
                                data = await response.json()
                                who_data[endpoint] = data
                                logger.info(f"✅ Fetched data from {endpoint}")
                            else:
                                logger.warning(f"⚠️ WHO API {endpoint} returned {response.status}")
                    except Exception as e:
                        logger.warning(f"⚠️ Error fetching from {endpoint}: {e}")
                        
                # Process WHO data for medical knowledge
                processed_data = await self.process_who_data(who_data)
                return processed_data
                
        except Exception as e:
            logger.error(f"❌ Error fetching WHO data: {e}")
            return {}
            
    async def process_who_data(self, who_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process WHO data into medical knowledge"""
        logger.info("🔬 Processing WHO data...")
        
        processed_data = {
            'diseases': {},
            'health_indicators': {},
            'treatment_guidelines': {}
        }
        
        try:
            # Extract disease information from WHO data
            for endpoint, data in who_data.items():
                if 'indicators' in endpoint:
                    # Process health indicators
                    if isinstance(data, dict) and 'value' in data:
                        for indicator in data.get('value', []):
                            if 'IndicatorName' in indicator:
                                processed_data['health_indicators'][indicator['IndicatorName']] = {
                                    'description': indicator.get('IndicatorDescription', ''),
                                    'category': indicator.get('IndicatorCategory', ''),
                                    'data': indicator
                                }
                                
            logger.info(f"✅ Processed {len(processed_data['health_indicators'])} WHO indicators")
            
        except Exception as e:
            logger.error(f"❌ Error processing WHO data: {e}")
            
        return processed_data
        
    async def fetch_enhanced_pubmed_data(self) -> Dict[str, Any]:
        """Enhanced PubMed data fetching with more comprehensive search"""
        logger.info("📚 Fetching enhanced data from PubMed...")
        
        try:
            async with aiohttp.ClientSession() as session:
                # Enhanced disease categories for comprehensive coverage
                enhanced_categories = [
                    "cardiovascular diseases", "diabetes mellitus", "hypertension", 
                    "cancer", "respiratory diseases", "infectious diseases", 
                    "neurological disorders", "gastrointestinal diseases", 
                    "endocrine disorders", "autoimmune diseases", "mental health",
                    "pediatric diseases", "geriatric conditions", "emerging diseases",
                    "rare diseases", "genetic disorders", "metabolic disorders"
                ]
                
                pubmed_data = {}
                
                for category in enhanced_categories:
                    try:
                        # Search for recent publications
                        search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
                        params = {
                            'db': 'pubmed',
                            'term': f"{category}[Title/Abstract] AND (2023[Date - Publication] : 3000[Date - Publication])",
                            'retmax': 50,
                            'retmode': 'json',
                            'api_key': self.api_keys['pubmed']
                        }
                        
                        async with session.get(search_url, params=params, timeout=30) as response:
                            if response.status == 200:
                                search_data = await response.json()
                                pubmed_data[category] = search_data
                                logger.info(f"✅ Fetched PubMed data for {category}")
                            else:
                                logger.warning(f"⚠️ PubMed search failed for {category}: {response.status}")
                                
                    except Exception as e:
                        logger.warning(f"⚠️ Error fetching PubMed data for {category}: {e}")
                        
                return pubmed_data
                
        except Exception as e:
            logger.error(f"❌ Error fetching enhanced PubMed data: {e}")
            return {}
            
    async def fetch_enhanced_fda_data(self) -> Dict[str, Any]:
        """Enhanced FDA data fetching with comprehensive drug information"""
        logger.info("💊 Fetching enhanced data from FDA...")
        
        try:
            async with aiohttp.ClientSession() as session:
                # Enhanced FDA endpoints for comprehensive drug data
                fda_endpoints = [
                    'https://api.fda.gov/drug/label.json?limit=100',
                    'https://api.fda.gov/drug/event.json?limit=100',
                    'https://api.fda.gov/drug/ndc.json?limit=100',
                    'https://api.fda.gov/drug/enforcement.json?limit=100'
                ]
                
                fda_data = {}
                
                for endpoint in fda_endpoints:
                    try:
                        async with session.get(endpoint, timeout=30) as response:
                            if response.status == 200:
                                data = await response.json()
                                endpoint_name = endpoint.split('/')[-1].split('?')[0]
                                fda_data[endpoint_name] = data
                                logger.info(f"✅ Fetched FDA data from {endpoint_name}")
                            else:
                                logger.warning(f"⚠️ FDA API {endpoint} returned {response.status}")
                                
                    except Exception as e:
                        logger.warning(f"⚠️ Error fetching FDA data from {endpoint}: {e}")
                        
                return fda_data
                
        except Exception as e:
            logger.error(f"❌ Error fetching enhanced FDA data: {e}")
            return {}
            
    async def perform_daily_update(self):
        """Perform daily data update from all sources"""
        logger.info("🔄 Starting daily data update...")
        
        try:
            update_start_time = datetime.now()
            
            # Fetch data from all sources
            update_results = {}
            
            # Fetch PubMed data
            if self.data_sources['pubmed']['enabled']:
                logger.info("📚 Updating PubMed data...")
                pubmed_data = await self.fetch_enhanced_pubmed_data()
                update_results['pubmed'] = {
                    'status': 'success' if pubmed_data else 'failed',
                    'data_count': len(pubmed_data),
                    'timestamp': datetime.now().isoformat()
                }
                
            # Fetch FDA data
            if self.data_sources['fda']['enabled']:
                logger.info("💊 Updating FDA data...")
                fda_data = await self.fetch_enhanced_fda_data()
                update_results['fda'] = {
                    'status': 'success' if fda_data else 'failed',
                    'data_count': len(fda_data),
                    'timestamp': datetime.now().isoformat()
                }
                
            # Fetch WHO data (weekly)
            if self.data_sources['who']['enabled'] and self.update_count % 7 == 0:
                logger.info("🌍 Updating WHO data...")
                who_data = await self.fetch_who_data()
                update_results['who'] = {
                    'status': 'success' if who_data else 'failed',
                    'data_count': len(who_data),
                    'timestamp': datetime.now().isoformat()
                }
                
            # Update AI system with new data
            await self.update_ai_with_new_data(update_results)
            
            # Save update results
            await self.save_update_results(update_results, update_start_time)
            
            # Update scheduler state
            self.last_update = datetime.now().isoformat()
            self.update_count += 1
            await self.save_scheduler_state()
            
            logger.info(f"✅ Daily update completed! Update #{self.update_count}")
            
        except Exception as e:
            logger.error(f"❌ Daily update failed: {e}")
            
    async def update_ai_with_new_data(self, update_results: Dict[str, Any]):
        """Update AI system with new data from APIs"""
        logger.info("🤖 Updating AI system with new data...")
        
        try:
            # Trigger AI training with new data
            await self.advanced_ai.fetch_and_train_on_medical_data()
            
            # Save updated models
            await self.advanced_ai.save_model()
            await self.advanced_ai.save_progress()
            
            logger.info(f"✅ AI system updated! New accuracy: {self.advanced_ai.accuracy:.2%}")
            
        except Exception as e:
            logger.error(f"❌ Error updating AI system: {e}")
            
    async def save_update_results(self, results: Dict[str, Any], start_time: datetime):
        """Save update results to file"""
        try:
            update_record = {
                'update_id': self.update_count + 1,
                'start_time': start_time.isoformat(),
                'end_time': datetime.now().isoformat(),
                'duration_seconds': (datetime.now() - start_time).total_seconds(),
                'results': results,
                'ai_accuracy_before': getattr(self.advanced_ai, 'previous_accuracy', 0.0),
                'ai_accuracy_after': self.advanced_ai.accuracy,
                'diseases_count': len(self.advanced_ai.diseases_database)
            }
            
            # Save to daily update log
            update_file = f"data/auto_updates/update_{datetime.now().strftime('%Y%m%d')}.json"
            with open(update_file, "w") as f:
                json.dump(update_record, f, indent=2)
                
            logger.info(f"📝 Update results saved to {update_file}")
            
        except Exception as e:
            logger.error(f"❌ Error saving update results: {e}")
            
    async def start_scheduler(self):
        """Start the automatic training scheduler"""
        logger.info("🚀 Starting Auto Training Scheduler...")
        
        # Initialize the system
        await self.initialize()
        
        # Schedule daily updates at midnight
        schedule.every().day.at("00:00").do(self.perform_daily_update)
        
        # Also schedule an immediate update if this is the first run
        if not self.last_update:
            logger.info("🔄 Performing initial update...")
            await self.perform_daily_update()
            
        self.is_running = True
        
        # Run the scheduler
        while self.is_running:
            schedule.run_pending()
            await asyncio.sleep(60)  # Check every minute
            
    async def stop_scheduler(self):
        """Stop the automatic training scheduler"""
        logger.info("🛑 Stopping Auto Training Scheduler...")
        self.is_running = False
        
    def get_scheduler_status(self) -> Dict[str, Any]:
        """Get current scheduler status"""
        return {
            'is_running': self.is_running,
            'last_update': self.last_update,
            'update_count': self.update_count,
            'next_update': schedule.next_run().isoformat() if schedule.jobs else None,
            'ai_accuracy': self.advanced_ai.accuracy,
            'diseases_count': len(self.advanced_ai.diseases_database),
            'data_sources': {
                source: {
                    'enabled': config['enabled'],
                    'update_frequency': config['update_frequency']
                }
                for source, config in self.data_sources.items()
            }
        }

# Global scheduler instance
auto_scheduler = AutoTrainingScheduler()

async def main():
    """Main function to run the auto-training scheduler"""
    try:
        await auto_scheduler.start_scheduler()
    except KeyboardInterrupt:
        logger.info("🛑 Received interrupt signal, stopping scheduler...")
        await auto_scheduler.stop_scheduler()
    except Exception as e:
        logger.error(f"❌ Scheduler error: {e}")
        await auto_scheduler.stop_scheduler()

if __name__ == "__main__":
    asyncio.run(main()) 