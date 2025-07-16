import argparse
from Bio import Entrez
import os

# Set your email here (required by NCBI)
Entrez.email = "your_email@example.com"

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data/medical_knowledge')


def fetch_pubmed_abstracts(search_term, retmax=100, outfile=None):
    print(f"Searching PubMed for: {search_term} (max {retmax} results)")
    handle = Entrez.esearch(db="pubmed", term=search_term, retmax=retmax)
    record = Entrez.read(handle)
    id_list = record["IdList"]
    if not id_list:
        print("No results found.")
        return
    print(f"Found {len(id_list)} articles. Fetching abstracts...")
    handle = Entrez.efetch(db="pubmed", id=",".join(id_list), rettype="abstract", retmode="text")
    abstracts = handle.read()
    if not outfile:
        safe_term = search_term.replace(' ', '_')
        outfile = os.path.join(DATA_DIR, f"pubmed_{safe_term}.txt")
    os.makedirs(os.path.dirname(outfile), exist_ok=True)
    with open(outfile, "w", encoding="utf-8") as f:
        f.write(abstracts)
    print(f"Saved abstracts to {outfile}")


def main():
    parser = argparse.ArgumentParser(description="Collect PubMed abstracts using Bio.Entrez.")
    parser.add_argument('--term', type=str, required=True, help='Search term (e.g., diabetes)')
    parser.add_argument('--retmax', type=int, default=100, help='Number of results to fetch (default: 100)')
    parser.add_argument('--outfile', type=str, default=None, help='Output file path (optional)')
    args = parser.parse_args()
    fetch_pubmed_abstracts(args.term, args.retmax, args.outfile)

if __name__ == "__main__":
    main() 