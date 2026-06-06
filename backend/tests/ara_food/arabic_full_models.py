"""
Test script for Arabic Ensemble Predictions (Hard Voting)
"""

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.ai.arabic.ensemble import (
    predict_arabic_problem_type,
    predict_arabic_emotion,
    predict_arabic_sentiment
)


def test_arabic_ensemble():
    print("=" * 60)
    print("Testing Arabic Ensemble Predictions")
    print("=" * 60)

    test_texts = [
        "الخدمة سيئة جدا والموظفين غير مهذبين",
        "الطعام لذيذ وطازج ووصل في الوقت",
        "الطلب خاطئ ولم يعطوني المنتج الصحيح",
        "انا احب الاكل المالح جدا",
        "التطبيق بطيء ويصعب استخدامه",
    ]

    for i, text in enumerate(test_texts, 1):
        print(f"\nTest {i}: {text[:60]}...")

        try:
            problem = predict_arabic_problem_type(text)
            emotion = predict_arabic_emotion(text)
            sentiment = predict_arabic_sentiment(text)

            print(f"   Problem Type → {problem}")
            print(f"   Emotion      → {emotion}")
            print(f"   Sentiment    → {sentiment}")

        except Exception as e:
            print(f"   ❌ Error: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 60)
    print("Arabic Ensemble Test Completed!")
    print("=" * 60)


if __name__ == "__main__":
    test_arabic_ensemble()