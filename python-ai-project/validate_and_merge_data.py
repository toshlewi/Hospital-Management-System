import json
import os
from collections import OrderedDict

def validate_training_data(data):
    if not isinstance(data, list):
        raise ValueError('training_data.json must be a list of objects')
    for entry in data:
        if not isinstance(entry, dict):
            raise ValueError('Each entry must be a dict')
        if 'symptoms' not in entry or 'disease' not in entry or 'confidence' not in entry:
            raise ValueError('Each entry must have symptoms, disease, and confidence fields')


def validate_diseases_database(data):
    if not isinstance(data, dict):
        raise ValueError('diseases_database.json must be a dict of disease_name: data')
    for disease, info in data.items():
        if not isinstance(info, dict):
            raise ValueError(f'Disease entry for {disease} must be a dict')
        # Optionally check for required fields in info


def merge_training_data(existing, new):
    seen = set()
    merged = []
    for entry in existing + new:
        key = (entry['symptoms'], entry['disease'])
        if key not in seen:
            merged.append(entry)
            seen.add(key)
    return merged


def merge_diseases_database(existing, new):
    merged = existing.copy()
    for disease, info in new.items():
        merged[disease] = info  # Overwrite or add new
    return merged


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    td_path = os.path.join(base_dir, 'data', 'training_data.json')
    dd_path = os.path.join(base_dir, 'data', 'diseases_database.json')

    print('--- Medical AI Data Validator & Merger ---')
    print('Default data files:')
    print(f'  Training data: {td_path}')
    print(f'  Diseases DB:   {dd_path}')

    # Load existing data
    with open(td_path, 'r') as f:
        training_data = json.load(f)
    with open(dd_path, 'r') as f:
        diseases_db = json.load(f)

    validate_training_data(training_data)
    validate_diseases_database(diseases_db)
    print(f'Loaded {len(training_data)} training examples and {len(diseases_db)} diseases.')

    # Prompt for new data files
    new_td_path = input('Path to new training data JSON (or leave blank to skip): ').strip()
    new_dd_path = input('Path to new diseases database JSON (or leave blank to skip): ').strip()

    # Merge training data
    if new_td_path:
        with open(new_td_path, 'r') as f:
            new_training_data = json.load(f)
        validate_training_data(new_training_data)
        training_data = merge_training_data(training_data, new_training_data)
        print(f'After merge: {len(training_data)} training examples.')
        with open(td_path, 'w') as f:
            json.dump(training_data, f, indent=2)
        print(f'Updated {td_path}')

    # Merge diseases database
    if new_dd_path:
        with open(new_dd_path, 'r') as f:
            new_diseases_db = json.load(f)
        validate_diseases_database(new_diseases_db)
        diseases_db = merge_diseases_database(diseases_db, new_diseases_db)
        print(f'After merge: {len(diseases_db)} diseases.')
        with open(dd_path, 'w') as f:
            json.dump(diseases_db, f, indent=2)
        print(f'Updated {dd_path}')

    print('Validation and merge complete!')

if __name__ == '__main__':
    main() 