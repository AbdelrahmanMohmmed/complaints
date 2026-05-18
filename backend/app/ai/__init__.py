"""AI predictions and priority scoring module with ensemble voting.

Provides:
- Arabic hard voting ensemble (5 models)
- English weighted soft voting ensemble (3-5 models)
- Language-aware orchestration
- Priority scoring using sigmoid-based function

Models are loaded on-demand by language modules when imported.
No need to pre-load all models at startup.
"""

from .models import load_models
from .labels import (
    EMOTION_ID2AR_LABEL,
    EMOTION_ID2LABEL,
    PROBLEM_TYPE_ID2AR_LABEL,
    PROBLEM_TYPE_ID2LABEL,
)

__all__ = [
    "load_models",
    "PROBLEM_TYPE_ID2LABEL",
    "PROBLEM_TYPE_ID2AR_LABEL",
    "EMOTION_ID2LABEL",
    "EMOTION_ID2AR_LABEL",
]
