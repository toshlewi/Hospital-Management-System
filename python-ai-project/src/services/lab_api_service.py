"""
Enhanced Lab Tests API Service
Integrates multiple external APIs for comprehensive lab test analysis
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

class LabAPIService:
    """Enhanced lab tests service using multiple external APIs"""
    
    def __init__(self):
        self.api_keys = api_keys_config.get_section_keys('lab')
        self.session = None
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_loinc_codes(self, test_name: str) -> Dict[str, Any]:
        """Get LOINC codes for lab tests"""
        if not self.api_keys.get('loinc_api_key'):
            return {"error": "LOINC API key not available"}
        
        try:
            # This would integrate with LOINC API
            url = "https://fhir.loinc.org/CodeSystem/$lookup"
            params = {
                'system': 'http://loinc.org',
                'code': test_name,
                'api_key': self.api_keys['loinc_api_key']
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "source": "LOINC",
                        "test_name": test_name,
                        "loinc_code": data.get('parameter', [{}])[0].get('valueCodeableConcept', {}).get('coding', [{}])[0].get('code'),
                        "display_name": data.get('parameter', [{}])[0].get('valueCodeableConcept', {}).get('coding', [{}])[0].get('display'),
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {"error": f"LOINC API error: {response.status}"}
        except Exception as e:
            logger.error(f"LOINC API error: {e}")
            return {"error": str(e)}
    
    async def get_lab_reference_ranges(self, test_name: str) -> Dict[str, Any]:
        """Get reference ranges for lab tests"""
        if not self.api_keys.get('lab_guide_api_key'):
            return {"error": "Lab Guide API key not available"}
        
        try:
            # This would integrate with a lab reference API
            url = "https://api.labguide.com/reference-ranges"
            params = {
                'test': test_name,
                'api_key': self.api_keys['lab_guide_api_key']
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "source": "Lab Guide",
                        "test_name": test_name,
                        "reference_ranges": data.get('ranges', []),
                        "units": data.get('units', ''),
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {"error": f"Lab Guide API error: {response.status}"}
        except Exception as e:
            logger.error(f"Lab Guide API error: {e}")
            return {"error": str(e)}
    
    async def analyze_lab_results(self, lab_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze lab results using multiple APIs"""
        results = {
            "lab_results": lab_results,
            "analysis_timestamp": datetime.now().isoformat(),
            "sources": {},
            "abnormal_values": [],
            "recommendations": []
        }
        
        tasks = []
        
        for result in lab_results:
            test_name = result.get('test_name', '')
            if test_name:
                if self.api_keys.get('loinc_api_key'):
                    tasks.append(self.get_loinc_codes(test_name))
                if self.api_keys.get('lab_guide_api_key'):
                    tasks.append(self.get_lab_reference_ranges(test_name))
        
        if tasks:
            api_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in api_results:
                if isinstance(result, dict) and 'source' in result:
                    results["sources"][result["source"]] = result
                elif isinstance(result, Exception):
                    logger.error(f"Lab API call failed: {result}")
        
        # Analyze for abnormal values
        for result in lab_results:
            test_name = result.get('test_name', '')
            value = result.get('value')
            unit = result.get('unit', '')
            
            # Check if value is outside reference ranges
            if test_name in results["sources"].get("Lab Guide", {}).get("reference_ranges", []):
                ref_ranges = results["sources"]["Lab Guide"]["reference_ranges"]
                for ref_range in ref_ranges:
                    if ref_range.get("test") == test_name:
                        min_val = ref_range.get("min")
                        max_val = ref_range.get("max")
                        
                        if min_val and max_val and value:
                            try:
                                num_value = float(value)
                                if num_value < float(min_val) or num_value > float(max_val):
                                    results["abnormal_values"].append({
                                        "test": test_name,
                                        "value": value,
                                        "unit": unit,
                                        "reference_range": f"{min_val} - {max_val}",
                                        "status": "abnormal"
                                    })
                            except ValueError:
                                pass
        
        return results 