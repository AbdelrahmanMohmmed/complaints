"""
This module is deprecated and will be removed in a future version.

The AI model loading and configuration has been simplified and is now handled
directly within the respective predictor services:
- app.ai.arabic_predictor
- app.ai.english_predictor
"""

import logging

logger = logging.getLogger(__name__)

def load_models(*args, **kwargs) -> bool:
    """
    This function is deprecated and will be removed in a future version.
    It no longer performs any operations but returns True for backward
    compatibility.
    """
    logger.warning(
        "The `load_models` function in app.ai.models is deprecated and no longer has any effect."
    )
    return True

