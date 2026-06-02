"""English ML/DL model predictions using FastText representation.

Loads trained ML models (LR, RF, SVM) and DL models (BiLSTM, GRU) once at startup.
IMPORTANT: Different models for each task (Problem Type, Emotion, Sentiment).
"""

import pickle
import numpy as np
from tensorflow import keras
import logging
from scipy.special import softmax
from app.config import settings
from app.ai.english.representation import embed_english

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
S_LABELS = {0: "Negative", 1: "Neutral", 2: "Positive"}
E_LABELS = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}

# ============================================================================
# Problem Type Models
# ============================================================================
en_problem_lr = None
en_problem_rf = None
en_problem_svm = None

# Only load SVM for problem type (others disabled to save memory)
try:
    en_problem_svm = pickle.load(open(settings.EN_PROBLEM_SVM_PATH, "rb"))
    logger.info(
        f"Loaded English Problem Type SVM model from {settings.EN_PROBLEM_SVM_PATH}"
    )
except Exception as e:
    logger.error(f"Failed to load English Problem Type SVM model: {str(e)}")

# ============================================================================
# Emotion Models (DISABLED - using HuggingFace models only)
# ============================================================================
en_emotion_bilstm = None
en_emotion_lr = None

# ============================================================================
# Sentiment Models (DISABLED - using HuggingFace models only)
# ============================================================================
en_sentiment_svm = None
en_sentiment_gru = None


def predict_english_ml_probs(model, text: str) -> np.ndarray:
    """
    Get probability predictions from English ML model with FastText embedding.

    Handles SVM models trained without probability=True by using decision_function + softmax.

    Args:
        model: Loaded scikit-learn model (LR, RF, SVM)
        text: Input English text

    Returns:
        Probability array of shape (1, num_classes)
    """
    try:
        if model is None:
            logger.error("ML model not loaded for English ML probability prediction")
            raise RuntimeError("ML model not loaded")

        vec = embed_english(text, for_ml=True)

        # Try predict_proba first (works for LR, RF, and SVM with probability=True)
        try:
            return model.predict_proba(vec)
        except AttributeError:
            # Fallback for SVM without probability support
            if hasattr(model, "decision_function"):
                logger.debug(
                    "Using decision_function + softmax fallback for SVM without probability"
                )
                decision_scores = model.decision_function(vec)
                return softmax(decision_scores, axis=1)
            else:
                logger.error("Model has no predict_proba or decision_function")
                raise
    except Exception as e:
        logger.error(f"Error getting English ML probabilities: {str(e)}", exc_info=True)
        raise


def predict_english_dl_probs(model, text: str) -> np.ndarray:
    """
    Get probability predictions from English DL model (BiLSTM, GRU) with FastText embedding.

    Args:
        model: Loaded Keras DL model
        text: Input English text

    Returns:
        Probability array of shape (1, num_classes)
    """
    try:
        if model is None:
            logger.error("DL model not loaded for English DL probability prediction")
            raise RuntimeError("DL model not loaded")

        vec = embed_english(text, for_ml=False)
        return model.predict(vec, verbose=0)
    except Exception as e:
        logger.error(f"Error getting English DL probabilities: {str(e)}", exc_info=True)
        raise
