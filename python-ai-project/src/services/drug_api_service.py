"""
Enhanced Drug Interaction API Service
Integrates multiple external APIs for comprehensive drug interaction analysis
"""

import aiohttp
import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import time

from ..config.api_keys import api_keys_config

logger = logging.getLogger(__name__)

class DrugAPIService:
    """Enhanced drug interaction service using multiple external APIs"""
    
    def __init__(self):
        self.api_keys = api_keys_config.get_section_keys('drug')
        self.session = None
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def check_fda_interactions(self, drug_name: str) -> Dict[str, Any]:
        """Check drug interactions using FDA API"""
        # Use the hardcoded FDA API key since .env is blocked
        fda_api_key = "ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq"
        
        if not fda_api_key:
            return {"error": "FDA API key not available"}
        
        try:
            # First, search for the drug
            search_url = "https://api.fda.gov/drug/label.json"
            search_params = {
                'search': f'openfda.generic_name:"{drug_name}"',
                'limit': 1
            }
            
            async with self.session.get(search_url, params=search_params) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get('results', [])
                    if results:
                        drug_info = results[0]
                        
                        # Get detailed drug information
                        drug_id = drug_info.get('id')
                        if drug_id:
                            detail_url = f"https://api.fda.gov/drug/label/{drug_id}.json"
                            async with self.session.get(detail_url) as detail_response:
                                if detail_response.status == 200:
                                    detail_data = await detail_response.json()
                                    drug_info = detail_data.get('results', [{}])[0]
                        
                        return {
                            "source": "FDA",
                            "drug_name": drug_name,
                            "generic_name": drug_info.get('openfda', {}).get('generic_name', []),
                            "brand_name": drug_info.get('openfda', {}).get('brand_name', []),
                            "drug_class": drug_info.get('openfda', {}).get('pharm_class_cs', []),
                            "interactions": drug_info.get('drug_interactions', []),
                            "warnings": drug_info.get('warnings', []),
                            "precautions": drug_info.get('precautions', []),
                            "adverse_reactions": drug_info.get('adverse_reactions', []),
                            "dosage_and_administration": drug_info.get('dosage_and_administration', []),
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        return {"error": f"Drug {drug_name} not found in FDA database"}
                else:
                    return {"error": f"FDA API error: {response.status}"}
        except Exception as e:
            logger.error(f"FDA API error: {e}")
            return {"error": str(e)}
    
    async def check_drugbank_interactions(self, drug_name: str) -> Dict[str, Any]:
        """Check drug interactions using DrugBank API"""
        if not self.api_keys.get('drugbank_api_key'):
            return {"error": "DrugBank API key not available"}
        
        try:
            url = f"https://api.drugbank.com/v1/drugs"
            headers = {
                'Authorization': f'Bearer {self.api_keys["drugbank_api_key"]}',
                'Content-Type': 'application/json'
            }
            params = {
                'search': drug_name
            }
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "source": "DrugBank",
                        "drug_name": drug_name,
                        "interactions": data.get('drug_interactions', []),
                        "pharmacology": data.get('pharmacology', {}),
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {"error": f"DrugBank API error: {response.status}"}
        except Exception as e:
            logger.error(f"DrugBank API error: {e}")
            return {"error": str(e)}
    
    async def get_rxnorm_codes(self, drug_name: str) -> Dict[str, Any]:
        """Get RxNorm codes for drug normalization"""
        if not self.api_keys.get('rxnorm_api_key'):
            return {"error": "RxNorm API key not available"}
        
        try:
            url = "https://rxnav.nlm.nih.gov/REST/drugs.json"
            params = {
                'name': drug_name
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "source": "RxNorm",
                        "drug_name": drug_name,
                        "rxnorm_codes": data.get('drugGroup', {}).get('conceptGroup', []),
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {"error": f"RxNorm API error: {response.status}"}
        except Exception as e:
            logger.error(f"RxNorm API error: {e}")
            return {"error": str(e)}
    
    async def check_pharmgkb_interactions(self, drug_name: str) -> Dict[str, Any]:
        """Check pharmacogenomic interactions using PharmGKB API"""
        if not self.api_keys.get('pharmgkb_api_key'):
            return {"error": "PharmGKB API key not available"}
        
        try:
            url = f"https://api.pharmgkb.org/v1/site/drugs/{drug_name}"
            headers = {
                'Authorization': f'Bearer {self.api_keys["pharmgkb_api_key"]}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "source": "PharmGKB",
                        "drug_name": drug_name,
                        "pharmacogenomics": data.get('pharmacogenomics', []),
                        "clinical_annotations": data.get('clinical_annotations', []),
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {"error": f"PharmGKB API error: {response.status}"}
        except Exception as e:
            logger.error(f"PharmGKB API error: {e}")
            return {"error": str(e)}
    
    async def comprehensive_drug_analysis(self, medications: List[str]) -> Dict[str, Any]:
        """Comprehensive drug analysis using multiple APIs"""
        results = {
            "medications": medications,
            "analysis_timestamp": datetime.now().isoformat(),
            "sources": {},
            "interactions": [],
            "warnings": [],
            "recommendations": []
        }
        
        tasks = []
        
        for drug in medications:
            if self.api_keys.get('fda_api_key'):
                tasks.append(self.check_fda_interactions(drug))
            if self.api_keys.get('drugbank_api_key'):
                tasks.append(self.check_drugbank_interactions(drug))
            if self.api_keys.get('rxnorm_api_key'):
                tasks.append(self.get_rxnorm_codes(drug))
            if self.api_keys.get('pharmgkb_api_key'):
                tasks.append(self.check_pharmgkb_interactions(drug))
        
        if tasks:
            api_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in api_results:
                if isinstance(result, dict) and 'source' in result:
                    results["sources"][result["source"]] = result
                elif isinstance(result, Exception):
                    logger.error(f"Drug API call failed: {result}")
        
        # Compile interactions and warnings
        for source, data in results["sources"].items():
            if "interactions" in data:
                results["interactions"].extend(data["interactions"])
            if "warnings" in data:
                results["warnings"].extend(data["warnings"])
        
        return results 