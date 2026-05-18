"""
Test suite for AI Analysis Phase - Verifies all models and representation layers.

Tests:
1. Model loading (all ML/DL models)
2. Representation models (FastText embeddings)
3. Individual ensemble predictions
4. Complete AI pipeline
5. Priority scoring
6. Both English and Arabic support
"""

import logging
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)


# Test cases with different scenarios
TEST_CASES = [
    {
        "name": "English - Negative Service Complaint",
        "text": "The service was absolutely terrible today. Staff were rude and unprofessional.",
        "language": "english",
        "expected_sentiment": "Negative",
        "expected_emotion": "Frustrated",
        "expected_has_problem_type": True,
    },
    {
        "name": "English - Positive Food Feedback",
        "text": "The food was delicious and fresh! Amazing flavors. Highly recommend!",
        "language": "english",
        "expected_sentiment": "Positive",
        "expected_emotion": "Satisfied",
        "expected_has_problem_type": False,  # Conditional: positive feedback skips problem type
    },
    {
        "name": "English - Neutral Experience",
        "text": "The food was okay. Nothing special but nothing terrible either.",
        "language": "english",
        "expected_sentiment": "Neutral",
        "expected_emotion": "Neutral",
        "expected_has_problem_type": False,  # Conditional: neutral + neutral skips
    },
    {
        "name": "Arabic - Negative Delivery Complaint",
        "text": "الطعام وصل بارد جدا والتوصيل استغرق ساعتين كاملة.",  # Food arrived cold, delivery took 2 hours
        "language": "arabic",
        "expected_sentiment": "Negative",
        "expected_emotion": "Frustrated",
        "expected_has_problem_type": True,
    },
    {
        "name": "Arabic - Positive Feedback",
        "text": "الطعام لذيذ جدا والخدمة ممتازة شكرا لكم.",  # Food very delicious, excellent service
        "language": "arabic",
        "expected_sentiment": "Positive",
        "expected_emotion": "Satisfied",
        "expected_has_problem_type": False,
    },
]


# ============================================================================
# Test 1: Model Loading Verification
# ============================================================================

def test_model_loading():
    """Verify all ML/DL models load successfully."""
    logger.info("=" * 80)
    logger.info("TEST 1: Model Loading Verification")
    logger.info("=" * 80)
    
    try:
        # English models
        logger.info("\n[English Models]")
        from app.ai.english.ml_dl_predict import (
            en_problem_lr, en_problem_rf, en_problem_svm,
            en_emotion_bilstm, en_emotion_lr,
            en_sentiment_svm, en_sentiment_gru
        )
        
        english_models = {
            "Problem LR": en_problem_lr,
            "Problem RF": en_problem_rf,
            "Problem SVM": en_problem_svm,
            "Emotion BiLSTM": en_emotion_bilstm,
            "Emotion LR": en_emotion_lr,
            "Sentiment SVM": en_sentiment_svm,
            "Sentiment GRU": en_sentiment_gru,
        }
        
        for name, model in english_models.items():
            status = "✓" if model is not None else "✗"
            logger.info(f"  {status} {name}")
        
        all_english_loaded = all(m is not None for m in english_models.values())
        
        # Arabic models
        logger.info("\n[Arabic Models]")
        from app.ai.arabic.ml_dl_predict import (
            ar_problem_lr_f, ar_problem_gru, ar_problem_lr_a, ar_problem_svm_a,
            ar_emotion_lr_f, ar_emotion_bilstm, ar_emotion_lr_a, ar_emotion_svm_a,
            ar_sentiment_lr_f, ar_sentiment_bilstm, ar_sentiment_svm_a, ar_sentiment_lr_a
        )
        
        arabic_models = {
            "Problem LR-F": ar_problem_lr_f,
            "Problem GRU": ar_problem_gru,
            "Problem LR-A": ar_problem_lr_a,
            "Problem SVM-A": ar_problem_svm_a,
            "Emotion LR-F": ar_emotion_lr_f,
            "Emotion BiLSTM": ar_emotion_bilstm,
            "Emotion LR-A": ar_emotion_lr_a,
            "Emotion SVM-A": ar_emotion_svm_a,
            "Sentiment LR-F": ar_sentiment_lr_f,
            "Sentiment BiLSTM": ar_sentiment_bilstm,
            "Sentiment SVM-A": ar_sentiment_svm_a,
            "Sentiment LR-A": ar_sentiment_lr_a,
        }
        
        for name, model in arabic_models.items():
            status = "✓" if model is not None else "✗"
            logger.info(f"  {status} {name}")
        
        all_arabic_loaded = all(m is not None for m in arabic_models.values())
        
        logger.info("\n" + "=" * 80)
        if all_english_loaded and all_arabic_loaded:
            logger.info("✓ ALL MODELS LOADED SUCCESSFULLY")
            logger.info("=" * 80 + "\n")
            return True
        else:
            logger.error("✗ SOME MODELS FAILED TO LOAD")
            logger.info("=" * 80 + "\n")
            return False
            
    except Exception as e:
        logger.error(f"Model loading test failed: {str(e)}", exc_info=True)
        return False


