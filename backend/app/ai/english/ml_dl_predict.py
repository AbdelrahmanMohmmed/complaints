"""English ML/DL model predictions using FastText representation.

Loads trained ML models (LR, RF, SVM) and DL models (BiLSTM, GRU) on first use.
"""

import pickle
import numpy as np
from tensorflow import keras
import logging
from scipy.special import softmax
from app.config import settings
from app.ai.english.representation import embed_english

logger = logging.getLogger(__name__)

# Label mappings
P_LABELS = {
    0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene",
    3: "Service Quality", 4: "Pricing", 5: "Order Accuracy",
    6: "Bad Atmosphere", 7: "Menu",
}
S_LABELS = {0: "Negative", 1: "Neutral", 2: "Positive"}
E_LABELS = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}

# ── Lazy-loaded model instances ─────────────────────────────────────────────


def _load_model(name: str, path: str, loader):
    """Load a model with logging. Returns None on failure."""
    try:
        model = loader(path)
        logger.info("Loaded %s from %s", name, path)
        return model
    except Exception as e:
        logger.error("Failed to load %s: %s", name, e)
        return None


def _get_en_problem_lr():
    global en_problem_lr
    if en_problem_lr is None:
        en_problem_lr = _load_model(
            "English Problem Type LR", settings.EN_PROBLEM_LR_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return en_problem_lr


def _get_en_problem_rf():
    global en_problem_rf
    if en_problem_rf is None:
        en_problem_rf = _load_model(
            "English Problem Type RF", settings.EN_PROBLEM_RF_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return en_problem_rf


def _get_en_problem_svm():
    global en_problem_svm
    if en_problem_svm is None:
        en_problem_svm = _load_model(
            "English Problem Type SVM", settings.EN_PROBLEM_SVM_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return en_problem_svm


def _get_en_emotion_bilstm():
    global en_emotion_bilstm
    if en_emotion_bilstm is None:
        en_emotion_bilstm = _load_model(
            "English Emotion BiLSTM", settings.EN_EMOTION_BILSTM_PATH,
            keras.models.load_model
        )
    return en_emotion_bilstm


def _get_en_emotion_lr():
    global en_emotion_lr
    if en_emotion_lr is None:
        en_emotion_lr = _load_model(
            "English Emotion LR", settings.EN_EMOTION_LR_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return en_emotion_lr


def _get_en_sentiment_svm():
    global en_sentiment_svm
    if en_sentiment_svm is None:
        en_sentiment_svm = _load_model(
            "English Sentiment SVM", settings.EN_SENTIMENT_SVM_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return en_sentiment_svm


def _get_en_sentiment_gru():
    global en_sentiment_gru
    if en_sentiment_gru is None:
        en_sentiment_gru = _load_model(
            "English Sentiment GRU", settings.EN_SENTIMENT_GRU_PATH,
            keras.models.load_model
        )
    return en_sentiment_gru


# ── Prediction helpers ──────────────────────────────────────────────────────

def predict_english_ml_probs(model, text: str) -> np.ndarray:
    """Get probability predictions from English ML model with FastText embedding."""
    if model is None:
        raise RuntimeError("ML model not loaded")
    vec = embed_english(text, for_ml=True)
    try:
        return model.predict_proba(vec)
    except AttributeError:
        if hasattr(model, "decision_function"):
            return softmax(model.decision_function(vec), axis=1)
        raise


def predict_english_dl_probs(model, text: str) -> np.ndarray:
    """Get probability predictions from English DL model with FastText embedding."""
    if model is None:
        raise RuntimeError("DL model not loaded")
    vec = embed_english(text, for_ml=False)
    return model.predict(vec, verbose=0)


# Lazy-loading wrappers for backward compatibility
class _LazyModel:
    def __init__(self, getter):
        self._getter = getter
        self._model = None

    def _load(self):
        if self._model is None:
            self._model = self._getter()
        return self._model

    def predict(self, *args, **kwargs):
        return self._load().predict(*args, **kwargs)

    def predict_proba(self, *args, **kwargs):
        return self._load().predict_proba(*args, **kwargs)

    def decision_function(self, *args, **kwargs):
        return self._load().decision_function(*args, **kwargs)

    def __getattr__(self, name):
        return getattr(self._load(), name)


# Replace None placeholders with lazy loaders
en_problem_lr = _LazyModel(_get_en_problem_lr)
en_problem_rf = _LazyModel(_get_en_problem_rf)
en_problem_svm = _LazyModel(_get_en_problem_svm)
en_emotion_bilstm = _LazyModel(_get_en_emotion_bilstm)
en_emotion_lr = _LazyModel(_get_en_emotion_lr)
en_sentiment_svm = _LazyModel(_get_en_sentiment_svm)
en_sentiment_gru = _LazyModel(_get_en_sentiment_gru)