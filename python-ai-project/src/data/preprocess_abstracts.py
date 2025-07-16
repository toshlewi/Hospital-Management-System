import os
import glob

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data/medical_knowledge')


def clean_abstracts_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    # Remove duplicates and normalize whitespace
    seen = set()
    cleaned = []
    for line in lines:
        norm = ' '.join(line.strip().split())
        if norm and norm not in seen:
            cleaned.append(norm)
            seen.add(norm)
    outpath = filepath.replace('.txt', '_cleaned.txt')
    with open(outpath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(cleaned))
    print(f"Cleaned file saved to {outpath}")


def main():
    files = glob.glob(os.path.join(DATA_DIR, 'pubmed_*.txt'))
    for file in files:
        if file.endswith('_cleaned.txt'):
            continue
        clean_abstracts_file(file)

if __name__ == "__main__":
    main() 