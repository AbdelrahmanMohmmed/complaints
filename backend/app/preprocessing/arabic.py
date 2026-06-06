"""Arabic text preprocessing pipeline."""
import re
import logging
from pathlib import Path
import emoji
import nltk
from camel_tools.disambig.mle import MLEDisambiguator

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


def arabic_pipeline(text: str) -> str:
    """
    Process Arabic text through cleaning, tokenization, and lemmatization.
    
    Args:
        text: Raw Arabic text
        
    Returns:
        Cleaned and lemmatized Arabic text
    """
    # Remove emojis
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

    
    try:
        text_tokens = nltk.word_tokenize(text)
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
    try:
        EGY_mle = MLEDisambiguator.pretrained("calima-egy-r13")
        EGY_disambig = EGY_mle.disambiguate(filtered)
        lemmas = [d.analyses[0].analysis["lex"] for d in EGY_disambig if d.analyses]
    except Exception as e:
        logger.debug(f"Camel tools lemmatization failed: {e}, using original tokens")
        lemmas = filtered
    
    # Join and clean again
    final_text = " ".join(lemmas)
    final_text = re.sub(arabic_diacritics, "", final_text)
    final_text = re.sub(r"\s{2,}", " ", final_text).strip()
    
    return final_text
