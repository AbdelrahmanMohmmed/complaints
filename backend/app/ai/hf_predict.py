"""Hugging Face predictors for sentiment and emotion.

Loads models from local disk only. Never downloads from Hugging Face Hub.
"""

import logging
import os
from pathlib import Path

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

from app.config import settings

logger = logging.getLogger(__name__)

# ── Cached model instances ────────────────────────────────────────────────

_ar_sentiment_pipe = None
_en_sentiment_pipe = None
_emotion_tokenizer = None
_emotion_model = None


# ── Helpers ─────────────────────────────────────────────────────────────────

def _get_path(env_var: str) -> str:
    """Read path from env or settings, fail if missing."""
    path = os.environ.get(env_var) or getattr(settings, env_var.lower(), None)
    if not path:
        raise ValueError(f"{env_var} must be set in .env")
    return path


def _load_local_pipeline(model_path: str, task: str = "text-classification"):
    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(f"Model not found at {path}")
    logger.info("Loading pipeline from local path: %s", path)
    return pipeline(task, model=str(path), tokenizer=str(model_path))


def _load_local_model_and_tokenizer(model_path: str):
    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(f"Model not found at {path}")
    logger.info("Loading model+tokenizer from local path: %s", path)
    tokenizer = AutoTokenizer.from_pretrained(str(path), local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(str(path), local_files_only=True)
    model.eval()
    return tokenizer, model


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
    global _ar_sentiment_pipe
    if _ar_sentiment_pipe is None:
        path = _get_path("AR_SENTIMENT_HF_PATH")
        _ar_sentiment_pipe = _load_local_pipeline(path)
    return _ar_sentiment_pipe


def _get_en_sentiment_pipe():
    global _en_sentiment_pipe
    if _en_sentiment_pipe is None:
        path = _get_path("EN_SENTIMENT_HF_PATH")
        _en_sentiment_pipe = _load_local_pipeline(path)
    return _en_sentiment_pipe


def _get_emotion_model():
    global _emotion_tokenizer, _emotion_model
    if _emotion_tokenizer is None or _emotion_model is None:
        path = _get_path("MULTILINGUAL_EMOTION_HF_PATH")
        _emotion_tokenizer, _emotion_model = _load_local_model_and_tokenizer(path)
    return _emotion_tokenizer, _emotion_model


# ── Predictors ──────────────────────────────────────────────────────────────

def predict_arabic_sentiment_hf(text: str) -> str:
    try:
        pipe = _get_ar_sentiment_pipe()
        prediction = pipe(text)[0]
        return _normalize_sentiment(str(prediction.get("label", "")))
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
        tokenizer, model = _get_emotion_model()
        threshold = float(
            os.environ.get("MULTILINGUAL_EMOTION_THRESHOLD")
            or settings.multilingual_emotion_threshold
            or 0.5
        )

        with torch.no_grad():
            inputs = tokenizer(
                [text],
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=192,
            )
            logits = model(**inputs).logits
            probs = torch.sigmoid(logits)[0].cpu().numpy()

        labels = [
            "anger", "contempt", "disgust", "fear", "frustration",
            "gratitude", "joy", "love", "neutral", "sadness", "surprise",
        ]
        picked = [(labels[i], float(p)) for i, p in enumerate(probs) if p >= threshold]
        picked.sort(key=lambda x: -x[1])

        top = picked[0][0] if picked else "neutral"
        return _map_emotion_to_legacy(top)
    except Exception as e:
        logger.error("Emotion prediction failed: %s", e, exc_info=True)
        return "Neutral"


def predict_arabic_emotion_hf(text: str) -> str:
    return predict_multilingual_emotion_hf(text)


def predict_english_emotion_hf(text: str) -> str:
    return predict_multilingual_emotion_hf(text)