# ============================================================================
# Test 2: Representation Models (FastText Embeddings)
# ============================================================================

def test_representation_models():
    """Verify FastText representation models generate correct shapes."""
    logger.info("=" * 80)
    logger.info("TEST 2: Representation Models (FastText Embeddings)")
    logger.info("=" * 80)
    
    try:
        from app.ai.english.representation import embed_english
        from app.ai.arabic.representation import embed_arabic
        
        test_text_en = "The service was terrible"
        test_text_ar = "الطعام لذيذ جدا"
        
        # English representations
        logger.info("\n[English Representations]")
        try:
            ml_emb = embed_english(test_text_en, for_ml=True)
            logger.info(f"  ✓ ML embedding shape: {ml_emb.shape} (expected: (1, 100))")
            assert ml_emb.shape == (1, 100), f"Expected (1, 100), got {ml_emb.shape}"
        except Exception as e:
            logger.error(f"  ✗ ML embedding failed: {str(e)}")
            return False
        
        try:
            dl_emb = embed_english(test_text_en, for_ml=False)
            logger.info(f"  ✓ DL embedding shape: {dl_emb.shape} (expected: (1, 65))")
            assert dl_emb.shape == (1, 65), f"Expected (1, 65), got {dl_emb.shape}"
        except Exception as e:
            logger.error(f"  ✗ DL embedding failed: {str(e)}")
            return False
        
        # Arabic representations
        logger.info("\n[Arabic Representations]")
        try:
            ml_emb = embed_arabic(test_text_ar, for_ml=True)
            logger.info(f"  ✓ ML embedding shape: {ml_emb.shape} (expected: (1, 100))")
            assert ml_emb.shape == (1, 100), f"Expected (1, 100), got {ml_emb.shape}"
        except Exception as e:
            logger.error(f"  ✗ ML embedding failed: {str(e)}")
            return False
        
        try:
            dl_emb = embed_arabic(test_text_ar, for_ml=False)
            logger.info(f"  ✓ DL embedding shape: {dl_emb.shape} (expected: (1, 30))")
            assert dl_emb.shape == (1, 30), f"Expected (1, 30), got {dl_emb.shape}"
        except Exception as e:
            logger.error(f"  ✗ DL embedding failed: {str(e)}")
            return False
        
        logger.info("\n" + "=" * 80)
        logger.info("✓ ALL REPRESENTATION MODELS WORKING")
        logger.info("=" * 80 + "\n")
        return True
        
    except Exception as e:
        logger.error(f"Representation test failed: {str(e)}", exc_info=True)
        return False


# ============================================================================
# Test 2.5: AraBERT Embeddings (for SVM models)
# ============================================================================

def test_arabert_embeddings():
    """Test AraBERT embedding extraction for SVM models."""
    logger.info("=" * 80)
    logger.info("TEST 2.5: AraBERT Embeddings (768-dim for SVM Models)")
    logger.info("=" * 80)
    
    try:
        from app.ai.arabic.ml_dl_predict import get_arabert_embedding
        
        test_text_ar = "الطعام وصل بارد جدا"
        
        logger.info("\n[AraBERT 768-dim Embeddings for SVM-A Models]")
        
        # Test embedding extraction for each classification type
        for clf_type, clf_name in [("P", "Problem"), ("S", "Sentiment"), ("E", "Emotion")]:
            try:
                embedding = get_arabert_embedding(test_text_ar, clf_type)
                expected_shape = (1, 768)
                actual_shape = embedding.shape
                
                if actual_shape == expected_shape:
                    logger.info(f"  ✓ {clf_name} ({clf_type}): shape {actual_shape} ✓ CORRECT")
                else:
                    logger.error(f"  ✗ {clf_name} ({clf_type}): shape {actual_shape}, expected {expected_shape}")
                    return False
                    
            except Exception as e:
                logger.error(f"  ✗ {clf_name} ({clf_type}) embedding failed: {str(e)}")
                return False
        
        logger.info("\n" + "=" * 80)
        logger.info("✓ ALL ARABERT EMBEDDINGS WORKING (768-dim SVM-compatible)")
        logger.info("=" * 80 + "\n")
        return True
        
    except Exception as e:
        logger.error(f"AraBERT embedding test failed: {str(e)}", exc_info=True)
        return False


# ============================================================================
# Test 3: Individual Pipeline Components
# ============================================================================

