"""Fixed preprocessing router with proper async handling."""

import re
import logging
import time
import asyncio
from typing import Literal

try:
    from langdetect import detect
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False
    detect = None

from .arabic import arabic_pipeline
from .english import english_pipeline
from .franko import franko_pipeline

logger = logging.getLogger(__name__)

_lang_cache: dict[str, str] = {}
_CACHE_MAX_SIZE = 1000

ARABIZI_PATTERNS = [
    "helw", "gamed", "tohfaa", "kwayes", "7elw", "7elwawi", "7elwgedn",
    "sa7", "tamam", "mazboot", "7aga7elwa", "a7la", "mshhelw", "wa7esh",
    # ... rest of patterns ...
]

_ARABIC_REGEX = re.compile(r"[\u0600-\u06FF]")
_ARABIZI_NUMBERS_REGEX = re.compile(r"[23457]")


def contains_arabic_script(text: str) -> bool:
    return bool(_ARABIC_REGEX.search(text))


def is_arabizi(text: str) -> bool:
    if contains_arabic_script(text):
        return False

    text_lower = text.lower()
    words = text_lower.split()
    matches = sum(1 for word in words if word in ARABIZI_PATTERNS)

    if matches == 0:
        return False

    has_numbers = bool(_ARABIZI_NUMBERS_REGEX.search(text_lower))
    return matches >= 2 or (matches >= 1 and has_numbers)


def fast_detect_language(text: str) -> str:
    cache_key = text[:100]
    if cache_key in _lang_cache:
        return _lang_cache[cache_key]

    if contains_arabic_script(text):
        _lang_cache[cache_key] = "ar"
        return "ar"

    if len(text) < 20:
        english_words = {"the", "and", "is", "to", "of", "a", "in", "that", "have", "it"}
        words = text.lower().split()
        if any(w in english_words for w in words):
            _lang_cache[cache_key] = "en"
            return "en"

    if not LANGDETECT_AVAILABLE:
        _lang_cache[cache_key] = "en"
        return "en"

    try:
        sample = text[:500]
        start = time.time()
        lang = detect(sample)
        elapsed = time.time() - start

        if elapsed > 2.0:
            logger.warning(f"langdetect slow: {elapsed:.2f}s")

        if len(_lang_cache) > _CACHE_MAX_SIZE:
            _lang_cache.clear()
        _lang_cache[cache_key] = lang

        return lang
    except Exception as e:
        logger.debug(f"Detection failed: {e}")
        return "en"


def route_pipeline(text: str) -> Literal["arabic", "english", "franko"]:
    if is_arabizi(text):
        return "franko"
    if contains_arabic_script(text):
        return "arabic"

    lang = fast_detect_language(text)
    return "arabic" if lang == "ar" else "english"


# ============================================================================
# FIXED: Proper async preprocessing with thread pool
# ============================================================================

async def preprocess_feedback(text: str) -> str:
    """
    Async preprocessing with timeout and thread pool execution.
    """
    if not text or not text.strip():
        return text

    start_time = time.time()

    try:
        pipeline = route_pipeline(text)

        # Run sync pipelines in thread pool
        loop = asyncio.get_running_loop()

        if pipeline == "arabic":
            result = await asyncio.wait_for(
                loop.run_in_executor(None, arabic_pipeline, text),
                timeout=8.0
            )
        elif pipeline == "franko":
            result = await asyncio.wait_for(
                loop.run_in_executor(None, franko_pipeline, text),
                timeout=8.0
            )
        else:
            result = await asyncio.wait_for(
                loop.run_in_executor(None, english_pipeline, text),
                timeout=8.0
            )

        total_time = time.time() - start_time
        if total_time > 5.0:
            logger.warning(f"Preprocessing slow: {total_time:.2f}s for {len(text)} chars")

        return result or text

    except asyncio.TimeoutError:
        logger.warning(f"Preprocessing timeout for {len(text)} chars")
        return text
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        return text