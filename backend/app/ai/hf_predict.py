"""Hugging Face predictors for sentiment and emotion.

Loads models from local disk only. Never downloads from Hugging Face Hub.
"""

import logging
import os
from camel_tools.sentiment import SentimentAnalyzer
from transformers import pipeline
from app.config import settings

logger = logging.getLogger(__name__)

# ── Helpers ─────────────────────────────────────────────────────────────────

def _get_path(env_var: str) -> str:
    """Read path from env or settings, fail if missing."""
    path = os.environ.get(env_var) or getattr(settings, env_var.lower(), None)
    if not path:
        raise ValueError(f"{env_var} must be set in .env")
    return path


def _normalize_sentiment(label: str) -> str:
    normalized = (label or "").strip().lower()
    if normalized in {"positive", "pos", "label_2", "2", "4"}:
        return "Positive"
    if normalized in {"negative", "neg", "label_0", "0"}:
        return "Negative"
    return "Neutral"


def _map_emotion_to_legacy(label: str) -> str:
    key = (label or "").strip().lower()
    if key in {"anger", "frustration", "fear", "sadness"}:
        return "Frustrated"
    if key in {"disgust", "contempt"}:
        return "Disgusted"
    if key in {"joy", "love", "gratitude"}:
        return "Satisfied"
    return "Neutral"


# ── Model loaders (lazy, cached) ────────────────────────────────────────────

def _get_ar_sentiment_pipe():
    return SentimentAnalyzer(_get_path("AR_SENTIMENT_HF_MODEL"))

def _get_en_sentiment_pipe():
    return pipeline("text-classification", model=_get_path("EN_SENTIMENT_HF_MODEL"))

def _get_emotion_model():
    name = _get_path("MULTILINGUAL_EMOTION_HF_MODEL")
    return pipeline(
    "text-classification",
    model=name,
    function_to_apply="sigmoid",
    top_k=None,
)

# ── Predictors ──────────────────────────────────────────────────────────────

def predict_arabic_sentiment_hf(text: str) -> str:
    try:
        pipe = _get_ar_sentiment_pipe()
        return pipe.predict(text)[0]
    except Exception as e:
        logger.error("Arabic sentiment failed: %s", e, exc_info=True)
        return "Neutral"


def predict_english_sentiment_hf(text: str) -> str:
    try:
        pipe = _get_en_sentiment_pipe()
        prediction = pipe(text)[0]
        return _normalize_sentiment(str(prediction.get("label", "")))
    except Exception as e:
        logger.error("English sentiment failed: %s", e, exc_info=True)
        return "Neutral"


def predict_multilingual_emotion_hf(text: str) -> str:
    try:
        probs = _get_emotion_model()
        return  _map_emotion_to_legacy(probs(text)[0][0]['label'])
    except Exception as e:
        logger.error("Emotion prediction failed: %s", e, exc_info=True)
        return "Neutral"
