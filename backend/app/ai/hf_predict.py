"""Hugging Face and CAMeL-based predictors for sentiment and emotion.

This module centralizes the new inference strategy:
- Arabic sentiment: CAMeL-Lab/bert-base-arabic-camelbert-da-sentiment
- English sentiment: Hugging Face text-classification model (configurable)
- Arabic + English emotion: tabularisai/multilingual-emotion-classification

All models are loaded lazily on first use to avoid memory issues.

All functions return labels aligned with the existing priority engine:
- Sentiment: Positive | Neutral | Negative
- Emotion: Frustrated | Neutral | Disgusted | Satisfied
"""

from __future__ import annotations

import logging
import os
from typing import Final

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from app.ai.hf_loader import get_text_classification_pipeline
from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_AR_SENTIMENT_MODEL: Final[str] = (
    "CAMeL-Lab/bert-base-arabic-camelbert-da-sentiment"
)
DEFAULT_EN_SENTIMENT_MODEL: Final[str] = (
    "mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
)
DEFAULT_MULTILINGUAL_EMOTION_MODEL: Final[str] = (
    "tabularisai/multilingual-emotion-classification"
)

MULTILINGUAL_EMOTION_LABELS: Final[list[str]] = [
    "anger",
    "contempt",
    "disgust",
    "fear",
    "frustration",
    "gratitude",
    "joy",
    "love",
    "neutral",
    "sadness",
    "surprise",
]

_camel_sentiment_analyzer = None
_english_sentiment_pipe = None
_emotion_tokenizer = None
_emotion_model = None

_ar_sentiment_loaded = False
_en_sentiment_loaded = False
_emotion_loaded = False


def _normalize_sentiment(label: str) -> str:
    normalized = (label or "").strip().lower()
    if normalized in {"positive", "pos", "label_2", "2", "4"}:
        return "Positive"
    if normalized in {"negative", "neg", "label_0", "0"}:
        return "Negative"
    return "Neutral"


def _map_multilingual_emotion_to_legacy(label: str) -> str:
    key = (label or "").strip().lower()
    if key in {"anger", "frustration", "fear", "sadness"}:
        return "Frustrated"
    if key in {"disgust", "contempt"}:
        return "Disgusted"
    if key in {"joy", "love", "gratitude"}:
        return "Satisfied"
    return "Neutral"


# ============================================================================
# LAZY LOADING: Load models on first use to avoid memory issues at startup
# ============================================================================

def _load_arabic_sentiment_model():
    """Lazy load Arabic sentiment model."""
    global _camel_sentiment_analyzer, _ar_sentiment_loaded
    if _ar_sentiment_loaded:
        return _camel_sentiment_analyzer
    _ar_sentiment_loaded = True
    
    logger.info("Loading Arabic sentiment model...")
    try:
        model_path = (
            os.environ.get("AR_SENTIMENT_HF_MODEL")
            or settings.AR_SENTIMENT_HF_MODEL
            or DEFAULT_AR_SENTIMENT_MODEL
        )
        device = "cuda" if torch.cuda.is_available() else "cpu"
        ar_sentiment_tokenizer = AutoTokenizer.from_pretrained(model_path)
        ar_sentiment_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        ar_sentiment_model.eval()
        _camel_sentiment_analyzer = (ar_sentiment_tokenizer, ar_sentiment_model, device)
        logger.info(f"✓ Successfully loaded Arabic sentiment model from: {model_path}")
    except Exception as e:
        logger.error(f"✗ Failed to load Arabic sentiment model: {str(e)}", exc_info=True)
        _camel_sentiment_analyzer = None
    
    return _camel_sentiment_analyzer


def _load_english_sentiment_model():
    """Lazy load English sentiment model."""
    global _english_sentiment_pipe, _en_sentiment_loaded
    if _en_sentiment_loaded:
        return _english_sentiment_pipe
    _en_sentiment_loaded = True
    
    logger.info("Loading English sentiment model...")
    try:
        model_path = (
            os.environ.get("EN_SENTIMENT_HF_MODEL")
            or settings.EN_SENTIMENT_HF_MODEL
            or DEFAULT_EN_SENTIMENT_MODEL
        )
        device = "cuda" if torch.cuda.is_available() else "cpu"
        en_sentiment_tokenizer = AutoTokenizer.from_pretrained(model_path)
        en_sentiment_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        en_sentiment_model.eval()
        _english_sentiment_pipe = (en_sentiment_tokenizer, en_sentiment_model, device)
        logger.info(f"✓ Successfully loaded English sentiment model from: {model_path}")
    except Exception as e:
        logger.error(f"✗ Failed to load English sentiment model: {str(e)}", exc_info=True)
        _english_sentiment_pipe = None
    
    return _english_sentiment_pipe


