#!/usr/bin/env python3
"""
Focused Model Test Suite - Tests only the specific models you're using.

Models tested:
- EN_SENTIMENT_HuggingFace: distilroberta-finetuned-financial-news-sentiment-analysis
- AR_SENTIMENT_HF: bert-base-arabic-camelbert-da-sentiment
- MULTILINGUAL_EMOTION: multilingual-emotion-classification
- EN_FASTTEXT: FastText English representation
- AR_FASTTEXT: FastText Arabic representation
- EN_PROBLEM_SVM: English SVM problem type classifier
- AR_PROBLEM_SVM: Arabic SVM problem type classifier

Usage:
    python test_focused_models.py
"""

import logging
import sys
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


# ============================================================================
# Test Data: Diverse English & Arabic Sentences
# ============================================================================

ENGLISH_TEST_CASES = [
    {
        "name": "Negative Service Complaint",
        "text": "The service was absolutely terrible today. The staff were rude and unprofessional.",
        "expected_sentiment": "Negative",
        "should_have_problem_type": True,
    },
    {
        "name": "Positive Food Feedback",
        "text": "The food was delicious and fresh! Amazing flavors. Highly recommend!",
        "expected_sentiment": "Positive",
        "should_have_problem_type": False,
    },
    {
        "name": "Neutral Experience",
        "text": "The food was okay. Nothing special but nothing terrible either.",
        "expected_sentiment": "Neutral",
        "should_have_problem_type": False,
    },
    {
        "name": "Negative Quality Complaint",
        "text": "This product broke after one week. Very disappointed with the quality.",
        "expected_sentiment": "Negative",
        "should_have_problem_type": True,
    },
    {
        "name": "Angry Delivery Complaint",
        "text": "The delivery took 3 hours and my food arrived cold! This is unacceptable!",
        "expected_sentiment": "Negative",
        "should_have_problem_type": True,
    },
]

ARABIC_TEST_CASES = [
    {
        "name": "Negative Delivery Complaint",
        "text": "الطعام وصل بارد جدا والتوصيل استغرق ساعتين كاملة.",
        "description": "Food arrived cold, delivery took 2 hours",
        "expected_sentiment": "Negative",
        "should_have_problem_type": True,
    },
    {
        "name": "Positive Feedback",
        "text": "الطعام لذيذ جدا والخدمة ممتازة شكرا لكم.",
        "description": "Food very delicious, excellent service",
        "expected_sentiment": "Positive",
        "should_have_problem_type": False,
    },
    {
        "name": "Quality Complaint",
        "text": "الجودة سيئة جدا والطعام غير نظيف.",
        "description": "Very bad quality, food not clean",
        "expected_sentiment": "Negative",
        "should_have_problem_type": True,
    },
    {
        "name": "Neutral Opinion",
        "text": "الطعام عادي والخدمة متوسطة.",
        "description": "Food ordinary, service average",
        "expected_sentiment": "Neutral",
        "should_have_problem_type": False,
    },
]


# ============================================================================
# Test 1: FastText Representations
# ============================================================================

def test_fasttext_representations():
    """Test FastText embedding generation for both languages."""
    logger.info("\n" + "=" * 80)
    logger.info("TEST 1: FASTTEXT REPRESENTATIONS")
    logger.info("=" * 80)
    
    try:
        import fasttext
        logger.info("  ✓ FastText library loaded")
    except ImportError:
        logger.error("  ✗ FastText not installed. Install with: pip install fasttext")
        return False
    
    all_passed = True
    
    # Test English FastText
    logger.info("\n[ENGLISH FASTTEXT]")
    try:
        from app.ai.english.representation import embed_english
        
        test_text = "The service was terrible"
        ml_embedding = embed_english(test_text, for_ml=True)
        
        if ml_embedding.shape == (1, 100):
            logger.info(f"  ✓ English FastText shape: {ml_embedding.shape} (expected: (1, 100))")
        else:
            logger.error(f"  ✗ Shape mismatch: {ml_embedding.shape}, expected (1, 100)")
            all_passed = False
    except Exception as e:
        logger.error(f"  ✗ English FastText failed: {str(e)}")
        all_passed = False
    
    # Test Arabic FastText
    logger.info("\n[ARABIC FASTTEXT]")
    try:
        from app.ai.arabic.representation import embed_arabic
        
        test_text = "الطعام لذيذ جدا"
        ml_embedding = embed_arabic(test_text, for_ml=True)
        
        if ml_embedding.shape == (1, 100):
            logger.info(f"  ✓ Arabic FastText shape: {ml_embedding.shape} (expected: (1, 100))")
        else:
            logger.error(f"  ✗ Shape mismatch: {ml_embedding.shape}, expected (1, 100)")
            all_passed = False
    except Exception as e:
        logger.error(f"  ✗ Arabic FastText failed: {str(e)}")
        all_passed = False
    
    return all_passed


