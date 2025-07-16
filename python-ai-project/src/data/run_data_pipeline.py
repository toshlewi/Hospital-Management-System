import argparse
import subprocess
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../data/medical_knowledge')
SRC_DIR = os.path.dirname(__file__)


def run_script(script, args=None):
    cmd = [sys.executable, os.path.join(SRC_DIR, script)]
    if args:
        cmd += args
    print(f"\nRunning: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


def main():
    parser = argparse.ArgumentParser(description="Run the full data collection and preprocessing pipeline.")
    parser.add_argument('--who_url', type=str, default=None, help='WHO CSV download URL (optional)')
    parser.add_argument('--run_training', action='store_true', help='Run AI training after preprocessing')
    args = parser.parse_args()

    # 1. Batch PubMed collection
    run_script('collect_pubmed_batch.py')

    # 2. CDC data collection
    run_script('collect_cdc_data.py')

    # 3. WHO data collection (if URL provided)
    if args.who_url:
        run_script('collect_who_data.py', ['--url', args.who_url])
    else:
        print("Skipping WHO data collection (no URL provided)")

    # 4. Preprocessing
    run_script('preprocess_abstracts.py')

    # 5. AI training (placeholder)
    if args.run_training:
        print("\n[INFO] Running AI training pipeline...")
        try:
            run_script('train_ai_model.py')
        except FileNotFoundError:
            print("[WARNING] AI training script not found. Please add train_ai_model.py to automate training.")
    else:
        print("[INFO] Skipping AI training step.")

if __name__ == "__main__":
    main() 