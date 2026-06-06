"""English text preprocessing pipeline."""
import re
import logging
import emoji
import spacy
from spellchecker import SpellChecker
spell = SpellChecker()


logger = logging.getLogger(__name__)


def english_pipeline(text: str) -> str:
    """
    Process English text through cleaning, spell checking, and lemmatization.
    
    Args:
        text: Raw English text
        
    Returns:
        Cleaned and lemmatized English text
    """
    # Remove emojis
    text = emoji.demojize(text)
    # Remove special characters, keep only alphanumeric and spaces
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    
    # Remove single character words
    text = re.sub(r"\b[a-zA-Z]\b", " ", text)
    
    # Normalize whitespace
    text = re.sub(r"\s{2,}", " ", text)
    text = text.strip()
    
    if not text:
        return text

    text = text.lower()
    text = text.replace('\n', ' ').replace('\r', ' ')
    words = text.split()
    
    try:
        corrected_lst = [spell.correction(word) or word for word in words]
        corrected_text = " ".join(corrected_lst)
    except Exception as e:
        logger.debug(f"Spell correction failed: {e}")
        corrected_text = text

    # Lemmatization with spacy if available
    nlp = spacy.load("en_core_web_md")
    try:
        doc = nlp(corrected_text)
        lemmas = [word.lemma_ for word in doc if not word.is_stop]
        return " ".join(lemmas)
    except Exception as e:
        logger.debug(f"Spacy lemmatization failed: {e}")
        return corrected_text