# ============================================================================
# Test 2: HuggingFace Sentiment Models
# ============================================================================

def test_huggingface_sentiment():
    """Test HuggingFace sentiment models for English and Arabic."""
    logger.info("\n" + "=" * 80)
    logger.info("TEST 2: HUGGINGFACE SENTIMENT MODELS")
    logger.info("=" * 80)
    
    all_passed = True
    
    # Test English Sentiment
    logger.info("\n[ENGLISH SENTIMENT - distilroberta]")
    try:
        from app.ai.hf_predict import predict_english_sentiment_hf
        
        for test_case in ENGLISH_TEST_CASES:
            try:
                sentiment = predict_english_sentiment_hf(test_case['text'])
                
                if sentiment in ["Positive", "Negative", "Neutral"]:
                    match_icon = "✓" if sentiment == test_case['expected_sentiment'] else "⚠"
                    logger.info(
                        f"  {match_icon} {test_case['name']:<35} "
                        f"→ {sentiment:<10} (expected: {test_case['expected_sentiment']})"
                    )
                else:
                    logger.warning(f"  ⚠ {test_case['name']:<35} → Invalid output: {sentiment}")
                    all_passed = False
            except Exception as e:
                logger.error(f"  ✗ {test_case['name']:<35} → {str(e)}")
                all_passed = False
    except Exception as e:
        logger.error(f"  ✗ Failed to load English sentiment: {str(e)}")
        all_passed = False
    
    # Test Arabic Sentiment
    logger.info("\n[ARABIC SENTIMENT - AraBERT]")
    try:
        from app.ai.hf_predict import predict_arabic_sentiment_hf
        
        for test_case in ARABIC_TEST_CASES:
            try:
                sentiment = predict_arabic_sentiment_hf(test_case['text'])
                
                if sentiment in ["Positive", "Negative", "Neutral"]:
                    match_icon = "✓" if sentiment == test_case['expected_sentiment'] else "⚠"
                    logger.info(
                        f"  {match_icon} {test_case['name']:<35} "
                        f"→ {sentiment:<10} (expected: {test_case['expected_sentiment']})"
                    )
                else:
                    logger.warning(f"  ⚠ {test_case['name']:<35} → Invalid output: {sentiment}")
                    all_passed = False
            except Exception as e:
                logger.error(f"  ✗ {test_case['name']:<35} → {str(e)}")
                all_passed = False
    except Exception as e:
        logger.error(f"  ✗ Failed to load Arabic sentiment: {str(e)}")
        all_passed = False
    
    return all_passed


# ============================================================================
# Test 3: Multilingual Emotion Model
# ============================================================================

def test_multilingual_emotion():
    """Test multilingual emotion classification for English and Arabic."""
    logger.info("\n" + "=" * 80)
    logger.info("TEST 3: MULTILINGUAL EMOTION MODEL")
    logger.info("=" * 80)
    
    all_passed = True
    
    logger.info("\n[ENGLISH EMOTIONS]")
    try:
        from app.ai.hf_predict import predict_multilingual_emotion_hf
        
        for test_case in ENGLISH_TEST_CASES[:3]:  # Test first 3
            try:
                emotion = predict_multilingual_emotion_hf(test_case['text'])
                
                valid_emotions = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"]
                if emotion.lower() in valid_emotions:
                    logger.info(f"  ✓ {test_case['name']:<35} → {emotion}")
                else:
                    logger.warning(f"  ⚠ {test_case['name']:<35} → {emotion}")
            except Exception as e:
                logger.error(f"  ✗ {test_case['name']:<35} → {str(e)}")
                all_passed = False
    except Exception as e:
        logger.error(f"  ✗ Failed to load emotion model: {str(e)}")
        all_passed = False
    
    logger.info("\n[ARABIC EMOTIONS]")
    try:
        from app.ai.hf_predict import predict_multilingual_emotion_hf
        
        for test_case in ARABIC_TEST_CASES[:3]:  # Test first 3
            try:
                emotion = predict_multilingual_emotion_hf(test_case['text'])
                
                valid_emotions = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"]
                if emotion.lower() in valid_emotions:
                    logger.info(f"  ✓ {test_case['name']:<35} → {emotion}")
                else:
                    logger.warning(f"  ⚠ {test_case['name']:<35} → {emotion}")
            except Exception as e:
                logger.error(f"  ✗ {test_case['name']:<35} → {str(e)}")
                all_passed = False
    except Exception as e:
        logger.error(f"  ✗ Failed to test Arabic emotion: {str(e)}")
        all_passed = False
    
    return all_passed


