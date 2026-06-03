"""Arabic ML/DL model predictions using FastText representation.

Loads trained ML models (LR, SVM) and DL models (GRU, BiLSTM) on first use.
"""

import pickle
import numpy as np
from tensorflow import keras
import logging
import torch
from app.config import settings
from app.ai.arabic.representation import embed_arabic

logger = logging.getLogger(__name__)

# Label mappings
P_LABELS = {0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene",
            3: "Service Quality", 4: "Pricing", 5: "Order Accuracy",
            6: "Bad Atmosphere", 7: "Menu"}
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


def _get_ar_problem_lr_f():
    global ar_problem_lr_f
    if ar_problem_lr_f is None:
        ar_problem_lr_f = _load_model(
            "Arabic Problem Type LR-F", settings.AR_PROBLEM_LR_F_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_problem_lr_f


def _get_ar_problem_gru():
    global ar_problem_gru
    if ar_problem_gru is None:
        ar_problem_gru = _load_model(
            "Arabic Problem Type GRU", settings.AR_PROBLEM_GRU_PATH,
            keras.models.load_model
        )
    return ar_problem_gru


def _get_ar_problem_lr_a():
    global ar_problem_lr_a
    if ar_problem_lr_a is None:
        ar_problem_lr_a = _load_model(
            "Arabic Problem Type LR-A", settings.AR_PROBLEM_LR_A_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_problem_lr_a


def _get_ar_problem_svm_a():
    global ar_problem_svm_a
    if ar_problem_svm_a is None:
        ar_problem_svm_a = _load_model(
            "Arabic Problem Type SVM-A", settings.AR_PROBLEM_SVM_A_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_problem_svm_a


def _get_ar_emotion_lr_f():
    global ar_emotion_lr_f
    if ar_emotion_lr_f is None:
        ar_emotion_lr_f = _load_model(
            "Arabic Emotion LR-F", settings.AR_EMOTION_LR_F_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_emotion_lr_f


def _get_ar_emotion_bilstm():
    global ar_emotion_bilstm
    if ar_emotion_bilstm is None:
        ar_emotion_bilstm = _load_model(
            "Arabic Emotion BiLSTM", settings.AR_EMOTION_BILSTM_PATH,
            keras.models.load_model
        )
    return ar_emotion_bilstm


def _get_ar_emotion_lr_a():
    global ar_emotion_lr_a
    if ar_emotion_lr_a is None:
        ar_emotion_lr_a = _load_model(
            "Arabic Emotion LR-A", settings.AR_EMOTION_LR_A_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_emotion_lr_a


def _get_ar_emotion_svm_a():
    global ar_emotion_svm_a
    if ar_emotion_svm_a is None:
        ar_emotion_svm_a = _load_model(
            "Arabic Emotion SVM-A", settings.AR_EMOTION_SVM_A_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_emotion_svm_a


def _get_ar_sentiment_lr_f():
    global ar_sentiment_lr_f
    if ar_sentiment_lr_f is None:
        ar_sentiment_lr_f = _load_model(
            "Arabic Sentiment LR-F", settings.AR_SENTIMENT_LR_F_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_sentiment_lr_f


def _get_ar_sentiment_bilstm():
    global ar_sentiment_bilstm
    if ar_sentiment_bilstm is None:
        ar_sentiment_bilstm = _load_model(
            "Arabic Sentiment BiLSTM", settings.AR_SENTIMENT_BILSTM_PATH,
            keras.models.load_model
        )
    return ar_sentiment_bilstm


def _get_ar_sentiment_svm_a():
    global ar_sentiment_svm_a
    if ar_sentiment_svm_a is None:
        ar_sentiment_svm_a = _load_model(
            "Arabic Sentiment SVM-A", settings.AR_SENTIMENT_SVM_A_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_sentiment_svm_a


def _get_ar_sentiment_lr_a():
    global ar_sentiment_lr_a
    if ar_sentiment_lr_a is None:
        ar_sentiment_lr_a = _load_model(
            "Arabic Sentiment LR-A", settings.AR_SENTIMENT_LR_A_PATH,
            lambda p: pickle.load(open(p, "rb"))
        )
    return ar_sentiment_lr_a


# ── AraBERT Embedding Extraction ────────────────────────────────────────────

def get_arabert_embedding(text: str, clf_type: str) -> np.ndarray:
    """Extract AraBERT embeddings (768 dims) for SVM models."""
    try:
        from app.ai.arabic.transformer_predict import (
            ar_bert_problem_tokenizer, ar_bert_problem_model,
            ar_bert_emotion_tokenizer, ar_bert_emotion_model,
            ar_bert_sentiment_tokenizer, ar_bert_sentiment_model
        )
        if clf_type == "P":
            tokenizer, model = ar_bert_problem_tokenizer, ar_bert_problem_model
            model_name = "arabert_67 (problem)"
        elif clf_type == "E":
            tokenizer, model = ar_bert_emotion_tokenizer, ar_bert_emotion_model
            model_name = "arabert_70 (emotion)"
        else:
            tokenizer, model = ar_bert_sentiment_tokenizer, ar_bert_sentiment_model
            model_name = "arabert_85 (sentiment)"

        if tokenizer is None or model is None:
            raise RuntimeError(f"AraBERT {model_name} not loaded")

        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs, output_hidden_states=True)
            embedding = outputs.hidden_states[-1][:, 0, :].cpu().numpy()

        return embedding

    except Exception as e:
        logger.error("Error extracting AraBERT embedding (%s): %s", clf_type, e, exc_info=True)
        raise


def predict_arabic_ml(model, text: str, clf_type: str) -> str:
    """Predict using Arabic ML model with appropriate embeddings."""
    try:
        if model is None:
            return "Service Quality" if clf_type == "P" else "Neutral"

        expected_features = model.n_features_in_ if hasattr(model, 'n_features_in_') else None

        if expected_features == 768:
            vec = get_arabert_embedding(text, clf_type)
        else:
            vec = embed_arabic(text, for_ml=True)

        pred = model.predict(vec)[0]
        labels = P_LABELS if clf_type == "P" else S_LABELS if clf_type == "S" else E_LABELS
        return labels[pred]

    except Exception as e:
        logger.error("Error in Arabic ML prediction (%s): %s", clf_type, e, exc_info=True)
        return "Service Quality" if clf_type == "P" else "Neutral"


def predict_arabic_dl(model, text: str, clf_type: str) -> str:
    """Predict using Arabic DL model (GRU, BiLSTM) with FastText embedding."""
    try:
        if model is None:
            return "Service Quality" if clf_type == "P" else "Neutral"

        vec = embed_arabic(text, for_ml=False)
        probs = model.predict(vec, verbose=0)
        idx = np.argmax(probs, axis=1)[0]
        labels = P_LABELS if clf_type == "P" else S_LABELS if clf_type == "S" else E_LABELS
        return labels[idx]

    except Exception as e:
        logger.error("Error in Arabic DL prediction (%s): %s", clf_type, e, exc_info=True)
        return "Service Quality" if clf_type == "P" else "Neutral"


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


ar_problem_lr_f = _LazyModel(_get_ar_problem_lr_f)
ar_problem_gru = _LazyModel(_get_ar_problem_gru)
ar_problem_lr_a = _LazyModel(_get_ar_problem_lr_a)
ar_problem_svm_a = _LazyModel(_get_ar_problem_svm_a)
ar_emotion_lr_f = _LazyModel(_get_ar_emotion_lr_f)
ar_emotion_bilstm = _LazyModel(_get_ar_emotion_bilstm)
ar_emotion_lr_a = _LazyModel(_get_ar_emotion_lr_a)
ar_emotion_svm_a = _LazyModel(_get_ar_emotion_svm_a)
ar_sentiment_lr_f = _LazyModel(_get_ar_sentiment_lr_f)
ar_sentiment_bilstm = _LazyModel(_get_ar_sentiment_bilstm)
ar_sentiment_lr_a = _LazyModel(_get_ar_sentiment_lr_a)
ar_sentiment_svm_a = _LazyModel(_get_ar_sentiment_svm_a)