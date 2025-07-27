# AI API Keys Configuration Template

Copy this content to your `.env` file and fill in your API keys.

## DIAGNOSIS APIs

```bash
# PubMed API (NCBI) - Free tier available
PUBMED_API_KEY=your_pubmed_api_key_here

# WHO ICD API - International Classification of Diseases
WHO_API_KEY=your_who_api_key_here

# ICD API - Alternative ICD service
ICD_API_KEY=your_icd_api_key_here

# SNOMED CT API - Clinical terminology
SNOMED_API_KEY=your_snomed_api_key_here

# UMLS API - Unified Medical Language System
UMLS_API_KEY=your_umls_api_key_here
```

## LAB TESTS APIs

```bash
# LabCorp API - Lab test reference
LABCORP_API_KEY=your_labcorp_api_key_here

# Quest Diagnostics API
QUEST_API_KEY=your_quest_api_key_here

# LOINC API - Logical Observation Identifiers Names and Codes
LOINC_API_KEY=your_loinc_api_key_here

# Lab Guide API - Reference ranges
LAB_GUIDE_API_KEY=your_lab_guide_api_key_here

# Clinical Lab API
CLINICAL_LAB_API_KEY=your_clinical_lab_api_key_here
```

## DRUG INTERACTION APIs

```bash
# FDA API - Drug information and interactions
FDA_API_KEY=your_fda_api_key_here

# DrugBank API - Comprehensive drug database
DRUGBANK_API_KEY=your_drugbank_api_key_here

# RxNorm API - Drug normalization
RXNORM_API_KEY=your_rxnorm_api_key_here

# OpenFDA API - FDA data
OPENFDA_API_KEY=your_openfda_api_key_here

# PharmGKB API - Pharmacogenomics Knowledge Base
PHARMGKB_API_KEY=your_pharmgkb_api_key_here
```

## TREATMENT APIs

```bash
# UpToDate API - Clinical decision support
UPTODATE_API_KEY=your_uptodate_api_key_here

# Clinical Trials API
CLINICAL_TRIALS_API_KEY=your_clinical_trials_api_key_here

# Guidelines API - Clinical practice guidelines
GUIDELINES_API_KEY=your_guidelines_api_key_here

# Medscape API
MEDSCAPE_API_KEY=your_medscape_api_key_here

# Epocrates API
EPOCRATES_API_KEY=your_epocrates_api_key_here
```

## IMAGING APIs

```bash
# Radiology API
RADIOLOGY_API_KEY=your_radiology_api_key_here

# DICOM API - Medical imaging standards
DICOM_API_KEY=your_dicom_api_key_here

# Imaging Guide API
IMAGING_GUIDE_API_KEY=your_imaging_guide_api_key_here

# AI Imaging API
AI_IMAGING_API_KEY=your_ai_imaging_api_key_here
```

## SYMPTOMS APIs

```bash
# Symptom Checker API
SYMPTOM_CHECKER_API_KEY=your_symptom_checker_api_key_here

# Healthline API
HEALTHLINE_API_KEY=your_healthline_api_key_here

# Mayo Clinic API
MAYO_CLINIC_API_KEY=your_mayo_clinic_api_key_here

# WebMD API
WEBMD_API_KEY=your_webmd_api_key_here
```

## GENERAL MEDICAL APIs

```bash
# OpenAI API - For enhanced AI processing
OPENAI_API_KEY=your_openai_api_key_here

# Google Health API
GOOGLE_HEALTH_API_KEY=your_google_health_api_key_here

# Microsoft Health API
MICROSOFT_HEALTH_API_KEY=your_microsoft_health_api_key_here

# IBM Watson Health API
IBM_WATSON_API_KEY=your_ibm_watson_api_key_here
```

## FREE APIs (No key required)

These APIs can be used without API keys (limited rate):
- RxNorm (limited rate)
- OpenFDA (limited rate) 
- PubMed (limited rate)
- LOINC (limited rate)

## Notes

1. Many APIs offer free tiers for development
2. Some APIs require registration and approval
3. Rate limits may apply to free tiers
4. Keep API keys secure and never commit them to version control
5. Use environment variables in production deployments 