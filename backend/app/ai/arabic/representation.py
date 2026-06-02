"""Arabic text representation using FastText and Keras tokenizer.

Supports both ML embeddings (FastText vectors) and DL sequences (tokenized & padded).
Models use lazy loading to avoid memory issues at startup.
"""

import fasttext
import pickle
import numpy as np
import logging
from tensorflow.keras.preprocessing.sequence import pad_sequences
from app.config import settings

logger = logging.getLogger(__name__)

_MAX_LEN = 30  # Sequence length for Arabic DL models (GRU, BiLSTM) - IMPORTANT: Different from English (65)

# Lazy loading - models load on first use
_ar_ft_model = None
_ar_tokenizer = None
_ft_model_loaded = False
_tokenizer_loaded = False


def _load_fasttext_model():
    """Lazy load Arabic FastText model."""
    global _ar_ft_model, _ft_model_loaded
    if _ft_model_loaded:
        return _ar_ft_model
    _ft_model_loaded = True
    
    logger.info(f"Loading Arabic FastText model from: {settings.AR_FASTTEXT_PATH}")
    try:
        if not settings.AR_FASTTEXT_PATH:
            raise ValueError("AR_FASTTEXT_PATH environment variable not set")
        _ar_ft_model = fasttext.load_model(settings.AR_FASTTEXT_PATH)
        logger.info(f"✓ Successfully loaded Arabic FastText model")
    except Exception as e:
        logger.error(f"✗ Failed to load Arabic FastText model: {type(e).__name__}: {str(e)}", exc_info=True)
        _ar_ft_model = None
    return _ar_ft_model


def _load_tokenizer():
    """Lazy load Arabic tokenizer."""
    global _ar_tokenizer, _tokenizer_loaded
    if _tokenizer_loaded:
        return _ar_tokenizer
    _tokenizer_loaded = True
    
    logger.info(f"Loading Arabic tokenizer from: {settings.AR_TOKENIZER_PATH}")
    try:
        if not settings.AR_TOKENIZER_PATH:
            raise ValueError("AR_TOKENIZER_PATH environment variable not set")
        with open(settings.AR_TOKENIZER_PATH, "rb") as f:
            _ar_tokenizer = pickle.load(f)
        logger.info(f"✓ Successfully loaded Arabic tokenizer")
    except Exception as e:
        logger.error(f"✗ Failed to load Arabic tokenizer: {type(e).__name__}: {str(e)}", exc_info=True)
        _ar_tokenizer = None
    return _ar_tokenizer


def get_ar_ft_model():
    """Get Arabic FastText model (lazy loaded on first use)."""
    return _load_fasttext_model()


def get_ar_tokenizer():
    """Get Arabic Keras tokenizer (lazy loaded on first use)."""
    return _load_tokenizer()


def embed_arabic(text: str, for_ml: bool = True) -> np.ndarray:
    """
    Generate Arabic text embedding or sequence for ML/DL models.
    
    For ML models: Returns FastText embedding vector (1, 100)
    For DL models: Returns tokenized and padded sequence (1, 65)
    
    Args:
        text: Input Arabic text
        for_ml: If True, return FastText embedding for ML models.
               If False, return padded sequence for DL models (GRU, BiLSTM)
        
    Returns:
        - ML: FastText embedding reshaped to (1, 100)
        - DL: Tokenized and padded sequence (1, 65)
    """
    try:
        if for_ml:
            # For ML models: use FastText embedding directly
            ar_ft_model = get_ar_ft_model()
            if ar_ft_model is None:
                logger.error("Arabic FastText model not loaded")
                raise RuntimeError("Arabic FastText model not loaded")
            
            vector = ar_ft_model.get_sentence_vector(text.lower())
            return vector.reshape(1, -1)
        else:
            # For DL models (GRU, BiLSTM): use tokenized and padded sequences
            ar_tokenizer = get_ar_tokenizer()
            if ar_tokenizer is None:
                logger.error("Arabic tokenizer not loaded for DL sequences")
                raise RuntimeError("Arabic tokenizer not loaded")
            
            # Tokenize and pad sequence
            seq = ar_tokenizer.texts_to_sequences([text])
            if not seq or not seq[0]:
                logger.warning(f"No tokens generated for Arabic text: {text[:50]}")
                seq = [[1]]  # Use default token if empty
            
            padded = pad_sequences(seq, maxlen=_MAX_LEN)
            return padded
            
    except Exception as e:
        logger.error(f"Error embedding Arabic text: {str(e)}", exc_info=True)
        raise
