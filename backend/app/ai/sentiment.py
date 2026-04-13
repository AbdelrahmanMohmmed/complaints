"""
Sentiment analysis using SVM (Hypertuned_SVM2) ML model.
Uses FastText representation for predictions.
"""

import logging
import numpy as np
from .models import get_sentiment_model
from .representation import get_representation

logger = logging.getLogger(__name__)

# Label mapping for SVM output
SENTIMENT_ID2LABEL = {0: "negative", 1: "neutral", 2: "positive"}


def predict_sentiment(text: str) -> str:
    """
    Predict sentiment from text using SVM model.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Sentiment label: "negative", "neutral", or "positive"
    """
    try:
        if not text or text.strip() == "":
            logger.warning("Empty text provided for sentiment prediction")
            return "neutral"

        # Get FastText representation
        vector = get_representation(text)

        # Get sentiment SVM model
        model = get_sentiment_model()

        # Make prediction using SVM
        pred_id = model.predict(vector)[0]
        
        # Try to get probabilities for confidence scoring
        try:
            probs = model.predict_proba(vector)[0]
            logger.info(f"Sentiment probabilities - negative: {probs[0]:.4f}, neutral: {probs[1]:.4f}, positive: {probs[2]:.4f}")
        except:
            probs = None

        # Convert class ID to label
        sentiment = SENTIMENT_ID2LABEL[pred_id]
        confidence = probs[pred_id] if probs is not None else 0.0
        
        logger.info(f"Sentiment prediction: {sentiment} (confidence: {confidence:.4f})")

        return sentiment

    except Exception as e:
        logger.error(f"Error predicting sentiment: {str(e)}", exc_info=True)
        return "neutral"
