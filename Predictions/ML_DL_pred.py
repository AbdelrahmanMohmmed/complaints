from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
import pickle
from tensorflow.keras.models import load_model
import numpy as np


# Label mapping for each prediction
id2label = {0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene", 3: "Service Quality", 4: "Pricing", 5: "Order Accuracy", 6: "Bad Atmosphere", 7: "Menu"}
S_id2label = {0: "Negative", 1: "Neutral", 2: "Positive"}
E_id2label = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}


def predict (model_location: str, embedded_text, type = "S", for_ML = True, prob = False):
    """
     Docstring for predict function: 
        1. Load the pretrained model whether it's ML or DL (GRU, Bi-LSTM only).
        2. Checking the right classification type (emotion, sentiment or problem type).
        3. Convert the predcited class id into the approperate label.

    Params:
        model_location: the location of the trained ML or DL model (str).
        embedded_text: the incoming feedback or comment after vectorization or embedding.
        type: the type of classification ("S" for sentiment, "E" for emotion and "P" for problem type) (str).
        for_ML: if you want to predict using either ML "True" or DL (GRU, Bi-LSTM only) "False" (bool).
        prob: if you want to predict the probabilities of the classes (bool, default "False").

    Return Values:
        The final prediction label or labels' probabilities.
    """
    # Choosing whether to use ML or DL (GRU, Bi-LSTM only)
    if for_ML:
        with open(model_location, "rb") as f:
            model = pickle.load(f)
        if prob:
            pred_probs = model.predict_proba(embedded_text)
            return pred_probs
        else:
            pred_id = int(model.predict(embedded_text)[0])
    else:
        model = load_model(model_location)
        probs = model.predict(embedded_text)
        if prob:
            return probs
        else:
            # convert probabilities → class id
            pred_id = int(np.argmax(probs, axis=1)[0])

    # Choosing the correct the classifciation type whether it's (sentiment, emotion or problem type)
    if type == "S":
        return S_id2label[pred_id]
    elif type == "E":
        return E_id2label[pred_id]
    elif type == "P":
        return id2label[pred_id]
    else:
        raise ValueError("Value must be either S for sentiment prediction, E for emotion prediction or P for problem type prediction")
