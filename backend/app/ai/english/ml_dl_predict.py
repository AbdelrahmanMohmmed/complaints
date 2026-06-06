"""English ML/DL model predictions using FastText representation.

Loads trained ML models (LR, RF, SVM) and DL models (BiLSTM, GRU) on first use.
"""

import numpy as np
import logging
from scipy.special import softmax
from app.config import settings
from app.ai.english.transformer_predict import embed_english
from app.ai.modelLoad import ModelLoad

logger = logging.getLogger(__name__)

model_loader = ModelLoad()

# ============================
# English Problem Type Models
# ============================

def en_problem_lr():
    """English Problem Type - Logistic Regression"""
    return model_loader.load_pickle(settings.EN_PROBLEM_LR_PATH)


def en_problem_rf():
    """English Problem Type - Random Forest"""
    return model_loader.load_pickle(settings.EN_PROBLEM_RF_PATH)


def en_problem_svm():
    """English Problem Type - SVM"""
    return model_loader.load_pickle(settings.EN_PROBLEM_SVM_PATH)


# ============================
# English Emotion Models
# ============================

def en_emotion_bilstm():
    """English Emotion - BiLSTM"""
    return model_loader.load_keras_model(settings.EN_EMOTION_BILSTM_PATH)


def en_emotion_lr():
    """English Emotion - Logistic Regression"""
    return model_loader.load_pickle(settings.EN_EMOTION_LR_PATH)


# ============================
# English Sentiment Models
# ============================

def en_sentiment_svm():
    """English Sentiment - SVM"""
    return model_loader.load_pickle(settings.EN_SENTIMENT_SVM_PATH)


def en_sentiment_gru():
    """English Sentiment - GRU"""
    return model_loader.load_keras_model(settings.EN_SENTIMENT_GRU_PATH)


# ── Prediction helpers ──────────────────────────────────────────────────────

def predict_english_ml_probs(model, text: str) -> np.ndarray:
    """Get probability predictions from English ML model with FastText embedding."""
    if callable(model):  # ← New check
        model = model()
    if model is None:
        raise RuntimeError("ML model not loaded")
    vec = embed_english(text, for_ml=True)
    try:
        return model.predict_proba(vec)
    except AttributeError:
        if hasattr(model, "decision_function"):
            return softmax(model.decision_function(vec), axis=1)
        raise

