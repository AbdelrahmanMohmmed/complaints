"""AI predictions and priority scoring module.

Provides sentiment analysis, emotion detection, priority scoring, and problem type classification.
Models are loaded from paths configured in environment variables.
"""

from .models import (
    get_bert_model,
    get_emotion_model,
    get_ft_model,
    get_roberta_model,
    get_sentiment_model,
    get_tokenizer,
    load_models,
)
from .labels import (
    EMOTION_ID2AR_LABEL,
    EMOTION_ID2LABEL,
    PROBLEM_TYPE_ID2AR_LABEL,
    PROBLEM_TYPE_ID2LABEL,
)

__all__ = [
    "load_models",
    "get_sentiment_model",
    "get_emotion_model",
    "get_ft_model",
    "get_tokenizer",
    "get_bert_model",
    "get_roberta_model",
    "PROBLEM_TYPE_ID2LABEL",
    "PROBLEM_TYPE_ID2AR_LABEL",
    "EMOTION_ID2LABEL",
    "EMOTION_ID2AR_LABEL",
]
