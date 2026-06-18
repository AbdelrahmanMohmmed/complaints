"""Arabic text preprocessing pipeline - OPTIMIZED with model caching."""
import re
import logging
from functools import lru_cache
from pathlib import Path

try:
    import emoji
    EMOJI_AVAILABLE = True
except ImportError:
    EMOJI_AVAILABLE = False

try:
    import nltk
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

try:
    from camel_tools.disambig.mle import MLEDisambiguator
    CAMEL_AVAILABLE = True
except ImportError:
    CAMEL_AVAILABLE = False

logger = logging.getLogger(__name__)

# ============================================================================
# CACHE EVERYTHING AT MODULE LEVEL
# ============================================================================

_stop_words = None
_camel_disambiguator = None
_model_loading_attempted = False

def _load_models():
    """Load Arabic models once at module level."""
    global _stop_words, _camel_disambiguator, _model_loading_attempted

    if _model_loading_attempted:
        return
    _model_loading_attempted = True

    # Load stopwords
    _stop_words = set()
    stopwords_path = Path(__file__).parent / "arabic_stopwords.txt"
    try:
        with open(stopwords_path, "r", encoding="utf-8") as file:
            for line in file:
                word = line.strip()
                if word:
                    _stop_words.add(word)
        logger.info(f"✓ Loaded {len(_stop_words)} Arabic stopwords")
    except FileNotFoundError:
        logger.warning(f"Stopwords file not found at {stopwords_path}")
    except Exception as e:
        logger.error(f"Error loading stopwords: {e}")

    # Load camel disambiguator
    if CAMEL_AVAILABLE:
        try:
            _camel_disambiguator = MLEDisambiguator.pretrained("calima-egy-r13")
            logger.info("✓ Camel MLEDisambiguator loaded and cached")
        except Exception as e:
            logger.debug(f"Camel tools resource unavailable: {e}")

# Load on import
_load_models()


def arabic_pipeline(text: str) -> str:
    """
    Process Arabic text through cleaning, tokenization, and lemmatization.
    Uses cached models for speed.
    """
    # Remove emojis
    if EMOJI_AVAILABLE:
        try:
            text = emoji.demojize(text, language="ar")
        except Exception as e:
            logger.debug(f"Emoji removal failed: {e}")

    # Remove Arabic diacritics
    arabic_diacritics = re.compile(r"[\u0617-\u061A\u064B-\u0652]")
    text = re.sub(arabic_diacritics, "", text)

    # Remove punctuation
    text = re.sub(r'[،؛؟.!"#$%&\'()*+,-/:;<=>?@[\]^_`{|}~]', " ", text)

    # Remove single character words
    text = re.sub(r"\b[\u0600-\u06FF\s]\b", " ", text)

    # Normalize whitespace
    text = re.sub(r"\s{2,}", " ", text)
    text = text.strip()

    if not text:
        return text

    # Tokenization
    if NLTK_AVAILABLE:
        try:
            from nltk.tokenize import wordpunct_tokenize
            tokens = wordpunct_tokenize(text)
        except Exception as e:
            logger.debug(f"NLTK tokenization failed: {e}")
            tokens = text.split()
    else:
        tokens = text.split()

    # Filter stopwords (cached)
    if _stop_words:
        tokens = [word for word in tokens if word not in _stop_words]

    if not tokens:
        return ""

    # Lemmatization with cached camel_tools
    if _camel_disambiguator:
        try:
            disambiguated = _camel_disambiguator.disambiguate(tokens)
            lemmas = [
                d.analyses[0].analysis["lex"] for d in disambiguated if d.analyses
            ]
            final_text = " ".join(lemmas)
        except Exception as e:
            logger.debug(f"Camel lemmatization failed: {e}")
            final_text = " ".join(tokens)
    else:
        final_text = " ".join(tokens)

    # Clean again
    final_text = re.sub(arabic_diacritics, "", final_text)
    final_text = re.sub(r"\s{2,}", " ", final_text).strip()

    return final_text