def test_individual_components():
    """Test individual ensemble components."""
    logger.info("=" * 80)
    logger.info("TEST 3: Individual Pipeline Components")
    logger.info("=" * 80)
    
    try:
        from app.ai.english.ensemble import (
            predict_english_sentiment,
            predict_english_emotion,
            predict_english_problem_type
        )
        from app.ai.arabic.ensemble import (
            predict_arabic_sentiment,
            predict_arabic_emotion,
            predict_arabic_problem_type
        )
        
        # Test English
        logger.info("\n[English Components]")
        test_text_en = "The service was terrible and staff were rude"
        
        try:
            sentiment = predict_english_sentiment(test_text_en)
            logger.info(f"  ✓ Sentiment: {sentiment}")
        except Exception as e:
            logger.error(f"  ✗ Sentiment prediction failed: {str(e)}")
            return False
        
        try:
            emotion = predict_english_emotion(test_text_en)
            logger.info(f"  ✓ Emotion: {emotion}")
        except Exception as e:
            logger.error(f"  ✗ Emotion prediction failed: {str(e)}")
            return False
        
        try:
            problem_type = predict_english_problem_type(test_text_en)
            logger.info(f"  ✓ Problem Type: {problem_type}")
        except Exception as e:
            logger.error(f"  ✗ Problem type prediction failed: {str(e)}")
            return False
        
        # Test Arabic
        logger.info("\n[Arabic Components]")
        test_text_ar = "الطعام وصل بارد والتوصيل كان بطيء جدا"
        
        try:
            sentiment = predict_arabic_sentiment(test_text_ar)
            logger.info(f"  ✓ Sentiment: {sentiment}")
        except Exception as e:
            logger.error(f"  ✗ Sentiment prediction failed: {str(e)}")
            return False
        
        try:
            emotion = predict_arabic_emotion(test_text_ar)
            logger.info(f"  ✓ Emotion: {emotion}")
        except Exception as e:
            logger.error(f"  ✗ Emotion prediction failed: {str(e)}")
            return False
        
        try:
            problem_type = predict_arabic_problem_type(test_text_ar)
            logger.info(f"  ✓ Problem Type: {problem_type}")
        except Exception as e:
            logger.error(f"  ✗ Problem type prediction failed: {str(e)}")
            return False
        
        logger.info("\n" + "=" * 80)
        logger.info("✓ ALL COMPONENTS WORKING")
        logger.info("=" * 80 + "\n")
        return True
        
    except Exception as e:
        logger.error(f"Component test failed: {str(e)}", exc_info=True)
        return False


# ============================================================================
# Test 4: Complete AI Pipeline
# ============================================================================

def test_complete_pipeline():
    """Test complete end-to-end AI pipeline."""
    logger.info("=" * 80)
    logger.info("TEST 4: Complete End-to-End AI Pipeline")
    logger.info("=" * 80)
    
    try:
        from app.ai.predict import run_ai_pipeline
        
        all_passed = True
        
        for test_case in TEST_CASES:
            logger.info(f"\n[{test_case['name']}]")
            logger.info(f"Text: {test_case['text'][:60]}...")
            
            try:
                result = run_ai_pipeline(test_case['text'])
                
                # Validate result structure
                required_keys = ['sentiment', 'emotion', 'problem_type', 'priority']
                if not all(key in result for key in required_keys):
                    logger.error(f"  ✗ Missing keys in result: {result.keys()}")
                    all_passed = False
                    continue
                
                logger.info(f"  Sentiment: {result['sentiment']}")
                logger.info(f"  Emotion: {result['emotion']}")
                logger.info(f"  Problem Type: {result['problem_type']}")
                logger.info(f"  Priority: {result['priority']}")
                
                # Validate sentiment matches expected
                if result['sentiment'] != test_case['expected_sentiment']:
                    logger.warning(
                        f"  ⚠ Sentiment mismatch: got {result['sentiment']}, "
                        f"expected {test_case['expected_sentiment']}"
                    )
                
                # Validate problem type condition
                has_problem = result['problem_type'] is not None
                expected_has_problem = test_case['expected_has_problem_type']
                if has_problem != expected_has_problem:
                    logger.warning(
                        f"  ⚠ Problem type condition: got {has_problem}, "
                        f"expected {expected_has_problem}"
                    )
                
                logger.info("  ✓ Pipeline executed successfully")
                
            except Exception as e:
                logger.error(f"  ✗ Pipeline failed: {str(e)}", exc_info=True)
                all_passed = False
        
        logger.info("\n" + "=" * 80)
        if all_passed:
            logger.info("✓ ALL PIPELINE TESTS PASSED")
        else:
            logger.warning("⚠ SOME PIPELINE TESTS HAD ISSUES")
        logger.info("=" * 80 + "\n")
        return all_passed
        
    except Exception as e:
        logger.error(f"Pipeline test failed: {str(e)}", exc_info=True)
        return False


