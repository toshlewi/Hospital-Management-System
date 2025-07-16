import argparse
import os
import requests

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data/medical_knowledge')

# Example CDC CSV dataset (replace with any public CDC CSV link)
DEFAULT_URL = 'https://data.cdc.gov/api/views/bi63-dtpu/rows.csv?accessType=DOWNLOAD'

def download_cdc_csv(url, outfile=None):
    if not outfile:
        filename = url.split('/')[-1]
        outfile = os.path.join(DATA_DIR, filename)
    print(f"Downloading CDC data from {url}")
    r = requests.get(url)
    r.raise_for_status()
    os.makedirs(os.path.dirname(outfile), exist_ok=True)
    with open(outfile, 'wb') as f:
        f.write(r.content)
    print(f"Saved CDC data to {outfile}")

def main():
    parser = argparse.ArgumentParser(description="Download a CSV dataset from CDC data portal.")
    parser.add_argument('--url', type=str, default=DEFAULT_URL, help='CDC CSV download URL')
    parser.add_argument('--outfile', type=str, default=None, help='Output file path (optional)')
    args = parser.parse_args()
    download_cdc_csv(args.url, args.outfile)

if __name__ == "__main__":
    main() 