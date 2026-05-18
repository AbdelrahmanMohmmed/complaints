"""
Emotion analysis using SVM ML model.
Uses FastText representation for predictions.
"""

import logging
import numpy as np
from .labels import EMOTION_DEFAULT_LABEL, EMOTION_ID2LABEL
from .models import get_emotion_model
from .representation import get_representation

logger = logging.getLogger(__name__)


def predict_emotion(text: str) -> str:
    """
    Predict emotion from text using SVM model.

    Args:
        text: Input text to analyze

    Returns:
        Emotion label: "frustrated", "neutral", "disgusted", or "satisfied"
    """
    try:
        if not text or text.strip() == "":
            logger.warning("Empty text provided for emotion prediction")
            return EMOTION_DEFAULT_LABEL

        # Get FastText representation
        vector = get_representation(text)

        # Get emotion SVM model
        model = get_emotion_model()

        # Make prediction using SVM
        pred_id = model.predict(vector)[0]

        # Try to get probabilities for confidence scoring
        try:
            probs = model.predict_proba(vector)[0]
            logger.info(
                f"Emotion probabilities - frustrated: {probs[0]:.4f}, neutral: {probs[1]:.4f}, disgusted: {probs[2]:.4f}, satisfied: {probs[3]:.4f}"
            )
        except:
            probs = None

        # Convert class ID to label
        emotion = EMOTION_ID2LABEL.get(pred_id, EMOTION_DEFAULT_LABEL)
        confidence = probs[pred_id] if probs is not None else 0.0

        logger.info(f"Emotion prediction: {emotion} (confidence: {confidence:.4f})")

        return emotion

    except Exception as e:
        logger.error(f"Error predicting emotion: {str(e)}", exc_info=True)
        return EMOTION_DEFAULT_LABEL
