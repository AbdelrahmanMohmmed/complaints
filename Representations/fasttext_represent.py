import fasttext
import numpy as np
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle

model = fasttext.load_model("fasttext_model.bin")

max_len = 65
# Change the location of the tokenizer if you have to
with open(r"F:\FMS\Preprocessing and Training\DL_tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

def embedd(text: str, for_ML = True):
    """ 
    Docstring for embedd function: 
        1. Load the pretrained fasttext model.
        2. Load the pretrained tokenizer used with GRU & Bi-LSTM only.
        3. If for ML prediction get the embedding vector right away.
        4. If for deep learning prediction (GRU, Bi-LSTM only), tokenize the input text & pad the sequence.

    Params:
        text: the incoming cleaned/preprocessed feedback or comment (str).
        for_ML: if you want to use the embedding for ML prediction "True" or Deep learning "False" (GRU, Bi-LSTM only) (bool).

    Return Values:
        The embedded text ready for prediction.
    """
    if for_ML:
        return np.array(model.get_sentence_vector(text)).reshape(1, -1)
    else:
        seq = tokenizer.texts_to_sequences([text])
        padded = pad_sequences(seq, maxlen=max_len)
        return padded