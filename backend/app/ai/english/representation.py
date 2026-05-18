"""English text representation using FastText and Keras tokenizer.

Lazy loads FastText model and tokenizer on first use to avoid memory exhaustion at startup.
Supports both ML embeddings (FastText vectors) and DL sequences (tokenized & padded).
"""

import fasttext
import pickle
import numpy as np
import logging
from tensorflow.keras.preprocessing.sequence import pad_sequences
from app.config import settings

logger = logging.getLogger(__name__)

# Lazy loading with singleton pattern
_en_ft_model = None
_en_tokenizer = None
_models_loaded = False
_MAX_LEN = 65  # Sequence length for DL models (GRU, BiLSTM)


def _load_english_models():
    """Lazy load English FastText model and tokenizer on first use."""
    global _en_ft_model, _en_tokenizer, _models_loaded
    
    if _models_loaded:
        return
    
    _models_loaded = True
    
    try:
        logger.info(f"Attempting to load English FastText from: {settings.EN_FASTTEXT_PATH}")
        if not settings.EN_FASTTEXT_PATH:
            raise ValueError("EN_FASTTEXT_PATH environment variable not set")
        _en_ft_model = fasttext.load_model(settings.EN_FASTTEXT_PATH)
        logger.info(f"✓ Successfully loaded English FastText model from {settings.EN_FASTTEXT_PATH}")
    except Exception as e:
        logger.error(f"✗ Failed to load English FastText model: {type(e).__name__}: {str(e)}", exc_info=True)
        _en_ft_model = None

    try:
        logger.info(f"Attempting to load English tokenizer from: {settings.EN_TOKENIZER_PATH}")
        if not settings.EN_TOKENIZER_PATH:
            raise ValueError("EN_TOKENIZER_PATH environment variable not set")
        with open(settings.EN_TOKENIZER_PATH, "rb") as f:
            _en_tokenizer = pickle.load(f)
        logger.info(f"✓ Successfully loaded English tokenizer from {settings.EN_TOKENIZER_PATH}")
    except Exception as e:
        logger.error(f"✗ Failed to load English tokenizer: {type(e).__name__}: {str(e)}", exc_info=True)
        _en_tokenizer = None


def get_en_ft_model():
    """Get English FastText model, loading lazily if needed."""
    _load_english_models()
    return _en_ft_model


def get_en_tokenizer():
    """Get English Keras tokenizer, loading lazily if needed."""
    _load_english_models()
    return _en_tokenizer


def embed_english(text: str, for_ml: bool = True) -> np.ndarray:
    """
    Generate English text embedding or sequence for ML/DL models.
    
    For ML models: Returns FastText embedding vector (1, 100)
    For DL models: Returns tokenized and padded sequence (1, 65)
    
    Args:
        text: Input English text
        for_ml: If True, return FastText embedding for ML models.
               If False, return padded sequence for DL models (GRU, BiLSTM)
        
    Returns:
        - ML: FastText embedding reshaped to (1, 100)
        - DL: Tokenized and padded sequence (1, 65)
    """
    try:
        if for_ml:
            # For ML models: use FastText embedding directly
            en_ft_model = get_en_ft_model()
            if en_ft_model is None:
                logger.error("English FastText model not loaded")
                raise RuntimeError("English FastText model not loaded")
            
            vector = en_ft_model.get_sentence_vector(text.lower())
            return vector.reshape(1, -1)
        else:
            # For DL models (GRU, BiLSTM): use tokenized and padded sequences
            en_tokenizer = get_en_tokenizer()
            if en_tokenizer is None:
                logger.error("English tokenizer not loaded for DL sequences")
                raise RuntimeError("English tokenizer not loaded")
            
            # Tokenize and pad sequence
            seq = en_tokenizer.texts_to_sequences([text])
            if not seq or not seq[0]:
                logger.warning(f"No tokens generated for English text: {text[:50]}")
                seq = [[1]]  # Use default token if empty
            
            padded = pad_sequences(seq, maxlen=_MAX_LEN)
            return padded
            
    except Exception as e:
        logger.error(f"Error embedding English text: {str(e)}", exc_info=True)
        raise