def _load_multilingual_emotion_model():
    """Lazy load multilingual emotion model."""
    global _emotion_tokenizer, _emotion_model, _emotion_loaded
    if _emotion_loaded:
        return (_emotion_tokenizer, _emotion_model)
    _emotion_loaded = True
    
    logger.info("Loading multilingual emotion model...")
    try:
        model_path = (
            os.environ.get("MULTILINGUAL_EMOTION_HF_MODEL")
            or settings.MULTILINGUAL_EMOTION_HF_MODEL
            or DEFAULT_MULTILINGUAL_EMOTION_MODEL
        )
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _emotion_tokenizer = AutoTokenizer.from_pretrained(model_path)
        _emotion_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        _emotion_model.eval()
        logger.info(f"✓ Successfully loaded multilingual emotion model from: {model_path}")
    except Exception as e:
        logger.error(f"✗ Failed to load multilingual emotion model: {str(e)}", exc_info=True)
        _emotion_tokenizer = None
        _emotion_model = None
    
    return (_emotion_tokenizer, _emotion_model)


def predict_arabic_sentiment_hf(text: str) -> str:
    try:
        ar_sent = _load_arabic_sentiment_model()
        if ar_sent is None:
            logger.error("Arabic sentiment model not loaded")
            return "Neutral"
        tokenizer, model, device = ar_sent
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(device)
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
            label_id = torch.argmax(probs, dim=1).item()
        # Map to label - assume 3-class sentiment
        labels = {0: "Negative", 1: "Neutral", 2: "Positive"}
        label = labels.get(label_id, "Neutral")
        return _normalize_sentiment(label)
    except Exception as e:
        logger.error("Arabic sentiment prediction failed: %s", str(e), exc_info=True)
        return "Neutral"


def predict_english_sentiment_hf(text: str) -> str:
    try:
        en_sent = _load_english_sentiment_model()
        if en_sent is None:
            logger.error("English sentiment model not loaded")
            return "Neutral"
        tokenizer, model, device = en_sent
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(device)
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
            label_id = torch.argmax(probs, dim=1).item()
        # Map to label - assume 3-class sentiment
        labels = {0: "Negative", 1: "Neutral", 2: "Positive"}
        label = labels.get(label_id, "Neutral")
        return _normalize_sentiment(label)
    except Exception as e:
        logger.error("English sentiment prediction failed: %s", str(e), exc_info=True)
        return "Neutral"


def predict_multilingual_emotion_hf(text: str) -> str:
    try:
        emotion_models = _load_multilingual_emotion_model()
        _emotion_tokenizer, _emotion_model = emotion_models
        if _emotion_tokenizer is None or _emotion_model is None:
            logger.error("Multilingual emotion model not loaded")
            return "Neutral"
        threshold = float(
            os.environ.get("MULTILINGUAL_EMOTION_THRESHOLD")
            or settings.MULTILINGUAL_EMOTION_THRESHOLD
            or 0.5
        )
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        with torch.no_grad():
            inputs = _emotion_tokenizer(
                [text],
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=192,
            ).to(device)
            probs = torch.sigmoid(_emotion_model(**inputs).logits)[0].cpu().numpy()

        picked = [
            (MULTILINGUAL_EMOTION_LABELS[idx], float(score))
            for idx, score in enumerate(probs)
            if score >= threshold
        ]
        picked.sort(key=lambda x: -x[1])

        if picked:
            top_label = picked[0][0]
        else:
            neutral_idx = MULTILINGUAL_EMOTION_LABELS.index("neutral")
            top_label = MULTILINGUAL_EMOTION_LABELS[neutral_idx]

        return _map_multilingual_emotion_to_legacy(top_label)
    except Exception as e:
        logger.error(
            "Multilingual emotion prediction failed: %s", str(e), exc_info=True
        )
        return "Neutral"


def predict_arabic_emotion_hf(text: str) -> str:
    return predict_multilingual_emotion_hf(text)


def predict_english_emotion_hf(text: str) -> str:
    return predict_multilingual_emotion_hf(text)
