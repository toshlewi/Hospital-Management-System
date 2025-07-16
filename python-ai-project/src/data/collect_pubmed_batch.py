import argparse
import subprocess
import os

TERMS_FILE_DEFAULT = os.path.join(os.path.dirname(__file__), 'disease_terms.txt')
COLLECT_SCRIPT = os.path.join(os.path.dirname(__file__), 'collect_pubmed_data.py')


def collect_for_terms(terms_file, retmax):
    with open(terms_file, 'r', encoding='utf-8') as f:
        terms = [line.strip() for line in f if line.strip() and not line.startswith('#')]
    for term in terms:
        print(f"\nCollecting PubMed abstracts for: {term}")
        cmd = [
            'python3', COLLECT_SCRIPT,
            '--term', term,
            '--retmax', str(retmax)
        ]
        subprocess.run(cmd, check=True)


def main():
    parser = argparse.ArgumentParser(description="Batch collect PubMed abstracts for a list of terms.")
    parser.add_argument('--terms_file', type=str, default=TERMS_FILE_DEFAULT, help='Path to file with disease/term list (one per line)')
    parser.add_argument('--retmax', type=int, default=100, help='Number of results per term (default: 100)')
    args = parser.parse_args()
    collect_for_terms(args.terms_file, args.retmax)

if __name__ == "__main__":
    main() 