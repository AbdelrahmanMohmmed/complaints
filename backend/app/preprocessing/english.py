"""English text preprocessing pipeline - CACHED MODELS (load once, use forever)."""
import re
import logging

try:
    import emoji
    EMOJI_AVAILABLE = True
except ImportError:
    EMOJI_AVAILABLE = False

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

try:
    from spellchecker import SpellChecker
    SPELLCHECKER_AVAILABLE = True
except ImportError:
    SPELLCHECKER_AVAILABLE = False

logger = logging.getLogger(__name__)

# ============================================================================
# LOAD MODELS ONCE AT MODULE IMPORT TIME
# ============================================================================

logger.info("[English] Loading NLP models into memory...")

_nlp_model = None
_spell_checker = None

try:
    if SPACY_AVAILABLE:
        _nlp_model = spacy.load("en_core_web_md")
        logger.info("[English] ✓ spaCy model loaded")
    else:
        logger.warning("[English] spaCy not available")
except OSError:
    logger.warning("[English] spaCy model 'en_core_web_md' not found. Install: python -m spacy download en_core_web_md")
except Exception as e:
    logger.warning(f"[English] spaCy load failed: {e}")

try:
    if SPELLCHECKER_AVAILABLE:
        _spell_checker = SpellChecker()
        logger.info("[English] ✓ SpellChecker loaded")
except Exception as e:
    logger.warning(f"[English] SpellChecker load failed: {e}")


def english_pipeline(text: str) -> str:
    """
    Process English text through cleaning, spell checking, and lemmatization.
    Uses CACHED models - no loading per call.
    """
    # Remove emojis
    if EMOJI_AVAILABLE:
        try:
            text = emoji.demojize(text)
        except Exception:
            pass

    # Remove special characters, keep only alphanumeric and spaces
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    # Remove single character words
    text = re.sub(r"\b[a-zA-Z]\b", " ", text)

    # Normalize whitespace
    text = re.sub(r"\s{2,}", " ", text)
    text = text.strip()

    if not text:
        return text

    # Convert to lowercase
    text = text.lower()

    # Spell correction (cached)
    if _spell_checker:
        try:
            words = text.split()
            corrected = [_spell_checker.correction(word) or word for word in words]
            text = " ".join(corrected)
        except Exception:
            pass

    # Lemmatization with cached spacy model
    if _nlp_model:
        try:
            doc = _nlp_model(text)
            lemmas = [word.lemma_ for word in doc if not word.is_stop]
            return " ".join(lemmas)
        except Exception:
            return text

    return text
