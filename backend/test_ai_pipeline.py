"""
Standalone test script to verify the new AI prediction pipeline.

- Fetches a few preprocessed feedback records from the database.
- Runs the new transformer-based prediction functions (Arabic and English).
- Prints the results to the console for manual verification.
- Does NOT write any results back to the database.
"""

import os
import sys
import gc

# Add the project root to the Python path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import database, models
from backend.app.ai.arabic_predictor import load_arabic_models, predict_arabic
from backend.app.ai.english_predictor import load_english_models, predict_english


def test_ai_pipeline():
    """
    Fetches sample feedback and runs the AI prediction pipeline in read-only mode.
    """
    db = None
    try:
        db = database.SessionLocal()
        print("--- Database Session Started ---")

        # 1. Fetch sample feedback
        arabic_feedback = (
            db.query(models.Feedback)
            .filter(
                models.Feedback.status == "preprocessed",
                models.Feedback.language == "ar",
                models.Feedback.cleaned_text != None,
            )
            .limit(2)
            .all()
        )

        english_feedback = (
            db.query(models.Feedback)
            .filter(
                models.Feedback.status == "preprocessed",
                models.Feedback.language == "en",
                models.Feedback.cleaned_text != None,
            )
            .limit(2)
            .all()
        )

        if not arabic_feedback and not english_feedback:
            print("\nNo 'preprocessed' feedback found in the database to test.")
            return

        # 2. Run predict_arabic
        if arabic_feedback:
            print("\n--- Testing Arabic Pipeline ---")
            arabic_models = None
            try:
                print("Loading Arabic models...")
                arabic_models = load_arabic_models()
                print("✓ Arabic models loaded.")
                for feedback in arabic_feedback:
                    print(f"\nInput Text (ID: {feedback.feedback_id}):")
                    print(f'"{feedback.cleaned_text}"')
                    predictions = predict_arabic(feedback.cleaned_text, arabic_models)
                    print("Prediction Output:")
                    print(predictions)
            finally:
                if arabic_models:
                    del arabic_models
                    gc.collect()
                    print("\n✓ Arabic models unloaded.")

        # 3. Run predict_english
        if english_feedback:
            print("\n--- Testing English Pipeline ---")
            english_models = None
            try:
                print("Loading English models...")
                english_models = load_english_models()
                print("✓ English models loaded.")
                for feedback in english_feedback:
                    print(f"\nInput Text (ID: {feedback.feedback_id}):")
                    print(f'"{feedback.cleaned_text}"')
                    predictions = predict_english(feedback.cleaned_text, english_models)
                    print("Prediction Output:")
                    print(predictions)
            finally:
                if english_models:
                    del english_models
                    gc.collect()
                    print("\n✓ English models unloaded.")

    except Exception as e:
        print(f"\n--- An error occurred ---")
        print(f"Error: {e}")
    finally:
        if db:
            db.close()
            print("\n--- Database Session Closed ---")


if __name__ == "__main__":
    test_ai_pipeline()
