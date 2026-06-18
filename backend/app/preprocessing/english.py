"""English text preprocessing pipeline - OPTIMIZED with model caching."""
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
# CACHE MODELS AT MODULE LEVEL - Load once, reuse forever
# ============================================================================

_nlp_model = None
_spell_checker = None
_model_loading_attempted = False

def _load_models():
    """Load spaCy and spellchecker models once at module level."""
    global _nlp_model, _spell_checker, _model_loading_attempted

    if _model_loading_attempted:
        return  # Already tried, don't retry

    _model_loading_attempted = True

    if SPACY_AVAILABLE:
        try:
            _nlp_model = spacy.load("en_core_web_md")
            logger.info("✓ spaCy model loaded and cached")
        except OSError:
            logger.warning("spacy en_core_web_md not found. Install with: python -m spacy download en_core_web_md")

    if SPELLCHECKER_AVAILABLE:
        try:
            _spell_checker = SpellChecker()
            logger.info("✓ SpellChecker loaded and cached")
        except Exception as e:
            logger.warning(f"SpellChecker failed to load: {e}")

# Load models on first import
_load_models()


def english_pipeline(text: str) -> str:
    """
    Process English text through cleaning, spell checking, and lemmatization.
    Uses cached models for speed.
    """
    # Remove emojis
    if EMOJI_AVAILABLE:
        try:
            text = emoji.demojize(text)
        except Exception as e:
            logger.debug(f"Emoji removal failed: {e}")

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
        except Exception as e:
            logger.debug(f"Spell correction failed: {e}")

    # Lemmatization with cached spacy model
    if _nlp_model:
        try:
            doc = _nlp_model(text)
            lemmas = [word.lemma_ for word in doc if not word.is_stop]
            return " ".join(lemmas)
        except Exception as e:
            logger.debug(f"Spacy lemmatization failed: {e}")
            return text

    return text
