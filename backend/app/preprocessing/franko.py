"""Franko (Franco-Arabic) text preprocessing pipeline."""
import logging
import re

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from .arabic import arabic_pipeline

logger = logging.getLogger(__name__)


def franko_pipeline(text: str) -> str:
    """
    Convert Franko text to Arabic using Google Transliteration API,
    then apply Arabic pipeline.
    
    Args:
        text: Raw Franko (Franco-Arabic) text
        
    Returns:
        Cleaned and processed text
    """
    if not REQUESTS_AVAILABLE:
        logger.warning("requests library not available, returning original text")
        return text
    
    # Convert Franko to Arabic using Google API
    arabic_text = _franko_to_arabic(text)
    
    if not arabic_text or arabic_text == text:
        # If conversion failed or returned same text, try to process as-is
        logger.debug("Franko to Arabic conversion failed or returned original text")
        return text
    
    # Process the converted Arabic text through Arabic pipeline
    return arabic_pipeline(arabic_text)


def _franko_to_arabic(text: str) -> str:
    """
    Convert Franko text to Arabic using Google Transliteration API.
    
    Args:
        text: Franko text to convert
        
    Returns:
        Arabic text or original text if conversion fails
    """
    url = "https://inputtools.google.com/request"
    params = {
        "itc": "ar-t-i0-und",
        "num": 1,
        "cp": 0,
        "cs": 1,
        "ie": "utf-8",
        "oe": "utf-8",
        "app": "test"
    }
    payload = {"text": text}
    
    try:
        response = requests.post(
            url,
            params=params,
            data=payload,
            timeout=10
        )
        response.raise_for_status()
        
        data = response.json()
        
        # Check if API returned success
        if data and len(data) > 0 and data[0] == "SUCCESS":
            # Extract Arabic text from response
            if len(data) > 1 and len(data[1]) > 0:
                suggestions = data[1][0]
                if len(suggestions) > 1:
                    arabic_text = suggestions[1][0] if isinstance(suggestions[1], list) else suggestions[1]
                    logger.debug(f"Successfully converted Franko to Arabic")
                    return arabic_text
        
        logger.debug("API did not return expected success response")
        return text
        
    except requests.RequestException as e:
        logger.warning(f"Error calling Google Transliteration API: {e}")
        return text
    except (IndexError, KeyError, ValueError) as e:
        logger.warning(f"Error parsing API response: {e}")
        return text
    except Exception as e:
        logger.error(f"Unexpected error in Franko to Arabic conversion: {e}", exc_info=True)
        return text
