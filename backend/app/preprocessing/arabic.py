"""Arabic text preprocessing pipeline - CACHED MODELS (load once, use forever)."""
import re
import logging
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
# LOAD MODELS ONCE AT MODULE IMPORT TIME
# ============================================================================

logger.info("[Arabic] Loading NLP models into memory...")

_stop_words = set()
_camel_disambiguator = None

try:
    stopwords_path = Path(__file__).parent / "arabic_stopwords.txt"
    with open(stopwords_path, "r", encoding="utf-8") as file:
        for line in file:
            word = line.strip()
            if word:
                _stop_words.add(word)
    logger.info(f"[Arabic] ✓ Loaded {len(_stop_words)} stopwords")
except FileNotFoundError:
    logger.warning(f"[Arabic] Stopwords file not found at {stopwords_path}")
except Exception as e:
    logger.warning(f"[Arabic] Stopwords load failed: {e}")

try:
    if CAMEL_AVAILABLE:
        _camel_disambiguator = MLEDisambiguator.pretrained("calima-egy-r13")
        logger.info("[Arabic] ✓ Camel MLEDisambiguator loaded")
    else:
        logger.warning("[Arabic] Camel tools not available")
except Exception as e:
    logger.warning(f"[Arabic] Camel load failed: {e}")


def arabic_pipeline(text: str) -> str:
    """
    Process Arabic text through cleaning, tokenization, and lemmatization.
    Uses CACHED models - no loading per call.
    """
    # Remove emojis
    if EMOJI_AVAILABLE:
        try:
            text = emoji.demojize(text, language="ar")
        except Exception:
            pass

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
        except Exception:
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
        except Exception:
            final_text = " ".join(tokens)
    else:
        final_text = " ".join(tokens)

    # Clean again
    final_text = re.sub(arabic_diacritics, "", final_text)
    final_text = re.sub(r"\s{2,}", " ", final_text).strip()

    return final_text
