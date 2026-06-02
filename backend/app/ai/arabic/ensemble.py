"""Arabic prediction module.

Optimized for 8GB deployment:
- Problem type: SVM-A only
- Sentiment and emotion: Hugging Face models only
"""

import logging
from app.ai.arabic.ml_dl_predict import (
    predict_arabic_ml,
    ar_problem_svm_a,
)
from app.ai.hf_predict import (
    predict_arabic_emotion_hf,
    predict_arabic_sentiment_hf,
)

logger = logging.getLogger(__name__)


def predict_arabic_problem_type(text: str) -> str:
    """Predict Arabic problem type using SVM-A model."""
    try:
        pred = predict_arabic_ml(ar_problem_svm_a, text, "P")  # SVM-A
        logger.debug(f"Arabic problem type prediction: {pred}")
        return pred
    except Exception as e:
        logger.error(
            f"Error in Arabic problem type prediction: {str(e)}", exc_info=True
        )
        return "Service Quality"


def predict_arabic_emotion(text: str) -> str:
    """Predict Arabic emotion using multilingual Hugging Face model."""
    try:
        return predict_arabic_emotion_hf(text)
    except Exception as e:
        logger.error(f"Error in Arabic emotion prediction: {str(e)}", exc_info=True)
        return "Neutral"


def predict_arabic_sentiment(text: str) -> str:
    """Predict Arabic sentiment using CAMeL Hugging Face model."""
    try:
        return predict_arabic_sentiment_hf(text)
    except Exception as e:
        logger.error(f"Error in Arabic sentiment prediction: {str(e)}", exc_info=True)
        return "Neutral"
