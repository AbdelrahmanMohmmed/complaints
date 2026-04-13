"""
Model loading utilities for AI predictions.
Loads models once at startup and provides access to them.
"""

import logging
import pickle
import os
from pathlib import Path
import numpy as np
import keras
import fasttext

logger = logging.getLogger(__name__)

# Global model instances
_sentiment_model = None
_emotion_model = None
_ft_model = None
_tokenizer = None
_bert_model = None
_roberta_model = None

# Get the app directory
APP_DIR = Path(__file__).parent.parent


def load_models():
    """
    Load all AI models at startup.
    Called once during application initialization.
    """
    global _sentiment_model, _emotion_model, _ft_model, _tokenizer
    global _bert_model, _roberta_model

    try:
        logger.info("Loading AI models...")

        # Load sentiment model (SVM2 - ML model)
        sentiment_path = APP_DIR / "models" / "Hypertuned_SVM2.pkl"
        if sentiment_path.exists():
            with open(sentiment_path, "rb") as f:
                _sentiment_model = pickle.load(f)
            logger.info("Sentiment model (SVM2) loaded successfully")
        else:
            logger.warning(f"Sentiment model not found at {sentiment_path}")

        # Load emotion model (SVM)
        emotion_path = APP_DIR / "models" / "F_Best_Hypertuned_SVM.pkle"
        if emotion_path.exists():
            with open(emotion_path, "rb") as f:
                _emotion_model = pickle.load(f)
            logger.info("Emotion model (SVM) loaded successfully")
        else:
            logger.warning(f"Emotion model not found at {emotion_path}")

        # Load FastText model (used for both sentiment and emotion)
        # Try fasttext_model.bin first, then fasttext.bin
        fasttext_paths = [
            APP_DIR / "models" / "fasttext_model.bin",
            APP_DIR / "models" / "fasttext.bin"
        ]
        
        for ft_path in fasttext_paths:
            if ft_path.exists():
                _ft_model = fasttext.load_model(str(ft_path))
                logger.info(f"FastText model loaded successfully from {ft_path.name}")
                break
        
        if _ft_model is None:
            logger.warning(f"FastText model not found. Tried: {[p.name for p in fasttext_paths]}")

        # Load BERT model for problem type classification
        # Configure the path here - UPDATE PATH IF DIFFERENT
        bert_model_path = r"C:\Users\Aliel\Downloads\Telegram Desktop\probelm_type_models\bert_70"
        if bert_model_path and os.path.exists(bert_model_path):
            try:
                from .bert_pred import load_bert_model
                if load_bert_model(bert_model_path):
                    logger.info("BERT model loaded successfully")
                else:
                    logger.warning(f"Failed to load BERT model from {bert_model_path}")
            except Exception as e:
                logger.warning(f"Could not load BERT model: {str(e)}")
        else:
            logger.warning(f"BERT model not found at: {bert_model_path}")

        # Load RoBERTa model for problem type classification
        # Configure the path here - UPDATE PATH IF DIFFERENT
        roberta_model_path = r"C:\Users\Aliel\Downloads\Telegram Desktop\probelm_type_models\roberta_70"
        if roberta_model_path and os.path.exists(roberta_model_path):
            try:
                from .roberta_pred import load_roberta_model
                if load_roberta_model(roberta_model_path):
                    logger.info("RoBERTa model loaded successfully")
                else:
                    logger.warning(f"Failed to load RoBERTa model from {roberta_model_path}")
            except Exception as e:
                logger.warning(f"Could not load RoBERTa model: {str(e)}")
        else:
            logger.warning(f"RoBERTa model not found at: {roberta_model_path}")

        logger.info("All models loaded")
        return True

    except Exception as e:
        logger.error(f"Error loading models: {str(e)}", exc_info=True)
        return False


def get_sentiment_model():
    """Get the loaded sentiment model."""
    if _sentiment_model is None:
        raise RuntimeError("Sentiment model not loaded. Call load_models() first.")
    return _sentiment_model


def get_emotion_model():
    """Get the loaded emotion model."""
    if _emotion_model is None:
        raise RuntimeError("Emotion model not loaded. Call load_models() first.")
    return _emotion_model


def get_ft_model():
    """Get the loaded FastText model."""
    if _ft_model is None:
        raise RuntimeError("FastText model not loaded. Call load_models() first.")
    return _ft_model


def get_tokenizer():
    """Get the loaded tokenizer."""
    if _tokenizer is None:
        raise RuntimeError("Tokenizer not loaded. Call load_models() first.")
    return _tokenizer


def get_bert_model():
    """Get the loaded BERT model."""
    return _bert_model


def get_roberta_model():
    """Get the loaded RoBERTa model."""
    return _roberta_model
