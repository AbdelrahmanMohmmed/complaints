"""Franko (Franco-Arabic) text preprocessing pipeline."""
import logging
import time
from functools import lru_cache

# Try to import requests
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from .arabic import arabic_pipeline

logger = logging.getLogger(__name__)

# ─── CACHE & CONFIG ───────────────────────────────────────────────

# Cache Franko→Arabic conversions
_franko_cache: dict[str, str] = {}
_CACHE_MAX_SIZE = 500

# Module-level flag (must be declared BEFORE any function uses it)
_ENABLE_FRANKO_API = True


def _franko_to_arabic(text: str) -> str:
    """Convert Franko to Arabic with caching and timeout."""
    global _ENABLE_FRANKO_API  # ← NOW this works because it's declared above

    if not REQUESTS_AVAILABLE or not _ENABLE_FRANKO_API:
        return text

    # Check cache
    if text in _franko_cache:
        return _franko_cache[text]

    url = "https://inputtools.google.com/request"
    params = {
        "itc": "ar-t-i0-und", "num": 1, "cp": 0, "cs": 1,
        "ie": "utf-8", "oe": "utf-8", "app": "test"
    }

    try:
        start = time.time()
        response = requests.post(
            url,
            params=params,
            data={"text": text},
            timeout=3
        )
        elapsed = time.time() - start

        if elapsed > 2.0:
            logger.warning(f"Google Transliteration API slow: {elapsed:.2f}s")

        response.raise_for_status()
        data = response.json()

        if data and len(data) > 1 and data[0] == "SUCCESS":
            suggestions = data[1][0]
            if len(suggestions) > 1:
                arabic = suggestions[1][0] if isinstance(suggestions[1], list) else suggestions[1]
                if arabic and arabic != text:
                    # Cache result
                    if len(_franko_cache) > _CACHE_MAX_SIZE:
                        _franko_cache.clear()
                    _franko_cache[text] = arabic
                    return arabic

        return text

    except requests.Timeout:
        logger.warning("Google Transliteration API timeout — disabling Franko API")
        _ENABLE_FRANKO_API = False  # ← Now this works
        return text
    except Exception as e:
        logger.debug(f"Franko conversion failed: {e}")
        return text


def franko_pipeline(text: str) -> str:
    """Fast Franko preprocessing with fallback."""
    if not text or not text.strip():
        return text

    # Try conversion
    arabic_text = _franko_to_arabic(text)

    # If conversion failed or returned same text, process as-is
    if not arabic_text or arabic_text == text:
        return text

    # Process through Arabic pipeline
    return arabic_pipeline(arabic_text)