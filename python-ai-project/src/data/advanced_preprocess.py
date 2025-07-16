# Install requirements: pip install spacy spacy-langdetect
import os
import glob
import json
import spacy
from spacy_langdetect import LanguageDetector
from spacy.language import Language

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data/medical_knowledge')

# Add language detector to pipeline
def get_lang_nlp():
    nlp = spacy.blank('en')
    nlp.add_pipe('sentencizer')  # Fix: Add sentencizer for sentence boundaries
    nlp.add_pipe('language_detector', last=True)
    return nlp

@Language.factory('language_detector')
def language_detector(nlp, name):
    return LanguageDetector()

# Load spaCy standard English model for entity extraction
nlp = spacy.load('en_core_web_sm')
lang_nlp = get_lang_nlp()

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    results = []
    for line in lines:
        doc = lang_nlp(line)
        if doc._.language['language'] != 'en':
            continue
        spacy_doc = nlp(line)
        entities = [
            {
                'text': ent.text,
                'label': ent.label_
            } for ent in spacy_doc.ents
        ]
        results.append({
            'text': line.strip(),
            'entities': entities
        })
    outpath = filepath.replace('_cleaned.txt', '_entities.json')
    with open(outpath, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f"Processed and saved entities to {outpath}")

def main():
    files = glob.glob(os.path.join(DATA_DIR, 'pubmed_*_cleaned.txt'))
    for file in files:
        process_file(file)

if __name__ == "__main__":
    main() 