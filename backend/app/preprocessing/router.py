"""Language detection and routing logic - MINIMAL VERSION (no heavy models)."""

import re
import logging
from typing import Literal

try:
    from langdetect import detect
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False

logger = logging.getLogger(__name__)

# Arabizi (Franco-Arabic) patterns for detection
ARABIZI_PATTERNS = [
    "helw", "gamed", "tohfaa", "kwayes", "7elw", "sa7", "tamam", "mazboot",
    "3ady", "7ar", "7ar2", "nashf", "tayeb", "mestawe", "m3aga", "sa5en",
    "sa2e3", "ratb", "na3em", "saraha", "gdn", "awii", "shwaya", "keda",
    "bas", "lakn", "y3ni", "ba2a",
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


def detect_language(text: str) -> Literal["ar", "en", "franko"]:
    """Detect stored feedback language bucket - FAST, no heavy models."""
    if not text or not text.strip():
        return "en"
    if is_arabizi(text):
        return "franko"
    if contains_arabic_script(text):
        return "ar"
    if LANGDETECT_AVAILABLE:
        try:
            lang = detect(text)
            if lang == "ar":
                return "ar"
        except Exception:
            pass
    return "en"


def _basic_clean(text: str) -> str:
    """Basic text cleaning without any heavy NLP models."""
    if not text:
        return ""
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text)
    # Remove URLs
    text = re.sub(r"http\S+|www\.\S+", "", text)
    # Remove email addresses
    text = re.sub(r"\S+@\S+", "", text)
    # Remove special chars but keep letters, numbers, Arabic, basic punctuation
    text = re.sub(r"[^\w\s\u0600-\u06FF.,!?;:']", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def preprocess_feedback(text: str) -> str:
    """
    Minimal preprocessing - just basic cleaning, no spaCy/Camel loading.
    """
    try:
        return _basic_clean(text)
    except Exception as e:
        logger.error(f"Error in minimal preprocessing: {e}")
        return text


# Backward compatibility - route_pipeline is used by __init__.py
def route_pipeline(text: str) -> Literal["arabic", "english", "franko"]:
    """Route text to appropriate preprocessing pipeline."""
    lang = detect_language(text)
    if lang == "franko":
        return "franko"
    if lang == "ar":
        return "arabic"
    return "english"
