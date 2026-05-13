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

__all__ = ["load_models"]
