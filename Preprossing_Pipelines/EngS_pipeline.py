# Related imports
import emoji
import re
import spacy
from spellchecker import SpellChecker

# Load an instance of the spellchecker
spell = SpellChecker()
# Load the spacy model
nlp = spacy.load("en_core_web_md")

def clean_prep_text(text):
    """
    Docstring for clean_prep_text function:
        1. Detects emojis and converts them into text.
        2. Cleans text via regex by finding specific patterens and special characters and using lowercasing. 
        3. Prepares text by using word tokenize, removing stop words and using lemmatization.
    
    Params:
        text: the complaint or review

    Return Values: 
        The final cleaned and preprocessed text ready for text representation
    """
    # Convert emojis into text if available
    text = emoji.demojize(text)
    # Replace special characters with a space --> " "
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    # Replace any one char with a space
    text = re.sub(r"\b[a-zA-z]\b", " ", text)
    # Replace multiple number of spaces with one space
    text = re.sub(r"\s{2,}", " ", text)
    # Lowercasing every word
    text = text.lower()
    # Transform the text into a list of words to be able to do a spell checking/correction
    text = text.split()
    
    # Spell checking each word
    corrected_lst = [spell.correction(word) or word for word in text]
    # Transforming the list into a string since spacy expects a string 
    corrected_text = " ".join(corrected_lst)

    # Process the text using the spacy model
    doc = nlp(corrected_text)

    # Tokenize the text, removing stop words and using lemmatization 
    lemmas = [word.lemma_ for word in doc if not word.is_stop]

    # Glueing the words to form a full string
    final_text = " ".join(lemmas)
    return final_text
