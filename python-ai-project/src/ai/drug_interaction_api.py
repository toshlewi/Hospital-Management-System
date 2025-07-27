#!/usr/bin/env python3
"""
Enhanced Drug Interaction API System
Integrates multiple APIs for comprehensive drug interaction checking
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import time
import re

logger = logging.getLogger(__name__)

class DrugInteractionAPI:
    """Comprehensive drug interaction checking system"""
    
    def __init__(self):
        # API endpoints
        self.fda_api_base = "https://api.fda.gov/drug/label.json"
        self.rx_norm_api = "https://rxnav.nlm.nih.gov/REST"
        self.openfda_api = "https://api.fda.gov/drug"
        
        # Cache for API responses
        self._interaction_cache = {}
        self._drug_normalization_cache = {}
        self._cache_ttl = 3600  # 1 hour
        
        # Known drug interactions database (fallback)
        self.known_interactions = {
            ("warfarin", "aspirin"): {
                "severity": "severe",
                "description": "Increased bleeding risk",
                "mechanism": "Both drugs affect platelet function",
                "recommendation": "Monitor INR closely, consider alternative",
                "evidence_level": "strong"
            },
            ("metformin", "insulin"): {
                "severity": "moderate",
                "description": "Increased hypoglycemia risk",
                "mechanism": "Additive glucose-lowering effects",
                "recommendation": "Monitor blood glucose frequently",
                "evidence_level": "moderate"
            },
            ("lisinopril", "spironolactone"): {
                "severity": "moderate",
                "description": "Increased hyperkalemia risk",
                "mechanism": "Both increase potassium levels",
                "recommendation": "Monitor potassium levels",
                "evidence_level": "strong"
            },
            ("simvastatin", "amiodarone"): {
                "severity": "severe",
                "description": "Increased myopathy risk",
                "mechanism": "CYP3A4 inhibition",
                "recommendation": "Avoid combination or reduce simvastatin dose",
                "evidence_level": "strong"
            },
            ("digoxin", "amiodarone"): {
                "severity": "moderate",
                "description": "Increased digoxin levels",
                "mechanism": "P-glycoprotein inhibition",
                "recommendation": "Monitor digoxin levels, reduce dose",
                "evidence_level": "moderate"
            },
            ("phenytoin", "warfarin"): {
                "severity": "moderate",
                "description": "Decreased warfarin effect",
                "mechanism": "CYP2C9 induction",
                "recommendation": "Monitor INR, adjust warfarin dose",
                "evidence_level": "moderate"
            },
            ("ciprofloxacin", "warfarin"): {
                "severity": "moderate",
                "description": "Increased warfarin effect",
                "mechanism": "CYP2C9 inhibition",
                "recommendation": "Monitor INR closely",
                "evidence_level": "moderate"
            },
            ("amiodarone", "warfarin"): {
                "severity": "severe",
                "description": "Increased warfarin effect",
                "mechanism": "CYP2C9 inhibition",
                "recommendation": "Reduce warfarin dose by 30-50%",
                "evidence_level": "strong"
            },
            ("metronidazole", "warfarin"): {
                "severity": "moderate",
                "description": "Increased warfarin effect",
                "mechanism": "CYP2C9 inhibition",
                "recommendation": "Monitor INR closely",
                "evidence_level": "moderate"
            },
            ("fluconazole", "warfarin"): {
                "severity": "moderate",
                "description": "Increased warfarin effect",
                "mechanism": "CYP2C9 inhibition",
                "recommendation": "Monitor INR closely",
                "evidence_level": "moderate"
            }
        }
    
    async def check_drug_interaction(self, drug1: str, drug2: str) -> Optional[Dict[str, Any]]:
        """Check for interaction between two drugs using multiple APIs"""
        try:
            # Normalize drug names
            norm_drug1 = await self._normalize_drug_name(drug1)
            norm_drug2 = await self._normalize_drug_name(drug2)
            
            # Check cache first
            cache_key = tuple(sorted([norm_drug1, norm_drug2]))
            if cache_key in self._interaction_cache:
                cached_data = self._interaction_cache[cache_key]
                if time.time() - cached_data.get('timestamp', 0) < self._cache_ttl:
                    return cached_data.get('interaction')
            
            # Try FDA API first
            interaction = await self._check_fda_interaction(norm_drug1, norm_drug2)
            if interaction:
                self._interaction_cache[cache_key] = {
                    'interaction': interaction,
                    'timestamp': time.time()
                }
                return interaction
            
            # Try OpenFDA API
            interaction = await self._check_openfda_interaction(norm_drug1, norm_drug2)
            if interaction:
                self._interaction_cache[cache_key] = {
                    'interaction': interaction,
                    'timestamp': time.time()
                }
                return interaction
            
            # Fallback to known interactions
            interaction = self._check_known_interaction(norm_drug1, norm_drug2)
            if interaction:
                self._interaction_cache[cache_key] = {
                    'interaction': interaction,
                    'timestamp': time.time()
                }
                return interaction
            
            return None
            
        except Exception as e:
            logger.error(f"Error checking drug interaction: {e}")
            return None
    
    async def analyze_medication_list(self, medications: List[str]) -> Dict[str, Any]:
        """Analyze a list of medications for potential interactions"""
        try:
            interactions = []
            warnings = []
            recommendations = []
            
            # Check all pairwise combinations
            for i, med1 in enumerate(medications):
                for med2 in medications[i+1:]:
                    interaction = await self.check_drug_interaction(med1, med2)
                    if interaction:
                        interactions.append(interaction)
                        
                        # Add warnings based on severity
                        if interaction['severity'] == 'severe':
                            warnings.append(f"SEVERE: {med1} + {med2} - {interaction['description']}")
                        elif interaction['severity'] == 'moderate':
                            warnings.append(f"MODERATE: {med1} + {med2} - {interaction['description']}")
                        
                        # Add recommendations
                        if interaction.get('recommendation'):
                            recommendations.append(f"{med1} + {med2}: {interaction['recommendation']}")
            
            # Determine overall risk level
            risk_level = "high" if any(i["severity"] == "severe" for i in interactions) else \
                        "moderate" if any(i["severity"] == "moderate" for i in interactions) else "low"
            
            return {
                "medications": medications,
                "interactions": interactions,
                "warnings": warnings,
                "recommendations": recommendations,
                "risk_level": risk_level,
                "total_interactions": len(interactions),
                "analysis_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing medication list: {e}")
            return {"error": str(e)}
    
    async def _normalize_drug_name(self, drug_name: str) -> str:
        """Normalize drug name using RxNorm API"""
        try:
            # Check cache first
            if drug_name.lower() in self._drug_normalization_cache:
                return self._drug_normalization_cache[drug_name.lower()]
            
            # Try RxNorm API
            async with aiohttp.ClientSession() as session:
                url = f"{self.rx_norm_api}/drugs.json"
                params = {"name": drug_name}
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('drugGroup', {}).get('conceptGroup'):
                            # Get the first normalized name
                            concepts = data['drugGroup']['conceptGroup'][0].get('concept', [])
                            if concepts:
                                normalized_name = concepts[0].get('name', drug_name)
                                self._drug_normalization_cache[drug_name.lower()] = normalized_name
                                return normalized_name
            
            # Fallback: return original name
            return drug_name
            
        except Exception as e:
            logger.warning(f"Error normalizing drug name {drug_name}: {e}")
            return drug_name
    
    async def _check_fda_interaction(self, drug1: str, drug2: str) -> Optional[Dict[str, Any]]:
        """Check drug interaction using FDA API"""
        try:
            async with aiohttp.ClientSession() as session:
                # Search for drug1
                url1 = f"{self.fda_api_base}"
                params1 = {"search": f"openfda.generic_name:\"{drug1}\"", "limit": 1}
                
                async with session.get(url1, params=params1) as response1:
                    if response1.status == 200:
                        data1 = await response1.json()
                        if data1.get('results'):
                            drug1_info = data1['results'][0]
                            interactions = drug1_info.get('drug_interactions', [])
                            
                            # Check if drug2 is mentioned in interactions
                            for interaction in interactions:
                                if drug2.lower() in interaction.lower():
                                    return {
                                        "drug1": drug1,
                                        "drug2": drug2,
                                        "severity": "moderate",  # FDA doesn't provide severity
                                        "description": interaction,
                                        "source": "FDA",
                                        "recommendation": "Consult healthcare provider"
                                    }
            
            return None
            
        except Exception as e:
            logger.warning(f"Error checking FDA interaction: {e}")
            return None
    
    async def _check_openfda_interaction(self, drug1: str, drug2: str) -> Optional[Dict[str, Any]]:
        """Check drug interaction using OpenFDA API"""
        try:
            async with aiohttp.ClientSession() as session:
                # Search for adverse events involving both drugs
                url = f"{self.openfda_api}/event.json"
                params = {
                    "search": f"patient.drug.medicinalproduct:\"{drug1}\" AND patient.drug.medicinalproduct:\"{drug2}\"",
                    "limit": 1
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('results'):
                            return {
                                "drug1": drug1,
                                "drug2": drug2,
                                "severity": "moderate",
                                "description": f"Adverse events reported with {drug1} and {drug2}",
                                "source": "OpenFDA",
                                "recommendation": "Monitor for adverse effects"
                            }
            
            return None
            
        except Exception as e:
            logger.warning(f"Error checking OpenFDA interaction: {e}")
            return None
    
    def _check_known_interaction(self, drug1: str, drug2: str) -> Optional[Dict[str, Any]]:
        """Check against known interactions database"""
        # Check both combinations
        for (d1, d2), interaction in self.known_interactions.items():
            if (drug1.lower() == d1.lower() and drug2.lower() == d2.lower()) or \
               (drug1.lower() == d2.lower() and drug2.lower() == d1.lower()):
                return {
                    "drug1": drug1,
                    "drug2": drug2,
                    "source": "Known Database",
                    **interaction
                }
        
        return None
    
    def get_drug_safety_info(self, drug_name: str) -> Dict[str, Any]:
        """Get safety information for a single drug"""
        try:
            # This would integrate with FDA API for comprehensive safety data
            safety_info = {
                "drug_name": drug_name,
                "common_side_effects": [],
                "serious_side_effects": [],
                "contraindications": [],
                "precautions": [],
                "pregnancy_category": "Unknown",
                "lactation_safety": "Unknown"
            }
            
            return safety_info
            
        except Exception as e:
            logger.error(f"Error getting drug safety info: {e}")
            return {"error": str(e)}

# Example usage
async def main():
    """Example usage of the drug interaction API"""
    api = DrugInteractionAPI()
    
    # Test drug interaction checking
    medications = ["warfarin", "aspirin", "metformin"]
    
    print("Analyzing medication list...")
    result = await api.analyze_medication_list(medications)
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main()) 