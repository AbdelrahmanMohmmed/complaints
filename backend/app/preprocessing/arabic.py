"""Arabic text preprocessing pipeline."""
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


def _load_stopwords() -> set:
    """
    Load Arabic stopwords from file.
    
    Returns:
        Set of Arabic stopwords
    """
    stop_words = set()
    stopwords_path = Path(__file__).parent / "arabic_stopwords.txt"
    
    try:
        with open(stopwords_path, "r", encoding="utf-8") as file:
            for line in file:
                word = line.strip()
                if word:
                    stop_words.add(word)
        logger.debug(f"Loaded {len(stop_words)} Arabic stopwords")
    except FileNotFoundError:
        logger.warning(f"Stopwords file not found at {stopwords_path}")
    except Exception as e:
        logger.error(f"Error loading stopwords: {e}")
    
    return stop_words


@lru_cache(maxsize=1)
def _load_camel_disambiguator():
    """Load camel disambiguator once, or return None if resources missing."""
    if not CAMEL_AVAILABLE:
        return None
    try:
        return MLEDisambiguator.pretrained("calima-egy-r13")
    except Exception as e:
        logger.debug(f"Camel tools resource unavailable: {e}")
        return None


def arabic_pipeline(text: str) -> str:
    """
    Process Arabic text through cleaning, tokenization, and lemmatization.
    
    Args:
        text: Raw Arabic text
        
    Returns:
        Cleaned and lemmatized Arabic text
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
    text = re.sub(r'[،؛؟.!"#$%&\'()*+,-/:;<=>?@[\]^_`{|}~]', ' ', text)
    
    # Remove single character  words
    text = re.sub(r"\b[\u0600-\u06FF\s]\b", " ", text)
    
    # Normalize whitespace
    text = re.sub(r"\s{2,}", " ", text)
    text = text.strip()
    
    if not text:
        return text
    
    # Tokenization
    if not NLTK_AVAILABLE:
        logger.warning("NLTK not available, returning whitespace-split text")
        return text
    
    try:
        from nltk.tokenize import wordpunct_tokenize

        text_tokens = wordpunct_tokenize(text)
    except Exception as e:
        logger.debug(f"NLTK tokenization failed: {e}, using split()")
        text_tokens = text.split()
    
    # Load stopwords
    stop_words = _load_stopwords()
    
    # Filter stopwords
    filtered = [word for word in text_tokens if word not in stop_words]
    
    if not filtered:
        return ""
    
    # Lemmatization with camel_tools if available
    if CAMEL_AVAILABLE:
        try:
            EGY_mle = _load_camel_disambiguator()
            if EGY_mle is None:
                lemmas = filtered
            else:
                EGY_disambig = EGY_mle.disambiguate(filtered)
                lemmas = [
                    d.analyses[0].analysis["lex"] for d in EGY_disambig if d.analyses
                ]
        except Exception as e:
            logger.debug(f"Camel tools lemmatization failed: {e}, using original tokens")
            lemmas = filtered
    else:
        logger.debug("Camel tools not available, using original tokens")
        lemmas = filtered
    
    # Join and clean again
    final_text = " ".join(lemmas)
    final_text = re.sub(arabic_diacritics, "", final_text)
    final_text = re.sub(r"\s{2,}", " ", final_text).strip()
    
    return final_text
