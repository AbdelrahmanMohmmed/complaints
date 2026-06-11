"""Language detection and routing logic for preprocessing pipeline."""

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
    "helw",
    "gamed",
    "tohfaa",
    "kwayes",
    "7elw",
    "7elwawi",
    "7elwgedn",
    "sa7",
    "tamam",
    "mazboot",
    "7aga7elwa",
    "a7la",
    "mshhelw",
    "wa7esh",
    "say2",
    "mshmazboot",
    "mshkwayes",
    "mshlazem",
    "3ady",
    "msh7elw",
    "7ar",
    "7ar2",
    "masale7",
    "sokar",
    "meleh",
    "7amdy",
    "ta3mo7elw",
    "ta3mokwayes",
    "nashf",
    "tayeb",
    "mestawe",
    "m3aga",
    "sa5en",
    "sa2e3",
    "ratb",
    "na3em",
    "saraha",
    "gdn",
    "awii",
    "shwaya",
    "keda",
    "bas",
    "lakn",
    "y3ni",
    "ba2a",
]


def contains_arabic_script(text: str) -> bool:
    """Return True when the text contains Arabic script characters."""
    return bool(re.search(r"[\u0600-\u06FF]", text))


def is_arabizi(text: str) -> bool:
    """
    Detect if text is in Arabizi (Franco-Arabic) format.

    Args:
        text: Input text to analyze

    Returns:
        True if text is detected as Arabizi, False otherwise
    """
    # Check if actual Arabic script is present
    if contains_arabic_script(text):
        return False

    # Check for Arabizi patterns
    text_lower = text.lower()
    words = text_lower.split()
    matches = sum(1 for word in words if word in ARABIZI_PATTERNS)
    has_arabic_numbers = bool(re.search(r"[23457]", text_lower))

    # Require 2+ pattern matches, or (1+ matches AND Arabic-style numbers)
    # Pure English text with just numbers won't trigger Arabizi detection
    return matches >= 2 or (matches >= 1 and has_arabic_numbers)


def route_pipeline(text: str) -> Literal["arabic", "english", "franko"]:
    """
    Route text to appropriate preprocessing pipeline based on language detection.

    Args:
        text: Input text to route

    Returns:
        Pipeline name: "franko", "arabic", or "english"
    """
    # First check for Arabizi
    if is_arabizi(text):
        logger.debug("Detected Arabizi text")
        return "franko"

    # If the text already contains Arabic script, keep it on the Arabic path
    # even when langdetect is unavailable or uncertain.
    if contains_arabic_script(text):
        logger.debug("Detected Arabic script text")
        return "arabic"

    # Use langdetect for language detection
    if not LANGDETECT_AVAILABLE:
        logger.warning("langdetect not available, defaulting to English pipeline")
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
        logger.debug(f"Language detection failed: {e}, defaulting to English pipeline")
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

    Args:
        text: Raw feedback text

    Returns:
        Cleaned and preprocessed text
    """
    try:
        pipeline = route_pipeline(text)

        if pipeline == "arabic":
            return arabic_pipeline(text)
        elif pipeline == "franko":
            return franko_pipeline(text)
        else:  # english
            return english_pipeline(text)
    except Exception as e:
        logger.error(f"Error in preprocessing: {e}", exc_info=True)
        return text  # Return original text on error
