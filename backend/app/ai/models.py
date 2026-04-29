"""Model loading utilities for AI predictions.

Loads models from provided paths and provides access to them.
Models can be optionally loaded at startup if paths are configured.
"""

import logging
import os
import pickle
from pathlib import Path
from typing import Optional

import fasttext
import keras
import numpy as np

logger = logging.getLogger(__name__)

# Global model instances
_sentiment_model = None
_emotion_model = None
_ft_model = None
_tokenizer = None
_bert_model = None
_roberta_model = None


# ============================================================================
# Model Loading
# ============================================================================


def load_models(
    sentiment_model_path: str = "",
    emotion_model_path: str = "",
    fasttext_model_path: str = "",
    bert_model_path: str = "",
    roberta_model_path: str = "",
) -> bool:
    """Load all AI models from provided paths.

    Called during application initialization with paths from configuration.
    Models are optional - if a path is empty or file doesn't exist, it's skipped.

    Args:
        sentiment_model_path: Path to sentiment SVM model (.pkl file)
        emotion_model_path: Path to emotion SVM model (.pkle file)
        fasttext_model_path: Path to FastText model (.bin file)
        bert_model_path: Path to BERT problem type model directory
        roberta_model_path: Path to RoBERTa problem type model directory

    Returns:
        True if at least one model was loaded, False if none were loaded
    """
    global _sentiment_model, _emotion_model, _ft_model, _tokenizer
    global _bert_model, _roberta_model

    models_loaded = False

    try:
        logger.info("Loading AI models from provided paths...")

        # Load sentiment model (SVM)
        if sentiment_model_path and os.path.exists(sentiment_model_path):
            try:
                with open(sentiment_model_path, "rb") as f:
                    _sentiment_model = pickle.load(f)
                logger.info(f"Sentiment model loaded: {sentiment_model_path}")
                models_loaded = True
            except Exception as e:
                logger.warning(f"Failed to load sentiment model: {str(e)}")
        elif sentiment_model_path:
            logger.warning(f"Sentiment model path not found: {sentiment_model_path}")

        # Load emotion model (SVM)
        if emotion_model_path and os.path.exists(emotion_model_path):
            try:
                with open(emotion_model_path, "rb") as f:
                    _emotion_model = pickle.load(f)
                logger.info(f"Emotion model loaded: {emotion_model_path}")
                models_loaded = True
            except Exception as e:
                logger.warning(f"Failed to load emotion model: {str(e)}")
        elif emotion_model_path:
            logger.warning(f"Emotion model path not found: {emotion_model_path}")

        # Load FastText model
        if fasttext_model_path and os.path.exists(fasttext_model_path):
            try:
                _ft_model = fasttext.load_model(fasttext_model_path)
                logger.info(f"FastText model loaded: {fasttext_model_path}")
                models_loaded = True
            except Exception as e:
                logger.warning(f"Failed to load FastText model: {str(e)}")
        elif fasttext_model_path:
            logger.warning(f"FastText model path not found: {fasttext_model_path}")

        # Load BERT model
        if bert_model_path and os.path.exists(bert_model_path):
            try:
                from .bert_pred import load_bert_model

                if load_bert_model(bert_model_path):
                    logger.info(f"BERT model loaded: {bert_model_path}")
                    models_loaded = True
                else:
                    logger.warning(f"Failed to load BERT model from: {bert_model_path}")
            except Exception as e:
                logger.warning(f"Could not load BERT model: {str(e)}")
        elif bert_model_path:
            logger.warning(f"BERT model path not found: {bert_model_path}")

        # Load RoBERTa model
        if roberta_model_path and os.path.exists(roberta_model_path):
            try:
                from .roberta_pred import load_roberta_model

                if load_roberta_model(roberta_model_path):
                    logger.info(f"RoBERTa model loaded: {roberta_model_path}")
                    models_loaded = True
                else:
                    logger.warning(f"Failed to load RoBERTa model from: {roberta_model_path}")
            except Exception as e:
                logger.warning(f"Could not load RoBERTa model: {str(e)}")
        elif roberta_model_path:
            logger.warning(f"RoBERTa model path not found: {roberta_model_path}")

        if models_loaded:
            logger.info("AI models loaded successfully")
        else:
            logger.warning("No AI models were loaded. Check configuration paths.")

        return models_loaded

    except Exception as e:
        logger.error(f"Error loading models: {str(e)}", exc_info=True)
        return False


# ============================================================================
# Model Access
# ============================================================================


def get_sentiment_model():
    """Get the loaded sentiment model.

    Raises:
        RuntimeError: If model not loaded
    """
    if _sentiment_model is None:
        raise RuntimeError("Sentiment model not loaded. Configure SENTIMENT_MODEL_PATH in .env")
    return _sentiment_model


def get_emotion_model():
    """Get the loaded emotion model.

    Raises:
        RuntimeError: If model not loaded
    """
    if _emotion_model is None:
        raise RuntimeError("Emotion model not loaded. Configure EMOTION_MODEL_PATH in .env")
    return _emotion_model


def get_ft_model():
    """Get the loaded FastText model.

    Raises:
        RuntimeError: If model not loaded
    """
    if _ft_model is None:
        raise RuntimeError(
            "FastText model not loaded. Configure FASTTEXT_MODEL_PATH in .env"
        )
    return _ft_model


def get_tokenizer():
    """Get the loaded tokenizer.

    Raises:
        RuntimeError: If tokenizer not loaded
    """
    if _tokenizer is None:
        raise RuntimeError("Tokenizer not loaded. Call load_models() first.")
    return _tokenizer


def get_bert_model():
    """Get the loaded BERT model. Returns None if not loaded."""
    return _bert_model


def get_roberta_model():
    """Get the loaded RoBERTa model. Returns None if not loaded."""
    return _roberta_model
