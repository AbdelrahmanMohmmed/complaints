"""
Test script for run_ai_job and run_ai_pipeline
"""

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))


from app.ai.predict import run_ai_pipeline  # ← Your main pipeline function


def test_single_pipeline():
    """Test the main AI pipeline on sample texts"""
    print("=" * 70)
    print("Testing run_ai_pipeline")
    print("=" * 70)

    test_cases = [
        "الطعام ممتاز والتوصيل سريع شكرا",
        "this food is fucking trash i hate it i hate everything"
    ]

    for i, text in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        print(f"Text: {text}")

        try:
            results = run_ai_pipeline(text)

            print(f"Sentiment    : {results.get('sentiment')}")
            print(f"Emotion      : {results.get('emotion')}")
            print(f"Problem Type : {results.get('problem_type')}")
            print(f"Priority     : {results.get('priority')}")

        except Exception as e:
            print(f"❌ Pipeline failed: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 70)
    print("AI Pipeline Test Completed!")
    print("=" * 70)





if __name__ == "__main__":
    test_single_pipeline()
