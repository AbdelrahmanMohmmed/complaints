"""Model loading utilities for ensemble AI predictions.

With the ensemble architecture, models are loaded on-demand by each language
module (Arabic or English) when their respective modules are imported.
This function validates configuration and logs status.
"""

import logging
import os
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


def load_models(
    sentiment_model_path: str = "",
    emotion_model_path: str = "",
    fasttext_model_path: str = "",
    bert_model_path: str = "",
    roberta_model_path: str = "",
) -> bool:
    """Validate ensemble model configuration and log status.

    With the ensemble architecture, models are loaded on-demand by language modules.
    This function is kept for backward compatibility and validates that required
    paths are configured.

    Args:
        sentiment_model_path: (deprecated) Old parameter, ignored
        emotion_model_path: (deprecated) Old parameter, ignored
        fasttext_model_path: (deprecated) Old parameter, ignored
        bert_model_path: (deprecated) Old parameter, ignored
        roberta_model_path: (deprecated) Old parameter, ignored

    Returns:
        True if required ensemble model paths are configured, False otherwise
    """
    try:
        logger.info("=" * 80)
        logger.info("ENSEMBLE AI MODEL CONFIGURATION VALIDATION")
        logger.info("=" * 80)
        
        # Check Arabic models
        logger.info("\nArabic Models:")
        arabic_models = {
            "FastText": settings.AR_FASTTEXT_PATH,
            "Tokenizer": settings.AR_TOKENIZER_PATH,
            "Problem LR-F": settings.AR_PROBLEM_LR_F_PATH,
            "Problem GRU": settings.AR_PROBLEM_GRU_PATH,
            "Problem LR-A": settings.AR_PROBLEM_LR_A_PATH,
            "Problem SVM-A": settings.AR_PROBLEM_SVM_A_PATH,
            "Emotion LR-F": settings.AR_EMOTION_LR_F_PATH,
            "Emotion BiLSTM": settings.AR_EMOTION_BILSTM_PATH,
            "Emotion LR-A": settings.AR_EMOTION_LR_A_PATH,
            "Emotion SVM-A": settings.AR_EMOTION_SVM_A_PATH,
            "Sentiment LR-F": settings.AR_SENTIMENT_LR_F_PATH,
            "Sentiment BiLSTM": settings.AR_SENTIMENT_BILSTM_PATH,
            "Sentiment SVM-A": settings.AR_SENTIMENT_SVM_A_PATH,
            "Sentiment LR-A": settings.AR_SENTIMENT_LR_A_PATH,
            "AraBERT Problem": settings.AR_ARABERT_PROBLEM_PATH,
            "AraBERT Emotion": settings.AR_ARABERT_EMOTION_PATH,
            "AraBERT Sentiment": settings.AR_ARABERT_SENTIMENT_PATH,
        }
        
        arabic_configured = all(path != "" for path in arabic_models.values())
        for model_name, path in arabic_models.items():
            if path:
                exists = os.path.exists(path)
                status = "✓" if exists else "✗ (FILE NOT FOUND)"
            else:
                exists = False
                status = "✗ (NOT CONFIGURED)"
            logger.info(f"  {status} {model_name}: {path if path else 'NOT CONFIGURED'}")
        
        # Check English models
        logger.info("\nEnglish Models:")
        english_models = {
            "FastText": settings.EN_FASTTEXT_PATH,
            "Tokenizer": settings.EN_TOKENIZER_PATH,
            "Problem LR": settings.EN_PROBLEM_LR_PATH,
            "Problem RF": settings.EN_PROBLEM_RF_PATH,
            "Problem SVM": settings.EN_PROBLEM_SVM_PATH,
            "Emotion BiLSTM": settings.EN_EMOTION_BILSTM_PATH,
            "Emotion LR": settings.EN_EMOTION_LR_PATH,
            "Sentiment SVM": settings.EN_SENTIMENT_SVM_PATH,
            "Sentiment GRU": settings.EN_SENTIMENT_GRU_PATH,
            "RoBERTa Problem": settings.EN_ROBERTA_PROBLEM_PATH,
            "RoBERTa Emotion": settings.EN_ROBERTA_EMOTION_PATH,
            "RoBERTa Sentiment": settings.EN_ROBERTA_SENTIMENT_PATH,
            "BERT Problem": settings.EN_BERT_PROBLEM_PATH,
        }
        
        english_configured = all(path != "" for path in english_models.values())
        for model_name, path in english_models.items():
            if path:
                exists = os.path.exists(path)
                status = "✓" if exists else "✗ (FILE NOT FOUND)"
            else:
                exists = False
                status = "✗ (NOT CONFIGURED)"
            logger.info(f"  {status} {model_name}: {path if path else 'NOT CONFIGURED'}")
        
        logger.info("\n" + "=" * 80)
        if arabic_configured and english_configured:
            logger.info("✓ ALL ENSEMBLE MODELS CONFIGURED AND READY")
            logger.info("=" * 80)
            return True
        elif arabic_configured or english_configured:
            if arabic_configured:
                logger.warning("✓ Arabic ensemble configured, English ensemble NOT CONFIGURED")
            else:
                logger.warning("✓ English ensemble configured, Arabic ensemble NOT CONFIGURED")
            logger.info("=" * 80)
            return True
        else:
            logger.error("✗ NO ENSEMBLE MODELS CONFIGURED")
            logger.error("Please configure model paths in .env file:")
            logger.error("  - Arabic models: AR_FASTTEXT_PATH, AR_TOKENIZER_PATH, AR_LR_F_PATH, etc.")
            logger.error("  - English models: EN_FASTTEXT_PATH, EN_TOKENIZER_PATH, EN_LR_PATH, etc.")
            logger.info("=" * 80)
            return False
    
    except Exception as e:
        logger.error(f"Error validating ensemble configuration: {str(e)}", exc_info=True)
        return False
