import argparse
import os
import requests

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data/medical_knowledge')

# Example WHO CSV dataset (replace with any public WHO CSV link)
DEFAULT_URL = 'https://cdn.who.int/media/docs/default-source/gho-docs/gho/gho-country-profiles.csv'

def download_who_csv(url, outfile=None):
    if not outfile:
        filename = url.split('/')[-1]
        outfile = os.path.join(DATA_DIR, filename)
    print(f"Downloading WHO data from {url}")
    r = requests.get(url)
    r.raise_for_status()
    os.makedirs(os.path.dirname(outfile), exist_ok=True)
    with open(outfile, 'wb') as f:
        f.write(r.content)
    print(f"Saved WHO data to {outfile}")

def main():
    parser = argparse.ArgumentParser(description="Download a CSV dataset from WHO data portal.")
    parser.add_argument('--url', type=str, default=DEFAULT_URL, help='WHO CSV download URL')
    parser.add_argument('--outfile', type=str, default=None, help='Output file path (optional)')
    args = parser.parse_args()
    download_who_csv(args.url, args.outfile)

if __name__ == "__main__":
    main() 