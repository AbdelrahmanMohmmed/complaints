"""
Test script for full pipeline: text -> language detection -> preprocessing -> AI prediction
"""

import os
import sys
import gc

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.preprocessing.router import detect_language, preprocess_feedback, route_pipeline
from app.ai.arabic_predictor import load_arabic_models, predict_arabic
from app.ai.english_predictor import load_english_models, predict_english
from app.ai.priority import calculate_priority
from app.ai.labels import (
    SENTIMENT_LABEL2ID,
    EMOTION_LABEL2ID,
    PROBLEM_TYPE_LABEL2ID,
)


def run_full_pipeline(text: str):
    """
    Full pipeline: raw text -> detect language -> preprocess -> AI prediction
    Mirrors what happens in production.
    """
    print(f"\n  [1] Raw text: {text[:60]}...")

    # Step 1: Detect language
    language = detect_language(text)
    print(f"  [2] Detected language: {language}")

    # Step 2: Preprocess
    cleaned_text = preprocess_feedback(text)
    print(f"  [3] Cleaned text: {cleaned_text[:60]}...")

    if not cleaned_text:
        print("  [!] Cleaned text is empty, skipping AI")
        return {
            "language": language,
            "cleaned_text": "",
            "sentiment": None,
            "sentiment_id": None,
            "emotion": None,
            "emotion_id": None,
            "problem_type": None,
            "problem_type_id": None,
            "priority": "Medium",
        }

    # Step 3: AI Prediction
    if language in ("ar", "franko"):
        print(f"  [4] Loading Arabic models...")
        models = load_arabic_models()
        try:
            predictions = predict_arabic(cleaned_text, models)
        finally:
            del models
            gc.collect()
    else:
        print(f"  [4] Loading English models...")
        models = load_english_models()
        try:
            predictions = predict_english(cleaned_text, models)
        finally:
            del models
            gc.collect()

    # Step 4: Map to IDs (like the DB does)
    sentiment = predictions.get("sentiment")
    emotion = predictions.get("emotion")
    problem_type = predictions.get("problem_type")

    result = {
        "language": language,
        "cleaned_text": cleaned_text,
        "sentiment": sentiment,
        "sentiment_id": SENTIMENT_LABEL2ID.get(sentiment.lower()) if sentiment else None,
        "emotion": emotion,
        "emotion_id": EMOTION_LABEL2ID.get(emotion.lower()) if emotion else None,
        "problem_type": problem_type,
        "problem_type_id": PROBLEM_TYPE_LABEL2ID.get(problem_type) if problem_type else None,
        "priority": predictions.get("priority", "Medium"),
    }

    return result


def test_single_pipeline():
    """Test the full pipeline on sample texts"""
    print("=" * 70)
    print("Testing Full Pipeline: Text -> Language -> Preprocess -> AI")
    print("=" * 70)

    test_cases = [
        ("Arabic Positive", "الطعام ممتاز والتوصيل سريع شكرا"),
        ("English Negative", "this food is terrible and cold, worst experience ever"),
        ("English Frustrated", "i ordered pizza 2 hours ago and still nothing arrived, terrible service"),
        ("Arabic Negative", "الأكل بارد والخدمة سيئة جدا"),
        ("Franco-Arabic", "el akel 7ar w el service 3ala 7agat tanya"),
        ("Short English", "bad food"),
        ("Empty-like", "   "),
    ]

    for i, (label, text) in enumerate(test_cases, 1):
        print(f"\n{'─' * 70}")
        print(f"Test Case {i}: {label}")
        print(f"{'─' * 70}")

        try:
            results = run_full_pipeline(text)

            print(f"\n  ✅ Results:")
            print(f"     Language      : {results['language']}")
            print(f"     Sentiment     : {results['sentiment']} (id={results['sentiment_id']})")
            print(f"     Emotion       : {results['emotion']} (id={results['emotion_id']})")
            print(f"     Problem Type  : {results['problem_type']} (id={results['problem_type_id']})")
            print(f"     Priority      : {results['priority']}")

        except Exception as e:
            print(f"\n  ❌ Pipeline failed: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 70)
    print("Full Pipeline Test Completed!")
    print("=" * 70)


def test_batch_pipeline():
    """Test batch processing speed"""
    import time

    print("\n" + "=" * 70)
    print("Testing Batch Processing Speed")
    print("=" * 70)

    test_texts = [
        "the food was amazing and hot",
        "terrible service i waited forever",
        "pizza was cold and soggy",
        "great atmosphere friendly staff",
        "overpriced and small portions",
        "delivery was fast but food was wrong",
        "loved the dessert menu",
        "dirty tables and rude waiter",
        "best burger in town",
        "will never come back again",
    ] * 3  # 30 texts total

    print(f"\nProcessing {len(test_texts)} English texts...")

    # Preprocess all first
    start = time.time()
    preprocessed = []
    for text in test_texts:
        lang = detect_language(text)
        cleaned = preprocess_feedback(text)
        preprocessed.append((lang, cleaned))
    preprocess_time = time.time() - start
    print(f"  Preprocessing: {preprocess_time:.2f}s ({preprocess_time/len(test_texts):.3f}s per text)")

    # Load models once
    start = time.time()
    models = load_english_models()
    load_time = time.time() - start
    print(f"  Model loading: {load_time:.2f}s")

    # Predict one-by-one (current approach)
    start = time.time()
    for lang, cleaned in preprocessed:
        if cleaned:
            predict_english(cleaned, models)
    single_time = time.time() - start
    print(f"  One-by-one prediction: {single_time:.2f}s ({single_time/len(test_texts):.3f}s per text)")

    del models
    gc.collect()

    total = preprocess_time + load_time + single_time
    print(f"\n  Total time: {total:.2f}s for {len(test_texts)} texts")
    print(f"  Throughput: {len(test_texts)/total:.1f} texts/sec")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    test_single_pipeline()
    test_batch_pipeline()
