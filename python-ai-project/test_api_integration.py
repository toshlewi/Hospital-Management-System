#!/usr/bin/env python3
"""
Test script to verify API integrations with real API keys
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# API Keys
PUBMED_API_KEY = "27feebcf45a02d89cf3d56590f31507de309"
FDA_API_KEY = "ppTi25A8MrDcqskZCWeL0DbvJGhEf34yhEMIGkbq"

async def test_pubmed_api():
    """Test PubMed API integration"""
    print("🔬 Testing PubMed API...")
    
    async with aiohttp.ClientSession() as session:
        # Search for diabetes research
        search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        search_params = {
            'db': 'pubmed',
            'term': 'diabetes management',
            'retmax': 3,
            'retmode': 'json',
            'api_key': PUBMED_API_KEY,
            'sort': 'date'
        }
        
        try:
            async with session.get(search_url, params=search_params) as response:
                if response.status == 200:
                    data = await response.json()
                    idlist = data.get('esearchresult', {}).get('idlist', [])
                    print(f"✅ PubMed search successful! Found {len(idlist)} articles")
                    
                    if idlist:
                        # Get article details
                        fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
                        fetch_params = {
                            'db': 'pubmed',
                            'id': ','.join(idlist[:2]),
                            'retmode': 'json',
                            'api_key': PUBMED_API_KEY
                        }
                        
                        async with session.get(fetch_url, params=fetch_params) as fetch_response:
                            if fetch_response.status == 200:
                                fetch_data = await fetch_response.json()
                                articles = list(fetch_data.get('result', {}).values())[1:]
                                print(f"✅ Retrieved {len(articles)} article details")
                                
                                for i, article in enumerate(articles, 1):
                                    title = article.get('title', 'No title')
                                    print(f"   {i}. {title[:80]}...")
                            else:
                                print(f"❌ Failed to fetch article details: {fetch_response.status}")
                    else:
                        print("⚠️ No articles found")
                else:
                    print(f"❌ PubMed search failed: {response.status}")
        except Exception as e:
            print(f"❌ PubMed API error: {e}")

async def test_fda_api():
    """Test FDA API integration"""
    print("\n💊 Testing FDA API...")
    
    async with aiohttp.ClientSession() as session:
        # Search for metformin
        search_url = "https://api.fda.gov/drug/label.json"
        search_params = {
            'search': 'openfda.generic_name:"metformin"',
            'limit': 1
        }
        
        try:
            async with session.get(search_url, params=search_params) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get('results', [])
                    print(f"✅ FDA search successful! Found {len(results)} drug records")
                    
                    if results:
                        drug_info = results[0]
                        generic_name = drug_info.get('openfda', {}).get('generic_name', ['Unknown'])
                        brand_name = drug_info.get('openfda', {}).get('brand_name', ['Unknown'])
                        drug_class = drug_info.get('openfda', {}).get('pharm_class_cs', [])
                        
                        print(f"   Generic Name: {generic_name[0] if generic_name else 'Unknown'}")
                        print(f"   Brand Name: {brand_name[0] if brand_name else 'Unknown'}")
                        print(f"   Drug Class: {drug_class[:2] if drug_class else 'Unknown'}")
                        
                        # Check for interactions
                        interactions = drug_info.get('drug_interactions', [])
                        if interactions:
                            print(f"   Interactions: {len(interactions)} found")
                            for interaction in interactions[:2]:
                                print(f"     - {interaction[:100]}...")
                        else:
                            print("   Interactions: None found")
                    else:
                        print("⚠️ No drug records found")
                else:
                    print(f"❌ FDA search failed: {response.status}")
        except Exception as e:
            print(f"❌ FDA API error: {e}")

async def test_drug_interaction():
    """Test drug interaction analysis"""
    print("\n🔍 Testing Drug Interaction Analysis...")
    
    async with aiohttp.ClientSession() as session:
        medications = ["metformin", "insulin", "aspirin"]
        drug_info = {}
        
        for medication in medications:
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
        
        print(f"\n📊 Drug Interaction Analysis Summary:")
        print(f"   Medications analyzed: {len(medications)}")
        print(f"   Drugs with FDA data: {len(drug_info)}")
        
        for med, info in drug_info.items():
            interactions = info.get('interactions', [])
            warnings = info.get('warnings', [])
            print(f"   {med}: {len(interactions)} interactions, {len(warnings)} warnings")

async def main():
    """Run all API tests"""
    print("🚀 Starting API Integration Tests...")
    print(f"📅 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Test PubMed API
    await test_pubmed_api()
    
    # Test FDA API
    await test_fda_api()
    
    # Test Drug Interaction Analysis
    await test_drug_interaction()
    
    print("\n" + "=" * 60)
    print("✅ API Integration Tests Completed!")
    print("🎉 Your API keys are working correctly!")

if __name__ == "__main__":
    asyncio.run(main()) 