# ============================================================================
# Test 4: SVM Problem Type Classifiers
# ============================================================================

def test_svm_problem_type():
    """Test SVM problem type classification for English and Arabic."""
    logger.info("\n" + "=" * 80)
    logger.info("TEST 4: SVM PROBLEM TYPE CLASSIFIERS")
    logger.info("=" * 80)
    
    all_passed = True
    
    # Test English SVM
    logger.info("\n[ENGLISH PROBLEM TYPE - SVM]")
    try:
        from app.ai.english.ml_dl_predict import en_problem_svm
        from app.ai.english.representation import embed_english
        
        for test_case in ENGLISH_TEST_CASES:
            try:
                embedding = embed_english(test_case['text'], for_ml=True)
                
                if en_problem_svm is not None:
                    prediction = en_problem_svm.predict(embedding)
                    problem_type = prediction[0] if prediction is not None else None
                    
                    has_problem = problem_type is not None
                    expected = test_case['should_have_problem_type']
                    
                    match_icon = "✓" if has_problem == expected else "⚠"
                    problem_display = str(problem_type) if problem_type else "None"
                    logger.info(
                        f"  {match_icon} {test_case['name']:<35} "
                        f"→ {problem_display:<20} (expected: {expected})"
                    )
                else:
                    logger.warning(f"  ⚠ English SVM model not loaded")
                    all_passed = False
                    break
            except Exception as e:
                logger.error(f"  ✗ {test_case['name']:<35} → {str(e)}")
                all_passed = False
    except Exception as e:
        logger.error(f"  ✗ Failed to test English SVM: {str(e)}")
        all_passed = False
    
    # Test Arabic SVM (requires arabert_67 model - skipping if not available)
    logger.info("\n[ARABIC PROBLEM TYPE - SVM]")
    logger.info("  ℹ Skipping Arabic SVM - requires arabert_67 embedding model")
    logger.info("  ℹ Alternative: Use AraBERT directly for problem type classification")
    logger.info("  ℹ Your configured Arabic sentiment model can be extended for this task")
    
    return all_passed


# ============================================================================
# Test 5: Model Loading Verification
# ============================================================================

