import os
import glob

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data/medical_knowledge')

def load_cleaned_abstracts():
    files = glob.glob(os.path.join(DATA_DIR, 'pubmed_*_cleaned.txt'))
    abstracts = []
    for file in files:
        with open(file, 'r', encoding='utf-8') as f:
            abstracts.extend([line.strip() for line in f if line.strip()])
    return abstracts

def main():
    print("[AI TRAINING] Loading cleaned PubMed abstracts...")
    abstracts = load_cleaned_abstracts()
    print(f"[AI TRAINING] Loaded {len(abstracts)} abstracts. Starting training...")
    # Placeholder: Insert your model training code here
    print("[AI TRAINING] Training complete! (This is a placeholder. Replace with your model logic.)")

if __name__ == "__main__":
    main() 