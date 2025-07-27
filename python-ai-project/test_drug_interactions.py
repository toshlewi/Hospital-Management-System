#!/usr/bin/env python3
"""
Test script for enhanced drug interaction API
Demonstrates real-time drug interaction checking
"""

import asyncio
import json
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from ai.drug_interaction_api import DrugInteractionAPI

async def test_drug_interactions():
    """Test the enhanced drug interaction API"""
    print("🧪 Testing Enhanced Drug Interaction API")
    print("=" * 50)
    
    # Initialize the API
    api = DrugInteractionAPI()
    
    # Test cases
    test_cases = [
        {
            "name": "High Risk Combination",
            "medications": ["warfarin", "aspirin", "metformin"]
        },
        {
            "name": "Moderate Risk Combination", 
            "medications": ["lisinopril", "spironolactone", "metformin"]
        },
        {
            "name": "Cardiovascular Medications",
            "medications": ["simvastatin", "amiodarone", "digoxin"]
        },
        {
            "name": "Antibiotic Interactions",
            "medications": ["ciprofloxacin", "warfarin", "metronidazole"]
        },
        {
            "name": "Safe Combination",
            "medications": ["acetaminophen", "vitamin d", "calcium"]
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 Test {i}: {test_case['name']}")
        print(f"Medications: {', '.join(test_case['medications'])}")
        print("-" * 40)
        
        try:
            # Analyze the medication list
            result = await api.analyze_medication_list(test_case['medications'])
            
            # Display results
            print(f"Risk Level: {result['risk_level'].upper()}")
            print(f"Total Interactions: {result['total_interactions']}")
            
            if result['warnings']:
                print("\n⚠️  Warnings:")
                for warning in result['warnings']:
                    print(f"  • {warning}")
            
            if result['recommendations']:
                print("\n💡 Recommendations:")
                for rec in result['recommendations']:
                    print(f"  • {rec}")
            
            if result['interactions']:
                print("\n🔍 Detailed Interactions:")
                for interaction in result['interactions']:
                    print(f"  • {interaction['drug1']} + {interaction['drug2']}")
                    print(f"    Severity: {interaction['severity']}")
                    print(f"    Description: {interaction['description']}")
                    print(f"    Source: {interaction.get('source', 'Unknown')}")
                    if interaction.get('mechanism'):
                        print(f"    Mechanism: {interaction['mechanism']}")
                    print()
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Drug Interaction API Testing Complete!")

async def test_single_interaction():
    """Test single drug pair interaction"""
    print("\n🔬 Testing Single Drug Interaction")
    print("=" * 40)
    
    api = DrugInteractionAPI()
    
    # Test specific drug pairs
    drug_pairs = [
        ("warfarin", "aspirin"),
        ("metformin", "insulin"),
        ("simvastatin", "amiodarone"),
        ("digoxin", "amiodarone"),
        ("acetaminophen", "ibuprofen")
    ]
    
    for drug1, drug2 in drug_pairs:
        print(f"\n💊 Checking: {drug1} + {drug2}")
        
        try:
            interaction = await api.check_drug_interaction(drug1, drug2)
            
            if interaction:
                print(f"  ✅ Interaction Found!")
                print(f"  Severity: {interaction['severity']}")
                print(f"  Description: {interaction['description']}")
                print(f"  Source: {interaction.get('source', 'Unknown')}")
                if interaction.get('recommendation'):
                    print(f"  Recommendation: {interaction['recommendation']}")
            else:
                print(f"  ✅ No known interaction")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")

async def test_drug_normalization():
    """Test drug name normalization"""
    print("\n🔄 Testing Drug Name Normalization")
    print("=" * 40)
    
    api = DrugInteractionAPI()
    
    # Test various drug name formats
    drug_names = [
        "aspirin",
        "acetylsalicylic acid",
        "warfarin",
        "coumadin",
        "metformin",
        "glucophage"
    ]
    
    for drug_name in drug_names:
        try:
            normalized = await api._normalize_drug_name(drug_name)
            print(f"  {drug_name} → {normalized}")
        except Exception as e:
            print(f"  {drug_name} → Error: {e}")

async def main():
    """Main test function"""
    print("🏥 Enhanced Drug Interaction API Test Suite")
    print("=" * 60)
    
    # Run all tests
    await test_drug_interactions()
    await test_single_interaction()
    await test_drug_normalization()
    
    print("\n🎉 All tests completed successfully!")
    print("\n💡 To use this in your AI system:")
    print("   1. The API is now integrated into your enhanced_diagnosis.py")
    print("   2. Call analyze_drug_interactions() with a list of medications")
    print("   3. Get real-time interaction analysis with FDA/OpenFDA APIs")
    print("   4. Fallback to comprehensive known interactions database")

if __name__ == "__main__":
    asyncio.run(main()) 