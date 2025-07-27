"""
API Keys Configuration for AI Sections
Each AI section can have its own dedicated API keys for enhanced functionality
"""

import os
from typing import Dict, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class APIKeysConfig:
    """Configuration class for managing API keys for different AI sections"""
    
    def __init__(self):
        # Diagnosis APIs
        self.diagnosis_apis = {
            'pubmed_api_key': os.getenv('PUBMED_API_KEY'),
            'who_api_key': os.getenv('WHO_API_KEY'),
            'icd_api_key': os.getenv('ICD_API_KEY'),  # International Classification of Diseases
            'snomed_api_key': os.getenv('SNOMED_API_KEY'),  # SNOMED CT
            'umls_api_key': os.getenv('UMLS_API_KEY'),  # Unified Medical Language System
        }
        
        # Lab Tests APIs
        self.lab_apis = {
            'labcorp_api_key': os.getenv('LABCORP_API_KEY'),
            'quest_api_key': os.getenv('QUEST_API_KEY'),
            'loinc_api_key': os.getenv('LOINC_API_KEY'),  # Logical Observation Identifiers Names and Codes
            'lab_guide_api_key': os.getenv('LAB_GUIDE_API_KEY'),
            'clinical_lab_api_key': os.getenv('CLINICAL_LAB_API_KEY'),
        }
        
        # Drug Interaction APIs
        self.drug_apis = {
            'fda_api_key': os.getenv('FDA_API_KEY'),
            'drugbank_api_key': os.getenv('DRUGBANK_API_KEY'),
            'rxnorm_api_key': os.getenv('RXNORM_API_KEY'),
            'openfda_api_key': os.getenv('OPENFDA_API_KEY'),
            'pharmgkb_api_key': os.getenv('PHARMGKB_API_KEY'),  # Pharmacogenomics Knowledge Base
        }
        
        # Treatment APIs
        self.treatment_apis = {
            'uptodate_api_key': os.getenv('UPTODATE_API_KEY'),
            'clinical_trials_api_key': os.getenv('CLINICAL_TRIALS_API_KEY'),
            'guidelines_api_key': os.getenv('GUIDELINES_API_KEY'),
            'medscape_api_key': os.getenv('MEDSCAPE_API_KEY'),
            'epocrates_api_key': os.getenv('EPOCRATES_API_KEY'),
        }
        
        # Imaging APIs
        self.imaging_apis = {
            'radiology_api_key': os.getenv('RADIOLOGY_API_KEY'),
            'dicom_api_key': os.getenv('DICOM_API_KEY'),
            'imaging_guide_api_key': os.getenv('IMAGING_GUIDE_API_KEY'),
            'ai_imaging_api_key': os.getenv('AI_IMAGING_API_KEY'),
        }
        
        # Symptoms APIs
        self.symptoms_apis = {
            'symptom_checker_api_key': os.getenv('SYMPTOM_CHECKER_API_KEY'),
            'healthline_api_key': os.getenv('HEALTHLINE_API_KEY'),
            'mayo_clinic_api_key': os.getenv('MAYO_CLINIC_API_KEY'),
            'webmd_api_key': os.getenv('WEBMD_API_KEY'),
        }
        
        # General Medical APIs
        self.general_apis = {
            'openai_api_key': os.getenv('OPENAI_API_KEY'),
            'google_health_api_key': os.getenv('GOOGLE_HEALTH_API_KEY'),
            'microsoft_health_api_key': os.getenv('MICROSOFT_HEALTH_API_KEY'),
            'ibm_watson_api_key': os.getenv('IBM_WATSON_API_KEY'),
        }
    
    def get_api_key(self, section: str, api_name: str) -> Optional[str]:
        """Get API key for a specific section and API"""
        section_apis = getattr(self, f'{section}_apis', {})
        return section_apis.get(api_name)
    
    def get_section_keys(self, section: str) -> Dict[str, str]:
        """Get all API keys for a specific section"""
        section_apis = getattr(self, f'{section}_apis', {})
        return {k: v for k, v in section_apis.items() if v is not None}
    
    def has_any_key(self, section: str) -> bool:
        """Check if any API key is available for a section"""
        section_keys = self.get_section_keys(section)
        return len(section_keys) > 0
    
    def get_available_sections(self) -> Dict[str, bool]:
        """Get all sections and whether they have API keys available"""
        sections = ['diagnosis', 'lab', 'drug', 'treatment', 'imaging', 'symptoms', 'general']
        return {section: self.has_any_key(section) for section in sections}
    
    def validate_keys(self) -> Dict[str, Dict[str, bool]]:
        """Validate all API keys and return status"""
        validation_results = {}
        
        for section in ['diagnosis', 'lab', 'drug', 'treatment', 'imaging', 'symptoms', 'general']:
            section_keys = self.get_section_keys(section)
            validation_results[section] = {
                api_name: bool(api_key and len(api_key) > 10) 
                for api_name, api_key in section_keys.items()
            }
        
        return validation_results

# Global instance
api_keys_config = APIKeysConfig() 