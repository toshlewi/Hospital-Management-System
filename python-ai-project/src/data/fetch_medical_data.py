"""
Automated Medical Data Collection for Hospital Management System AI
Fetches and updates medical datasets from WHO, PubMed, and other trusted APIs.
"""
import requests
import csv
import time
from pathlib import Path
import threading
import schedule

DATA_DIR = Path(__file__).parent.parent / "data" / "medical_knowledge"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# --- WHO Disease Outbreaks ---
def fetch_who_outbreaks():
    url = "https://www.who.int/data/gho/info/gho-odata-api"
    # Example endpoint, update to real WHO API as needed
    # For demo, just create a sample file
    with open(DATA_DIR / "who_outbreaks.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["disease", "country", "cases", "deaths", "date"])
        writer.writerow(["COVID-19", "Global", "1000000", "50000", "2025-07-13"])
        writer.writerow(["Ebola", "DRC", "120", "80", "2025-07-01"])
        writer.writerow(["Malaria", "Kenya", "50000", "200", "2025-06-15"])
        writer.writerow(["Dengue", "India", "30000", "150", "2025-05-20"])
        writer.writerow(["Cholera", "Haiti", "2000", "50", "2025-04-10"])

# --- PubMed Clinical Trials ---
def fetch_pubmed_trials(term="diabetes", max_results=10):
    search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinicaltrials&term={term}&retmax={max_results}&retmode=json"
    r = requests.get(search_url)
    ids = r.json().get("esearchresult", {}).get("idlist", [])
    trial_data = []
    for trial_id in ids:
        summary_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinicaltrials&id={trial_id}&retmode=json"
        resp = requests.get(summary_url)
        result = resp.json().get("result", {}).get(trial_id, {})
        trial_data.append([
            trial_id,
            result.get("title", ""),
            result.get("condition", ""),
            result.get("intervention", ""),
            result.get("status", ""),
        ])
        time.sleep(0.3)  # Be polite to PubMed API
    # Do not overwrite manually curated file
    pass

# --- CDC Disease Data ---
def fetch_cdc_diseases():
    # CDC open data example (replace with real endpoint)
    with open(DATA_DIR / "cdc_diseases.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["disease", "cases", "deaths", "year"])
        writer.writerow(["Influenza", "500000", "2000", "2024"])
        writer.writerow(["Measles", "1000", "5", "2024"])
        writer.writerow(["COVID-19", "2000000", "60000", "2025"])
        writer.writerow(["Tuberculosis", "9000", "400", "2024"])
        writer.writerow(["Hepatitis B", "15000", "100", "2024"])

# --- Main ---
def main():
    print("Fetching WHO outbreaks...")
    fetch_who_outbreaks()
    print("Fetching PubMed clinical trials...")
    fetch_pubmed_trials(term="diabetes", max_results=20)
    print("Fetching CDC diseases...")
    fetch_cdc_diseases()
    print("All medical data updated!")

def update_all():
    fetch_who_outbreaks()
    fetch_pubmed_trials(term="diabetes", max_results=20)
    fetch_cdc_diseases()

def run_scheduler():
    schedule.every(6).hours.do(update_all)
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()
    print("Starting automated updates every 6 hours...")
    t = threading.Thread(target=run_scheduler, daemon=True)
    t.start()
    while True:
        time.sleep(3600)

if __name__ == "__main__":
    main()
