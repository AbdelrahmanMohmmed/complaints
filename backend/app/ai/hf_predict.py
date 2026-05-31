"""Hugging Face and CAMeL-based predictors for sentiment and emotion.

This module centralizes the new inference strategy:
- Arabic sentiment: CAMeL-Lab/bert-base-arabic-camelbert-da-sentiment
- English sentiment: Hugging Face text-classification model (configurable)
- Arabic + English emotion: tabularisai/multilingual-emotion-classification

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


def _get_camel_sentiment_analyzer():
    global _camel_sentiment_analyzer

    if _camel_sentiment_analyzer is not None:
        return _camel_sentiment_analyzer

    model_name = (
        os.environ.get("AR_SENTIMENT_HF_MODEL")
        or settings.AR_SENTIMENT_HF_MODEL
        or DEFAULT_AR_SENTIMENT_MODEL
    )

    from camel_tools.sentiment import SentimentAnalyzer

    logger.info("Loading Arabic sentiment analyzer: %s", model_name)
    _camel_sentiment_analyzer = SentimentAnalyzer(model_name)
    return _camel_sentiment_analyzer


def _get_english_sentiment_pipe():
    global _english_sentiment_pipe

    if _english_sentiment_pipe is not None:
        return _english_sentiment_pipe

    model_name = (
        os.environ.get("EN_SENTIMENT_HF_MODEL")
        or settings.EN_SENTIMENT_HF_MODEL
        or DEFAULT_EN_SENTIMENT_MODEL
    )
    _english_sentiment_pipe = get_text_classification_pipeline(
        model_name,
        env_path_var="EN_SENTIMENT_HuggingFace_PATH",
    )
    return _english_sentiment_pipe


def _get_multilingual_emotion_model():
    global _emotion_tokenizer, _emotion_model

    if _emotion_tokenizer is not None and _emotion_model is not None:
        return _emotion_tokenizer, _emotion_model

    model_name = (
        os.environ.get("MULTILINGUAL_EMOTION_HF_MODEL")
        or settings.MULTILINGUAL_EMOTION_HF_MODEL
        or DEFAULT_MULTILINGUAL_EMOTION_MODEL
    )

    logger.info("Loading multilingual emotion model: %s", model_name)
    _emotion_tokenizer = AutoTokenizer.from_pretrained(model_name)
    _emotion_model = AutoModelForSequenceClassification.from_pretrained(model_name)
    _emotion_model.eval()
    return _emotion_tokenizer, _emotion_model


def predict_arabic_sentiment_hf(text: str) -> str:
    try:
        analyzer = _get_camel_sentiment_analyzer()
        prediction = analyzer.predict([text])[0]
        return _normalize_sentiment(prediction)
    except Exception as e:
        logger.error("Arabic HF sentiment prediction failed: %s", str(e), exc_info=True)
        return "Neutral"


def predict_english_sentiment_hf(text: str) -> str:
    try:
        pipe = _get_english_sentiment_pipe()
        prediction = pipe(text)[0]
        return _normalize_sentiment(str(prediction.get("label", "")))
    except Exception as e:
        logger.error(
            "English HF sentiment prediction failed: %s", str(e), exc_info=True
        )
        return "Neutral"


def predict_multilingual_emotion_hf(text: str) -> str:
    try:
        tokenizer, model = _get_multilingual_emotion_model()
        threshold = float(
            os.environ.get("MULTILINGUAL_EMOTION_THRESHOLD")
            or settings.MULTILINGUAL_EMOTION_THRESHOLD
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
            probs = torch.sigmoid(model(**inputs).logits)[0].cpu().numpy()

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
            "Multilingual HF emotion prediction failed: %s", str(e), exc_info=True
        )
        return "Neutral"


def predict_arabic_emotion_hf(text: str) -> str:
    return predict_multilingual_emotion_hf(text)


def predict_english_emotion_hf(text: str) -> str:
    return predict_multilingual_emotion_hf(text)
