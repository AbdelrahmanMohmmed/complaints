# Related imports
import re
import nltk
import emoji
from camel_tools.disambig.mle import MLEDisambiguator

arabic_diacritics = re.compile(r"[\u0617-\u061A\u064B-\u0652]")

# Reading stop words from a file
file_path = r'F:\list.txt'
stop_words = set()
with open(file_path, "r", encoding="utf-8") as file:
    for line in file:
        stop_words.add(line.strip())

# Loading the pretrained EGY model for lemmatization
EGY_mle = MLEDisambiguator.pretrained("calima-egy-r13")

special_chars = r'[،؛؟.!"#$%&\'()*+,-/:;<=>?@[\]^_`{|}~]'

def clean_prep_text(text):
    """
    Docstring for clean_prep_text function:
        1. Detects emojis and converts them into text.
        2. Cleans text via regex by finding specific patterens, special characters and arabic diacritics. 
        3. Prepares text by using word tokenize, removing stop words and using lemmatization.
    
    Params:
        text: the complaint or review

    Return Values: 
        The final cleaned and preprocessed text ready for text representation
    """
    text = emoji.demojize(text, language="ar")
    # Remove diacritics ضمه, فتحه, كسره
    text = re.sub(arabic_diacritics, "", text)
    # Remove special characters
    text = re.sub(special_chars, ' ', text)
    # Remove a single character
    text = re.sub(r"\b[\u0600-\u06FF\s]\b", " ", text)
    # Remove duplicate spaces
    text = re.sub(r"\s{2,}", " ", text)

    # Tokenizing the text as word tokens
    text_tokens = nltk.word_tokenize(text)

    # Removing stop words
    filtered = [word for word in text_tokens if word not in stop_words]

    # Lemmatizing words 
    EGY_disambig = EGY_mle.disambiguate(filtered)
    lemmas = [d.analyses[0].analysis["lex"] for d in EGY_disambig]

    # Glueing the words to form a full string
    final_text = " ".join(lemmas)
    # Remove diacritics ضمه, فتحه, كسره again since the produced lemmas have it
    final_text = re.sub(arabic_diacritics, "", final_text)
    return final_text