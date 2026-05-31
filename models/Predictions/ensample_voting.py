from ML_DL_pred import predict
from bert_pred import pred_b
from roberta_pred import pred_r
from fasttext_represent import embedd
from collections import Counter
import numpy as np


# Label mapping for each prediction
id2label = {0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene", 3: "Service Quality", 4: "Pricing", 5: "Order Accuracy", 6: "Bad Atmosphere", 7: "Menu"}
S_id2label = {0: "Negative", 1: "Neutral", 2: "Positive"}
E_id2label = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}


def vote(text: str, weights: list, models: list, soft = False, num_models = 5, clf_type = "P"):
    """
    Docstring for vote function:
        1. Ensample vote using 3 models (1 ML model, 1 DL model and 1 RoBERTa model) using hard or weighted soft voting.
        2. Ensample vote using 5 models (3 ML models, 1 BERT model, 1 RoBERTa model) using hard or weighted soft voting.

    Params:
        text: the incoming cleaned feedback text (str).
        weights: a list of weights whether they are integer, float when using weighted soft voting (List).
        models: a list of the machine learning and deep learning models' locations only not RoBERTa & BERT models (List).
        soft: If you want to use weighted soft voting set the value to "True" otherwise leave it as the defualt value "False" (bool).
        num_models: how many models do you want to use for voting 3 models (1 ML model, 1 DL model and 1 RoBERTa model) or 5 (defualt value) models
            (3 ML models, 1 BERT model, 1 RoBERTa model) in this exact order so you can put the models correctly (int).
        clf_type: what type of classification problem "P" for problem type, "S" for sentiment and "E" for emotion classification (str).
    
    Return Values:
        The final ensampled voted output whether using hard voting or soft voting.
    
    """

    # Embedd cleaned text for machine learning prediction
    embedded_text_M = embedd(text = text)
    # Embedd cleaned text for deep learning (GRU, Bi-LSTM only) prediction
    embedded_text_D = embedd(text = text, for_ML = False)

    if num_models == 3:
        if soft:
            # Weighted soft voting
            # ML prediction
            probs1 = predict(model_location=models[0], for_ML = True, prob= True, embedded_text = embedded_text_M, type = clf_type)
            # DL prediction
            probs2 = predict(model_location=models[1], for_ML= False, prob = True, embedded_text = embedded_text_D, type = clf_type)
            # RoBERTa prediction
            probs3 = pred_r(text, prob = True)
            
            w1 = weights[0]
            w2 = weights[1]
            w3 = weights[2]

            weighted_probs = (
                w1 * probs1 +
                w2 * probs2 +
                w3 * probs3 ) / (w1 + w2 + w3)

            # Get the index of the highest probability
            final_pred_weighted = np.argmax(weighted_probs, axis=1)

            if clf_type == "P":
                return id2label[final_pred_weighted[0]]
            elif clf_type == "S":
                return S_id2label[final_pred_weighted[0]]
            elif clf_type == "E":
                return E_id2label[final_pred_weighted[0]]

        if not soft:
            # Hard voting
            # ML prediction
            label1 = predict(model_location=models[0], for_ML = True, prob= False, embedded_text = embedded_text_M, type = clf_type)
            # DL prediction
            label2 = predict(model_location=models[1], for_ML= False, prob = False, embedded_text = embedded_text_D, type = clf_type)
            # RoBERTa prediction
            label3 = pred_r(text, prob = False)

            preds = [label1, label2, label3, label4, label5]
            return Counter(preds).most_common(1)[0][0]
        
    if num_models == 5:
        if soft:
            # Weighted soft voting
            # ML prediction
            probs1 = predict(model_location = models[0], for_ML = True, prob = True, embedded_text = embedded_text_M, type = clf_type)
            probs2 = predict(model_location= models[1], for_ML= True, prob = True, embedded_text = embedded_text_M, type = clf_type)
            probs3 = predict(model_location= models[2], for_ML=True, prob = True, embedded_text = embedded_text_M, type = clf_type)
            # BERT prediction
            probs4 = pred_b(text = text, prob= True)
            # RoBERTa prediction
            probs5 = pred_r(text = text, prob= True)
            
            w1 = weights[0]
            w2 = weights[1]
            w3 = weights[2]
            w4 = weights[3]
            w5 = weights[4]

            weighted_probs = (
                w1 * probs1 +
                w2 * probs2 +
                w3 * probs3 +
                w4 * probs4 +
                w5 * probs5
            ) / (w1 + w2 + w3 + w4 + w5)

            # Get the index of the highest probability
            final_pred_weighted = np.argmax(weighted_probs, axis=1)

            if clf_type == "P":
                return id2label[final_pred_weighted[0]]
            elif clf_type == "S":
                return S_id2label[final_pred_weighted[0]]
            elif clf_type == "E":
                return E_id2label[final_pred_weighted[0]]
            
        if not soft:
            # Hard voting
            label1 = predict(model_location= models[0], for_ML= True, prob = False, embedded_text = embedded_text_M, type = clf_type)
            label2 = predict(model_location= models[1], for_ML= True, prob = False, embedded_text = embedded_text_M, type = clf_type)
            label3 = predict(model_location= models[2], for_ML= True, prob = False, embedded_text = embedded_text_M, type = clf_type)
            # BERT prediction
            label4 = pred_b(text = text)
            # RoBERTa prediction
            label5 = pred_r(text = text)
            
            preds = [label1, label2, label3, label4, label5]
            return Counter(preds).most_common(1)[0][0]
