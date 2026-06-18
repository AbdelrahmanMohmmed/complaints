"""AI predictions and priority scoring module with ensemble voting.

Provides:
- Arabic hard voting ensemble (5 models)
- English weighted soft voting ensemble (3-5 models)
- Language-aware orchestration
- Priority scoring using sigmoid-based function

All 9 core models are loaded eagerly at application startup:
- 2 FastText models (English & Arabic)
- 2 Keras tokenizers (English & Arabic)
- 2 problem type models (English SVM & Arabic SVM-A)
- 1 Arabic sentiment model (CAMeL)
- 1 English sentiment model (HuggingFace)
- 1 multilingual emotion model (HuggingFace)
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
