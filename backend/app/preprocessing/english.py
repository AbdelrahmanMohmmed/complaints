"""English text preprocessing pipeline."""
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
    spell = SpellChecker()
except ImportError:
    SPELLCHECKER_AVAILABLE = False
    spell = None

logger = logging.getLogger(__name__)

# Global spacy model cache
_nlp_model = None


def _get_spacy_model():
    """Load spacy model lazily."""
    global _nlp_model
    
    if _nlp_model is not None:
        return _nlp_model
    
    if not SPACY_AVAILABLE:
        logger.warning("Spacy not available")
        return None
    
    try:
        _nlp_model = spacy.load("en_core_web_md")
        logger.debug("Spacy model loaded")
        return _nlp_model
    except OSError:
        logger.warning("Spacy en_core_web_md model not found. Install with: python -m spacy download en_core_web_md")
        return None


def english_pipeline(text: str) -> str:
    """
    Process English text through cleaning, spell checking, and lemmatization.
    
    Args:
        text: Raw English text
        
    Returns:
        Cleaned and lemmatized English text
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
    
    # Split into words
    words = text.split()
    
    # Spell correction if available
    if SPELLCHECKER_AVAILABLE and spell:
        try:
            corrected_lst = [spell.correction(word) or word for word in words]
            corrected_text = " ".join(corrected_lst)
        except Exception as e:
            logger.debug(f"Spell correction failed: {e}")
            corrected_text = text
    else:
        logger.debug("SpellChecker not available, skipping spell correction")
        corrected_text = text
    
    # Lemmatization with spacy if available
    nlp = _get_spacy_model()
    if nlp:
        try:
            doc = nlp(corrected_text)
            lemmas = [word.lemma_ for word in doc if not word.is_stop]
            return " ".join(lemmas)
        except Exception as e:
            logger.debug(f"Spacy lemmatization failed: {e}")
            return corrected_text
    else:
        logger.debug("Spacy model not available, returning spell-corrected text")
        return corrected_text
