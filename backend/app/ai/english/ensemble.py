"""English prediction module.

Optimized for 8GB deployment:
- Problem type: SVM only
- Sentiment and emotion: Hugging Face models only
"""

import logging
from app.ai.english.ml_dl_predict import (
    predict_english_ml_probs,
    en_problem_svm,
)
from app.ai.hf_predict import (
    predict_english_emotion_hf,
    predict_english_sentiment_hf,
)

logger = logging.getLogger(__name__)

# Label mappings for English models
P_LABELS = {
    0: "Delivery Issue",
    1: "Food Quality",
    2: "Hygiene",
    3: "Service Quality",
    4: "Pricing",
    5: "Order Accuracy",
    6: "Bad Atmosphere",
    7: "Menu",
}


def predict_english_problem_type(text: str) -> str:
    """
    Predict English problem type using SVM model.

    Args:
        text: Input English text

    Returns:
        Predicted problem type label
    """
    try:
        probs = predict_english_ml_probs(en_problem_svm, text)
        import numpy as np
        final_idx = np.argmax(probs, axis=1)[0]
        final_pred = P_LABELS[final_idx]

        logger.debug(f"English problem type SVM prediction: {final_pred}")
        return final_pred

    except Exception as e:
        logger.error(
            f"Error in English problem type prediction: {str(e)}", exc_info=True
        )
        return "Service Quality"


def predict_english_emotion(text: str) -> str:
    """Predict English emotion using multilingual Hugging Face model."""
    try:
        return predict_english_emotion_hf(text)

    except Exception as e:
        logger.error(f"Error in English emotion prediction: {str(e)}", exc_info=True)
        return "Neutral"


def predict_english_sentiment(text: str) -> str:
    """Predict English sentiment using Hugging Face model."""
    try:
        return predict_english_sentiment_hf(text)

    except Exception as e:
        logger.error(f"Error in English sentiment prediction: {str(e)}", exc_info=True)
        return "Neutral"
