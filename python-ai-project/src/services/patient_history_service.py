"""
Patient History Service
Comprehensive patient history integration for AI analysis
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd

logger = logging.getLogger(__name__)

class PatientHistoryService:
    """Service for comprehensive patient history analysis"""
    
    def __init__(self):
        self.history_cache = {}
        self.cache_ttl = 1800  # 30 minutes
    
    async def get_comprehensive_history(self, patient_id: int, db_service) -> Dict[str, Any]:
        """Get comprehensive patient history for AI analysis"""
        try:
            # Get all patient data
            patient_data = await db_service.getPatientById(patient_id)
            prescriptions = await db_service.getAllPrescriptions(patient_id)
            medical_notes = await db_service.getMedicalNotes(patient_id)
            lab_results = await db_service.getTestOrders(patient_id)
            imaging_results = await db_service.getImaging(patient_id)
            bills = await db_service.getPatientBillingStatus(patient_id)
            
            # Compile comprehensive history
            history = {
                "patient_id": patient_id,
                "patient_info": patient_data,
                "medical_history": {
                    "prescriptions": prescriptions,
                    "medical_notes": medical_notes,
                    "lab_results": lab_results,
                    "imaging_results": imaging_results,
                    "billing_history": bills
                },
                "analysis_metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "data_sources": ["prescriptions", "medical_notes", "lab_results", "imaging_results", "billing"],
                    "total_records": len(prescriptions) + len(medical_notes) + len(lab_results) + len(imaging_results)
                }
            }
            
            # Add temporal analysis
            history["temporal_analysis"] = await self._analyze_temporal_patterns(history)
            
            # Add risk factors
            history["risk_factors"] = await self._identify_risk_factors(history)
            
            # Add medication history
            history["medication_history"] = await self._analyze_medication_history(prescriptions)
            
            # Add lab trends
            history["lab_trends"] = await self._analyze_lab_trends(lab_results)
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting comprehensive history for patient {patient_id}: {e}")
            return {"error": str(e)}
    
    async def _analyze_temporal_patterns(self, history: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze temporal patterns in patient history"""
        try:
            patterns = {
                "visit_frequency": {},
                "medication_changes": {},
                "lab_trends": {},
                "symptom_patterns": {}
            }
            
            # Analyze prescription patterns
            prescriptions = history["medical_history"]["prescriptions"]
            if prescriptions:
                prescription_dates = [p.get("prescribed_date") for p in prescriptions if p.get("prescribed_date")]
                patterns["medication_changes"] = {
                    "total_prescriptions": len(prescriptions),
                    "first_prescription": min(prescription_dates) if prescription_dates else None,
                    "last_prescription": max(prescription_dates) if prescription_dates else None,
                    "active_prescriptions": len([p for p in prescriptions if p.get("status") == "active"]),
                    "completed_prescriptions": len([p for p in prescriptions if p.get("status") == "completed"])
                }
            
            # Analyze medical notes patterns
            medical_notes = history["medical_history"]["medical_notes"]
            if medical_notes:
                note_dates = [n.get("created_at") for n in medical_notes if n.get("created_at")]
                patterns["visit_frequency"] = {
                    "total_notes": len(medical_notes),
                    "first_note": min(note_dates) if note_dates else None,
                    "last_note": max(note_dates) if note_dates else None,
                    "average_notes_per_month": len(medical_notes) / max(1, (datetime.now() - datetime.fromisoformat(min(note_dates).replace('Z', '+00:00'))).days / 30)
                }
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing temporal patterns: {e}")
            return {"error": str(e)}
    
    async def _identify_risk_factors(self, history: Dict[str, Any]) -> Dict[str, Any]:
        """Identify risk factors from patient history"""
        try:
            risk_factors = {
                "medication_risks": [],
                "lab_risks": [],
                "chronic_conditions": [],
                "allergies": [],
                "family_history": []
            }
            
            # Analyze medication risks
            prescriptions = history["medical_history"]["prescriptions"]
            for prescription in prescriptions:
                medication = prescription.get("medications") or prescription.get("medication_name", "")
                if any(risk_med in medication.lower() for risk_med in ["warfarin", "insulin", "digoxin", "lithium"]):
                    risk_factors["medication_risks"].append({
                        "medication": medication,
                        "risk_level": "high",
                        "reason": "Narrow therapeutic index medication"
                    })
            
            # Analyze lab risks
            lab_results = history["medical_history"]["lab_results"]
            for result in lab_results:
                test_name = result.get("test_name", "").lower()
                value = result.get("value")
                
                if test_name and value:
                    try:
                        num_value = float(value)
                        if "glucose" in test_name and num_value > 126:
                            risk_factors["lab_risks"].append({
                                "test": test_name,
                                "value": value,
                                "risk_level": "high",
                                "condition": "Diabetes"
                            })
                        elif "creatinine" in test_name and num_value > 1.2:
                            risk_factors["lab_risks"].append({
                                "test": test_name,
                                "value": value,
                                "risk_level": "medium",
                                "condition": "Kidney function"
                            })
                    except ValueError:
                        pass
            
            return risk_factors
            
        except Exception as e:
            logger.error(f"Error identifying risk factors: {e}")
            return {"error": str(e)}
    
    async def _analyze_medication_history(self, prescriptions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze medication history patterns"""
        try:
            analysis = {
                "total_medications": len(prescriptions),
                "medication_categories": {},
                "compliance_analysis": {},
                "interaction_risks": []
            }
            
            # Categorize medications
            for prescription in prescriptions:
                medication = prescription.get("medications") or prescription.get("medication_name", "")
                if "antibiotic" in medication.lower() or "amoxicillin" in medication.lower():
                    analysis["medication_categories"]["antibiotics"] = analysis["medication_categories"].get("antibiotics", 0) + 1
                elif "pain" in medication.lower() or "paracetamol" in medication.lower() or "ibuprofen" in medication.lower():
                    analysis["medication_categories"]["pain_medications"] = analysis["medication_categories"].get("pain_medications", 0) + 1
                elif "diabetes" in medication.lower() or "metformin" in medication.lower():
                    analysis["medication_categories"]["diabetes_medications"] = analysis["medication_categories"].get("diabetes_medications", 0) + 1
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing medication history: {e}")
            return {"error": str(e)}
    
    async def _analyze_lab_trends(self, lab_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze lab result trends"""
        try:
            trends = {
                "abnormal_results": [],
                "trending_tests": {},
                "critical_values": []
            }
            
            # Group by test type
            test_groups = {}
            for result in lab_results:
                test_name = result.get("test_name", "")
                if test_name not in test_groups:
                    test_groups[test_name] = []
                test_groups[test_name].append(result)
            
            # Analyze trends for each test
            for test_name, results in test_groups.items():
                if len(results) > 1:
                    # Sort by date
                    sorted_results = sorted(results, key=lambda x: x.get("created_at", ""))
                    trends["trending_tests"][test_name] = {
                        "total_tests": len(results),
                        "first_test": sorted_results[0].get("created_at"),
                        "last_test": sorted_results[-1].get("created_at"),
                        "values": [r.get("value") for r in sorted_results]
                    }
            
            return trends
            
        except Exception as e:
            logger.error(f"Error analyzing lab trends: {e}")
            return {"error": str(e)}
    
    async def get_ai_context(self, patient_id: int, db_service) -> Dict[str, Any]:
        """Get patient context optimized for AI analysis"""
        try:
            history = await self.get_comprehensive_history(patient_id, db_service)
            
            # Extract key information for AI
            context = {
                "patient_id": patient_id,
                "demographics": {
                    "age": history["patient_info"].get("age"),
                    "gender": history["patient_info"].get("gender"),
                    "medical_history": history["patient_info"].get("medical_history", "")
                },
                "current_medications": [
                    p.get("medications") or p.get("medication_name", "")
                    for p in history["medical_history"]["prescriptions"]
                    if p.get("status") == "active"
                ],
                "recent_lab_results": history["medical_history"]["lab_results"][-5:] if history["medical_history"]["lab_results"] else [],
                "recent_notes": history["medical_history"]["medical_notes"][-3:] if history["medical_history"]["medical_notes"] else [],
                "risk_factors": history["risk_factors"],
                "temporal_patterns": history["temporal_analysis"]
            }
            
            return context
            
        except Exception as e:
            logger.error(f"Error getting AI context for patient {patient_id}: {e}")
            return {"error": str(e)} 