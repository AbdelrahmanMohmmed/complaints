"""Arabic text preprocessing pipeline."""
import re
import logging
from pathlib import Path

# Try to import optional dependencies
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

# ─── LOAD ONCE AT MODULE LEVEL ─────────────────────────────────────

# Load stopwords once
_STOPWORDS: set[str] = set()
_stopwords_loaded = False

def _get_stopwords() -> set[str]:
    global _stopwords_loaded, _STOPWORDS
    if _stopwords_loaded:
        return _STOPWORDS

    stopwords_path = Path(__file__).parent / "arabic_stopwords.txt"
    try:
        with open(stopwords_path, "r", encoding="utf-8") as file:
            _STOPWORDS = {line.strip() for line in file if line.strip()}
        logger.debug(f"Loaded {len(_STOPWORDS)} Arabic stopwords")
    except FileNotFoundError:
        logger.warning(f"Stopwords file not found at {stopwords_path}")
    except Exception as e:
        logger.error(f"Error loading stopwords: {e}")

    _stopwords_loaded = True
    return _STOPWORDS


# Load MLE disambiguator once (lazy)
_EGY_MLE = None

def _get_mle():
    global _EGY_MLE
    if _EGY_MLE is None and CAMEL_AVAILABLE:
        try:
            _EGY_MLE = MLEDisambiguator.pretrained("calima-egy-r13")
            logger.info("Loaded camel_tools MLE disambiguator")
        except Exception as e:
            logger.warning(f"Failed to load camel_tools MLE: {e}")
    return _EGY_MLE


# Pre-compiled regex patterns
_ARABIC_DIACRITICS = re.compile(r"[\u0617-\u061A\u064B-\u0652]")
_PUNCTUATION = re.compile(r'[،؛؟.!"#$%&\'()*+,-/:;<=>?@[\]^_`{|}~]')
_SINGLE_CHAR = re.compile(r"\b[\u0600-\u06FF\s]\b")
_WHITESPACE = re.compile(r"\s{2,}")


def arabic_pipeline(text: str) -> str:
    """Fast Arabic text preprocessing."""
    if not text or not text.strip():
        return text

    # Remove emojis
    if EMOJI_AVAILABLE:
        try:
            text = emoji.demojize(text, language="ar")
        except Exception:
            pass

    # Remove diacritics
    text = _ARABIC_DIACRITICS.sub("", text)

    # Remove punctuation
    text = _PUNCTUATION.sub(" ", text)

    # Remove single chars
    text = _SINGLE_CHAR.sub(" ", text)

    # Normalize whitespace
    text = _WHITESPACE.sub(" ", text).strip()

    if not text:
        return text

    # Tokenize
    if NLTK_AVAILABLE:
        try:
            tokens = nltk.word_tokenize(text)
        except Exception:
            tokens = text.split()
    else:
        tokens = text.split()

    # Remove stopwords
    stop_words = _get_stopwords()
    filtered = [w for w in tokens if w not in stop_words]

    if not filtered:
        return ""

    # Lemmatize (optional — skip if model not loaded)
    mle = _get_mle()
    if mle:
        try:
            disambig = mle.disambiguate(filtered)
            lemmas = [d.analyses[0].analysis.get("lex", w) for d, w in zip(disambig, filtered) if d.analyses]
            if lemmas:
                return " ".join(lemmas)
        except Exception as e:
            logger.debug(f"Lemmatization failed: {e}")

    return " ".join(filtered)