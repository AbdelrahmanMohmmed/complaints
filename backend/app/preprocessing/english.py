"""English text preprocessing pipeline."""
import re
import logging

# Try to import optional dependencies
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
    SPELL_AVAILABLE = True
except ImportError:
    SPELL_AVAILABLE = False

logger = logging.getLogger(__name__)

# ─── LOAD MODELS ONCE ───────────────────────────────────────────────

# Load spaCy model once (lazy)
_NLP = None

def _get_nlp():
    global _NLP
    if _NLP is None and SPACY_AVAILABLE:
        try:
            _NLP = spacy.load("en_core_web_md")
            logger.info("Loaded spaCy English model")
        except Exception as e:
            logger.warning(f"Failed to load spaCy model: {e}")
    return _NLP


# Load spell checker once (lazy)
_SPELL = None

def _get_spell():
    global _SPELL
    if _SPELL is None and SPELL_AVAILABLE:
        try:
            _SPELL = SpellChecker()
        except Exception as e:
            logger.warning(f"Failed to load spell checker: {e}")
    return _SPELL


# Pre-compiled regex
_NON_ALPHANUM = re.compile(r"[^a-zA-Z0-9\s]")
_SINGLE_CHAR = re.compile(r"\b[a-zA-Z]\b")
_WHITESPACE = re.compile(r"\s{2,}")


def english_pipeline(text: str) -> str:
    """Fast English text preprocessing."""
    if not text or not text.strip():
        return text

    # Remove emojis
    if EMOJI_AVAILABLE:
        try:
            text = emoji.demojize(text)
        except Exception:
            pass

    # Remove special chars
    text = _NON_ALPHANUM.sub(" ", text)

    # Remove single chars
    text = _SINGLE_CHAR.sub(" ", text)

    # Normalize whitespace
    text = _WHITESPACE.sub(" ", text).strip()

    if not text:
        return text

    text = text.lower()
    text = text.replace('\n', ' ').replace('\r', ' ').strip()
    # Remove multiple spaces
    text = ' '.join(text.split())
    words = text.split()

    # Spell check (optional)
    spell = _get_spell()
    if spell:
        try:
            words = [spell.correction(w) or w for w in words]
        except Exception:
            pass

    # Lemmatize (optional)
    nlp = _get_nlp()
    if nlp:
        try:
            doc = nlp(" ".join(words))
            lemmas = [w.lemma_ for w in doc if not w.is_stop]
            if lemmas:
                return " ".join(lemmas)
        except Exception as e:
            logger.debug(f"Lemmatization failed: {e}")

    return " ".join(words)