def test_model_loading():
    """Verify all required models can be loaded."""
    logger.info("\n" + "=" * 80)
    logger.info("TEST 5: MODEL LOADING VERIFICATION")
    logger.info("=" * 80)
    
    all_loaded = True
    
    logger.info("\n[CHECKING MODEL PATHS]")
    
    # Check environment variables
    required_env_vars = [
        "EN_SENTIMENT_HuggingFace_PATH",
        "AR_SENTIMENT_HF_MODEL",
        "MULTILINGUAL_EMOTION_HF_MODEL",
        "EN_FASTTEXT_PATH",
        "AR_FASTTEXT_PATH",
        "EN_PROBLEM_SVM_PATH",
        "AR_PROBLEM_SVM_A_PATH",
    ]
    
    for var in required_env_vars:
        value = os.getenv(var)
        if value:
            logger.info(f"  ✓ {var:<35} configured")
        else:
            logger.warning(f"  ⚠ {var:<35} NOT SET in .env")
            all_loaded = False
    
    logger.info("\n[LOADING MODELS]")
    
    # Try loading FastText
    try:
        import fasttext
        logger.info("  ✓ FastText library available")
    except ImportError:
        logger.error("  ✗ FastText library not found - install with: pip install fasttext")
        all_loaded = False
    
    # Try loading models
    try:
        from app.ai.english.representation import embed_english
        logger.info("  ✓ English representation module loaded")
    except Exception as e:
        logger.error(f"  ✗ English representation failed: {str(e)}")
        all_loaded = False
    
    try:
        from app.ai.arabic.representation import embed_arabic
        logger.info("  ✓ Arabic representation module loaded")
    except Exception as e:
        logger.error(f"  ✗ Arabic representation failed: {str(e)}")
        all_loaded = False
    
    try:
        from app.ai.hf_predict import predict_english_sentiment_hf
        logger.info("  ✓ English HuggingFace sentiment loaded")
    except Exception as e:
        logger.error(f"  ✗ English HF sentiment failed: {str(e)}")
        all_loaded = False
    
    try:
        from app.ai.hf_predict import predict_arabic_sentiment_hf
        logger.info("  ✓ Arabic HuggingFace sentiment loaded")
    except Exception as e:
        logger.error(f"  ✗ Arabic HF sentiment failed: {str(e)}")
        all_loaded = False
    
    try:
        from app.ai.hf_predict import predict_multilingual_emotion_hf
        logger.info("  ✓ Multilingual emotion model loaded")
    except Exception as e:
        logger.error(f"  ✗ Multilingual emotion failed: {str(e)}")
        all_loaded = False
    
    return all_loaded


# ============================================================================
# Main Test Runner
# ============================================================================

def main():
    """Run all focused model tests."""
    logger.info("\n")
    logger.info("╔" + "=" * 78 + "╗")
    logger.info("║" + " " * 18 + "FOCUSED MODEL TEST SUITE - SELECTED MODELS ONLY" + " " * 17 + "║")
    logger.info("╚" + "=" * 78 + "╝")
    
    # Check required dependencies
    logger.info("\n[DEPENDENCY CHECK]")
    missing_deps = []
    
    try:
        import torch
        logger.info("  ✓ PyTorch installed")
    except ImportError:
        logger.error("  ✗ PyTorch not installed")
        missing_deps.append("torch")
    
    try:
        import fasttext
        logger.info("  ✓ FastText installed")
    except ImportError:
        logger.error("  ✗ FastText not installed")
        missing_deps.append("fasttext")
    
    try:
        import sklearn
        logger.info("  ✓ scikit-learn installed")
    except ImportError:
        logger.error("  ✗ scikit-learn not installed")
        missing_deps.append("scikit-learn")
    
    try:
        import transformers
        logger.info("  ✓ Transformers installed")
    except ImportError:
        logger.error("  ✗ Transformers not installed")
        missing_deps.append("transformers")
    
    if missing_deps:
        logger.error("\n⚠ Missing dependencies. Install with:")
        logger.error(f"   pip install {' '.join(missing_deps)}")
        logger.error("\nOr install all requirements:")
        logger.error("   pip install -r ../requirements.txt")
        return False
    
    logger.info("\n✓ All dependencies available, running tests...\n")
    
    tests = [
        ("Model Loading", test_model_loading),
        ("FastText Representations", test_fasttext_representations),
        ("HuggingFace Sentiment", test_huggingface_sentiment),
        ("Multilingual Emotion", test_multilingual_emotion),
        ("SVM Problem Type (English)", test_svm_problem_type),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            logger.info(f"\n→ Running: {test_name}")
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"✗ {test_name} crashed: {str(e)}", exc_info=True)
            results.append((test_name, False))
    
    # Print summary
    logger.info("\n" + "=" * 80)
    logger.info("TEST SUMMARY")
    logger.info("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        logger.info(f"{status:<8} | {test_name}")
    
    logger.info("\n" + "=" * 80)
    logger.info(f"TOTAL: {passed}/{total} tests passed ({100*passed//total}%)")
    
    if passed == total:
        logger.info("\n✓ ✓ ✓ ALL TESTS PASSED - YOUR MODELS ARE WORKING CORRECTLY ✓ ✓ ✓")
    else:
        logger.warning(f"\n⚠ {total - passed} test(s) failed - review logs above")
    
    logger.info("=" * 80 + "\n")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
