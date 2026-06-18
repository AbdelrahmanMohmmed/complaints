"""Language detection and routing logic - WITH CACHED NLP MODELS."""

import re
import logging
from typing import Literal

try:
    from langdetect import detect
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False

from .arabic import arabic_pipeline
from .english import english_pipeline
from .franko import franko_pipeline

logger = logging.getLogger(__name__)

# Arabizi (Franco-Arabic) patterns for detection
ARABIZI_PATTERNS = [
    "helw", "gamed", "tohfaa", "kwayes", "7elw", "7elwawi", "7elwgedn",
    "sa7", "tamam", "mazboot", "7aga7elwa", "a7la", "mshhelw", "wa7esh",
    "say2", "mshmazboot", "mshkwayes", "mshlazem", "3ady", "msh7elw",
    "7ar", "7ar2", "masale7", "sokar", "meleh", "7amdy", "ta3mo7elw",
    "ta3mokwayes", "nashf", "tayeb", "mestawe", "m3aga", "sa5en",
    "sa2e3", "ratb", "na3em", "saraha", "gdn", "awii", "shwaya",
    "keda", "bas", "lakn", "y3ni", "ba2a",
]


def contains_arabic_script(text: str) -> bool:
    """Return True when the text contains Arabic script characters."""
    return bool(re.search(r"[\u0600-\u06FF]", text))


def is_arabizi(text: str) -> bool:
    """Detect if text is in Arabizi (Franco-Arabic) format."""
    if contains_arabic_script(text):
        return False
    text_lower = text.lower()
    words = text_lower.split()
    matches = sum(1 for word in words if word in ARABIZI_PATTERNS)
    has_arabic_numbers = bool(re.search(r"[23457]", text_lower))
    return matches >= 2 or (matches >= 1 and has_arabic_numbers)


def route_pipeline(text: str) -> Literal["arabic", "english", "franko"]:
    """Route text to appropriate preprocessing pipeline."""
    if is_arabizi(text):
        logger.debug("Detected Arabizi text")
        return "franko"
    if contains_arabic_script(text):
        logger.debug("Detected Arabic script text")
        return "arabic"
    if not LANGDETECT_AVAILABLE:
        logger.debug("langdetect not available, defaulting to English")
        return "english"
    try:
        lang = detect(text)
        if lang == "ar":
            logger.debug("Detected Arabic text")
            return "arabic"
        else:
            logger.debug(f"Detected {lang} text, routing to English pipeline")
            return "english"
    except Exception as e:
        logger.debug(f"Language detection failed: {e}, defaulting to English")
        return "english"


def detect_language(text: str) -> Literal["ar", "en", "franko"]:
    """Detect stored feedback language bucket."""
    pipeline = route_pipeline(text)
    if pipeline == "arabic":
        return "ar"
    if pipeline == "franko":
        return "franko"
    return "en"


def preprocess_feedback(text: str) -> str:
    """
    Preprocess feedback text by routing to appropriate pipeline.
    Uses CACHED models - spaCy/Camel loaded once at startup.
    """
    try:
        pipeline = route_pipeline(text)
        if pipeline == "arabic":
            return arabic_pipeline(text)
        elif pipeline == "franko":
            return franko_pipeline(text)
        else:
            return english_pipeline(text)
    except Exception as e:
        logger.error(f"Error in preprocessing: {e}", exc_info=True)
        return text
