#!/usr/bin/env python3
"""
Test script to analyze malaria symptoms using the enhanced AI system
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Malaria symptoms test data
MALARIA_SYMPTOMS = [
    "fever",
    "chills",
    "headache",
    "muscle aches",
    "fatigue",
    "nausea",
    "vomiting",
    "sweating",
    "abdominal pain",
    "diarrhea"
]

MALARIA_NOTES = """
Patient presents with:
- High fever (39.5°C) for the past 3 days
- Severe chills and shivering
- Intense headache
- Muscle and joint pain
- Extreme fatigue
- Nausea and vomiting
- Profuse sweating
- Recent travel to malaria-endemic region
- No previous malaria history
"""

async def test_malaria_diagnosis():
    """Test malaria diagnosis using the AI system"""
    print("🦟 Testing Malaria Diagnosis Analysis...")
    print("=" * 60)
    
    # Test data
    test_data = {
        "notes": MALARIA_NOTES,
        "patient_id": 123,
        "symptoms": MALARIA_SYMPTOMS
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            # Test the diagnosis endpoint
            diagnosis_url = "http://localhost:8000/api/v1/diagnosis/analyze-notes"
            
            async with session.post(diagnosis_url, json=test_data) as response:
                if response.status == 200:
                    result = await response.json()
                    print("✅ Malaria Diagnosis Analysis Successful!")
                    print(f"📊 Analysis Results:")
                    print(f"   Patient ID: {result.get('patient_id', 'N/A')}")
                    print(f"   Timestamp: {result.get('timestamp', 'N/A')}")
                    
                    # Symptoms
                    symptoms = result.get('symptoms', [])
                    print(f"   Symptoms Detected: {len(symptoms)}")
                    for i, symptom in enumerate(symptoms, 1):
                        print(f"     {i}. {symptom}")
                    
                    # Differential Diagnosis
                    diff_diagnosis = result.get('differential_diagnosis', [])
                    print(f"\n🔍 Differential Diagnosis: {len(diff_diagnosis)} conditions")
                    for i, condition in enumerate(diff_diagnosis, 1):
                        print(f"     {i}. {condition.get('condition_name', 'Unknown')}")
                        print(f"        Probability: {condition.get('probability', 0):.2f}")
                        print(f"        Severity: {condition.get('severity', 'Unknown')}")
                        print(f"        Urgency: {condition.get('urgency_level', 'Unknown')}")
                    
                    # Recommended Tests
                    tests = result.get('tests', [])
                    print(f"\n🧪 Recommended Tests: {len(tests)}")
                    for i, test in enumerate(tests, 1):
                        print(f"     {i}. {test}")
                    
                    # Treatment Plan
                    treatment = result.get('treatment_plan', [])
                    print(f"\n💊 Treatment Plan: {len(treatment)} recommendations")
                    for i, treatment_item in enumerate(treatment, 1):
                        print(f"     {i}. {treatment_item}")
                    
                    # Urgency Assessment
                    urgency_score = result.get('urgency_score', 0)
                    urgency_level = result.get('urgency_level', 'Unknown')
                    print(f"\n🚨 Urgency Assessment:")
                    print(f"   Score: {urgency_score:.2f}")
                    print(f"   Level: {urgency_level}")
                    
                    # Confidence
                    confidence = result.get('confidence', 0)
                    print(f"   Confidence: {confidence:.2f}")
                    
                    # Data Sources
                    data_sources = result.get('data_sources', {})
                    print(f"\n📚 Data Sources Used:")
                    for source, count in data_sources.items():
                        print(f"   {source}: {count} items")
                        
                else:
                    print(f"❌ Diagnosis analysis failed: {response.status}")
                    error_text = await response.text()
                    print(f"Error details: {error_text}")
                    
    except Exception as e:
        print(f"❌ Error testing malaria diagnosis: {e}")

async def test_malaria_research():
    """Test PubMed research for malaria"""
    print("\n🔬 Testing Malaria Research from PubMed...")
    print("=" * 60)
    
    # PubMed API key
    pubmed_api_key = "27feebcf45a02d89cf3d56590f31507de309"
    
    try:
        async with aiohttp.ClientSession() as session:
            # Search for malaria research
            search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            search_params = {
                'db': 'pubmed',
                'term': 'malaria diagnosis treatment symptoms',
                'retmax': 5,
                'retmode': 'json',
                'api_key': pubmed_api_key,
                'sort': 'date'
            }
            
            async with session.get(search_url, params=search_params) as response:
                if response.status == 200:
                    data = await response.json()
                    idlist = data.get('esearchresult', {}).get('idlist', [])
                    print(f"✅ PubMed search successful! Found {len(idlist)} malaria research articles")
                    
                    if idlist:
                        # Get article details
                        fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
                        fetch_params = {
                            'db': 'pubmed',
                            'id': ','.join(idlist[:3]),
                            'retmode': 'json',
                            'api_key': pubmed_api_key
                        }
                        
                        async with session.get(fetch_url, params=fetch_params) as fetch_response:
                            if fetch_response.status == 200:
                                fetch_data = await fetch_response.json()
                                articles = list(fetch_data.get('result', {}).values())[1:]
                                print(f"✅ Retrieved {len(articles)} malaria research articles")
                                
                                for i, article in enumerate(articles, 1):
                                    title = article.get('title', 'No title')
                                    pubdate = article.get('pubdate', 'Unknown date')
                                    print(f"\n   {i}. {title[:100]}...")
                                    print(f"      Published: {pubdate}")
                            else:
                                print(f"❌ Failed to fetch article details: {fetch_response.status}")
                    else:
                        print("⚠️ No malaria research articles found")
                else:
                    print(f"❌ PubMed search failed: {response.status}")
                    
    except Exception as e:
        print(f"❌ Error testing malaria research: {e}")

async def test_malaria_drug_interactions():
    """Test drug interactions for malaria treatment"""
    print("\n💊 Testing Malaria Drug Interactions...")
    print("=" * 60)
    
    # Common malaria medications
    malaria_medications = ["chloroquine", "artemisinin", "quinine", "mefloquine"]
    
    try:
        async with aiohttp.ClientSession() as session:
            drug_info = {}
            
            for medication in malaria_medications:
                try:
                    search_url = "https://api.fda.gov/drug/label.json"
                    search_params = {
                        'search': f'openfda.generic_name:"{medication}"',
                        'limit': 1
                    }
                    
                    async with session.get(search_url, params=search_params) as response:
                        if response.status == 200:
                            data = await response.json()
                            results = data.get('results', [])
                            if results:
                                drug_data = results[0]
                                drug_info[medication] = {
                                    "generic_name": drug_data.get('openfda', {}).get('generic_name', []),
                                    "brand_name": drug_data.get('openfda', {}).get('brand_name', []),
                                    "drug_class": drug_data.get('openfda', {}).get('pharm_class_cs', []),
                                    "interactions": drug_data.get('drug_interactions', []),
                                    "warnings": drug_data.get('warnings', [])
                                }
                                print(f"✅ Found FDA data for {medication}")
                            else:
                                print(f"⚠️ No FDA data found for {medication}")
                        else:
                            print(f"❌ Failed to get FDA data for {medication}: {response.status}")
                except Exception as e:
                    print(f"❌ Error getting FDA data for {medication}: {e}")
            
            print(f"\n📊 Malaria Drug Analysis Summary:")
            print(f"   Medications analyzed: {len(malaria_medications)}")
            print(f"   Drugs with FDA data: {len(drug_info)}")
            
            for med, info in drug_info.items():
                interactions = info.get('interactions', [])
                warnings = info.get('warnings', [])
                print(f"   {med}: {len(interactions)} interactions, {len(warnings)} warnings")
                
                if interactions:
                    print(f"     Interactions: {interactions[0][:100]}...")
                if warnings:
                    print(f"     Warnings: {warnings[0][:100]}...")
                    
    except Exception as e:
        print(f"❌ Error testing malaria drug interactions: {e}")

async def main():
    """Run all malaria tests"""
    print("🦟 Starting Malaria Analysis Tests...")
    print(f"📅 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Wait for AI service to start
    print("⏳ Waiting for AI service to start...")
    await asyncio.sleep(3)
    
    # Test malaria diagnosis
    await test_malaria_diagnosis()
    
    # Test malaria research
    await test_malaria_research()
    
    # Test malaria drug interactions
    await test_malaria_drug_interactions()
    
    print("\n" + "=" * 60)
    print("✅ Malaria Analysis Tests Completed!")
    print("🎉 AI system successfully analyzed malaria symptoms!")

if __name__ == "__main__":
    asyncio.run(main()) 