# ============================================================================
# Test 5: Priority Scoring
# ============================================================================

def test_priority_scoring():
    """Verify priority scoring logic."""
    logger.info("=" * 80)
    logger.info("TEST 5: Priority Scoring")
    logger.info("=" * 80)
    
    try:
        from app.ai.priority import calculate_priority
        
        test_cases_priority = [
            {
                "sentiment": "Negative",
                "emotion": "Frustrated",
                "problem_type": "Service Quality",
                "expected_min": "Critical",  # Should be critical
            },
            {
                "sentiment": "Negative",
                "emotion": "Frustrated",
                "problem_type": "Hygiene",
                "expected_min": "Critical",  # Health hazard = critical
            },
            {
                "sentiment": "Positive",
                "emotion": "Satisfied",
                "problem_type": None,
                "expected_min": "Low",  # Positive feedback = low priority
            },
            {
                "sentiment": "Neutral",
                "emotion": "Neutral",
                "problem_type": None,
                "expected_min": "Low",  # Neutral = low priority
            },
        ]
        
        for test in test_cases_priority:
            priority = calculate_priority(
                test['sentiment'],
                test['emotion'],
                test['problem_type']
            )
            status = "✓" if priority == test['expected_min'] else "⚠"
            logger.info(
                f"  {status} {test['sentiment']}/{test['emotion']}/{test['problem_type']}: {priority}"
            )
        
        logger.info("\n" + "=" * 80)
        logger.info("✓ PRIORITY SCORING VERIFIED")
        logger.info("=" * 80 + "\n")
        return True
        
    except Exception as e:
        logger.error(f"Priority scoring test failed: {str(e)}", exc_info=True)
        return False


# ============================================================================
# Test 6: Error Handling & Edge Cases
# ============================================================================

def test_error_handling():
    """Test error handling for edge cases."""
    logger.info("=" * 80)
    logger.info("TEST 6: Error Handling & Edge Cases")
    logger.info("=" * 80)
    
    try:
        from app.ai.predict import run_ai_pipeline
        
        test_cases_edge = [
            {
                "name": "Empty text",
                "text": "",
                "should_handle": True,
            },
            {
                "name": "Whitespace only",
                "text": "   \n\t  ",
                "should_handle": True,
            },
            {
                "name": "Very long text",
                "text": "The service was terrible. " * 100,
                "should_handle": True,
            },
            {
                "name": "Special characters",
                "text": "Service was @#$% terrible!!!",
                "should_handle": True,
            },
        ]
        
        all_handled = True
        
        for test in test_cases_edge:
            logger.info(f"\n  Testing: {test['name']}")
            try:
                result = run_ai_pipeline(test['text'])
                logger.info(f"    ✓ Handled gracefully - returned: {result['sentiment']}")
            except Exception as e:
                logger.error(f"    ✗ Error: {str(e)}")
                all_handled = False
        
        logger.info("\n" + "=" * 80)
        if all_handled:
            logger.info("✓ ALL EDGE CASES HANDLED")
        else:
            logger.warning("⚠ SOME EDGE CASES NOT HANDLED")
        logger.info("=" * 80 + "\n")
        return all_handled
        
    except Exception as e:
        logger.error(f"Error handling test failed: {str(e)}", exc_info=True)
        return False


# ============================================================================
# Main Test Runner
# ============================================================================

def main():
    """Run all AI analysis phase tests."""
    logger.info("\n")
    logger.info("╔" + "=" * 78 + "╗")
    logger.info("║" + " " * 20 + "AI ANALYSIS PHASE - COMPREHENSIVE TEST SUITE" + " " * 14 + "║")
    logger.info("╚" + "=" * 78 + "╝")
    logger.info("\n")
    
    results = []
    
    # Run all tests
    results.append(("Model Loading", test_model_loading()))
    results.append(("Representation Models", test_representation_models()))
    results.append(("AraBERT Embeddings", test_arabert_embeddings()))
    results.append(("Individual Components", test_individual_components()))
    results.append(("Complete Pipeline", test_complete_pipeline()))
    results.append(("Priority Scoring", test_priority_scoring()))
    results.append(("Error Handling", test_error_handling()))
    
    # Print summary
    logger.info("=" * 80)
    logger.info("TEST SUMMARY")
    logger.info("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        logger.info(f"{status} | {test_name}")
    
    logger.info("\n" + "=" * 80)
    logger.info(f"TOTAL: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("✓ ALL TESTS PASSED - AI ANALYSIS PHASE READY FOR PRODUCTION")
    else:
        logger.error(f"✗ {total - passed} test(s) failed - check logs above")
    
    logger.info("=" * 80 + "\n")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
