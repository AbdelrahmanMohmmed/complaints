"""
Text representation using FastText for ML model predictions.
FastText converts text directly to vector representation (100-dim).
"""

import logging
import numpy as np
from .models import get_ft_model

logger = logging.getLogger(__name__)


def get_representation(text: str) -> np.ndarray:
    """
    Convert text to FastText vector representation for ML models.
    
    Uses FastText to convert raw text to a 100-dimensional vector.
    This representation is used for both sentiment (SVM) and emotion (LR) predictions.
    
    Args:
        text: Input text to convert (str)
        
    Returns:
        FastText vector of shape (1, 100) ready for ML model input
    """
    try:
        if not text or text.strip() == "":
            logger.warning("Empty text provided for representation")
            # Return zero vector for empty text
            return np.zeros((1, 100), dtype=np.float32)
        
        ft_model = get_ft_model()
        
        # Get FastText sentence vector (100-dimensional)
        vector = ft_model.get_sentence_vector(text)
        
        # Reshape to (1, 100) for model input
        vector_reshaped = vector.reshape(1, -1)
        
        logger.debug(f"FastText representation shape: {vector_reshaped.shape}")
        
        return vector_reshaped

    except Exception as e:
        logger.error(f"Error getting text representation: {str(e)}", exc_info=True)
        # Return zero vector as fallback
        return np.zeros((1, 100), dtype=np.float32)
