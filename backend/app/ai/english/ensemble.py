"""English ensemble prediction using weighted soft voting.

Problem Type (5 models): RoBERTa(2.4) + BERT(3.0) + LR(1.6) + RF(1.2) + SVM(2.2)
Emotion (3 models): RoBERTa(2.0) + BiLSTM(1.5) + LR(1.2)
Sentiment (3 models): RoBERTa(2.0) + SVM(1.5) + GRU(1.2)
"""

import numpy as np
import logging
from app.ai.english.ml_dl_predict import (
    predict_english_ml_probs, predict_english_dl_probs,
    en_problem_lr, en_problem_rf, en_problem_svm,
    en_emotion_bilstm, en_emotion_lr,
    en_sentiment_svm, en_sentiment_gru
)
from app.ai.english.transformer_predict import predict_english_transformer_probs

logger = logging.getLogger(__name__)

# Label mappings for English models
P_LABELS = {0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene",
            3: "Service Quality", 4: "Pricing", 5: "Order Accuracy",
            6: "Bad Atmosphere", 7: "Menu"}
S_LABELS = {0: "Negative", 1: "Neutral", 2: "Positive"}
E_LABELS = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}


def predict_english_problem_type(text: str) -> str:
    """
    Predict English problem type using weighted soft voting (5 models).
    
    Weights: RoBERTa(2.4) + BERT(3.0) + LR(1.6) + RF(1.2) + SVM(2.2)
    
    Args:
        text: Input English text
        
    Returns:
        Predicted problem type label
    """
    try:
        weights = [2.4, 3.0, 1.6, 1.2, 2.2]
        sum_weights = sum(weights)
        
        # Model 1: RoBERTa
        p1 = predict_english_transformer_probs(text, "roberta_problem")
        logger.debug(f"English RoBERTa problem: {P_LABELS[np.argmax(p1)]}")
        
        # Model 2: BERT
        p2 = predict_english_transformer_probs(text, "bert_problem")
        logger.debug(f"English BERT problem: {P_LABELS[np.argmax(p2)]}")
        
        # Model 3: LR (problem type)
        p3 = predict_english_ml_probs(en_problem_lr, text)
        logger.debug(f"English LR problem: {P_LABELS[np.argmax(p3)]}")
        
        # Model 4: RF (problem type)
        p4 = predict_english_ml_probs(en_problem_rf, text)
        logger.debug(f"English RF problem: {P_LABELS[np.argmax(p4)]}")
        
        # Model 5: SVM (problem type) - with fallback for models without probability support
        try:
            p5 = predict_english_ml_probs(en_problem_svm, text)
            logger.debug(f"English SVM problem: {P_LABELS[np.argmax(p5)]}")
        except Exception as e:
            logger.warning(f"SVM problem type prediction failed: {str(e)}, using uniform distribution")
            p5 = np.ones((1, 8)) / 8  # Uniform distribution for 8 classes
        
        # Weighted soft vote
        weighted = (weights[0]*p1 + weights[1]*p2 + weights[2]*p3 + 
                   weights[3]*p4 + weights[4]*p5) / sum_weights
        
        final_idx = np.argmax(weighted, axis=1)[0]
        final_pred = P_LABELS[final_idx]
        
        logger.debug(f"English problem type weighted vote: {final_pred}")
        return final_pred
        
    except Exception as e:
        logger.error(f"Error in English problem type prediction: {str(e)}", exc_info=True)
        return "Service Quality"


def predict_english_emotion(text: str) -> str:
    """
    Predict English emotion using weighted soft voting (3 models).
    
    Weights: RoBERTa(2.0) + BiLSTM(1.5) + LR(1.2)
    
    Args:
        text: Input English text
        
    Returns:
        Predicted emotion label
    """
    try:
        weights = [2.0, 1.5, 1.2]
        sum_weights = sum(weights)
        
        # Model 1: RoBERTa emotion
        p1 = predict_english_transformer_probs(text, "roberta_emotion")
        logger.debug(f"English RoBERTa emotion: {E_LABELS[np.argmax(p1)]}")
        
        # Model 2: BiLSTM (emotion)
        p2 = predict_english_dl_probs(en_emotion_bilstm, text)
        logger.debug(f"English BiLSTM emotion: {E_LABELS[np.argmax(p2)]}")
        
        # Model 3: LR (emotion)
        p3 = predict_english_ml_probs(en_emotion_lr, text)
        logger.debug(f"English LR emotion: {E_LABELS[np.argmax(p3)]}")
        
        # Weighted soft vote
        weighted = (weights[0]*p1 + weights[1]*p2 + weights[2]*p3) / sum_weights
        
        final_idx = np.argmax(weighted, axis=1)[0]
        final_pred = E_LABELS[final_idx]
        
        logger.debug(f"English emotion weighted vote: {final_pred}")
        return final_pred
        
    except Exception as e:
        logger.error(f"Error in English emotion prediction: {str(e)}", exc_info=True)
        return "Neutral"


def predict_english_sentiment(text: str) -> str:
    """
    Predict English sentiment using weighted soft voting (3 models).
    
    Weights: RoBERTa(2.0) + SVM(1.5) + GRU(1.2)
    
    Args:
        text: Input English text
        
    Returns:
        Predicted sentiment label
    """
    try:
        weights = [2.0, 1.5, 1.2]
        sum_weights = sum(weights)
        
        # Model 1: RoBERTa sentiment
        p1 = predict_english_transformer_probs(text, "roberta_sentiment")
        logger.debug(f"English RoBERTa sentiment: {S_LABELS[np.argmax(p1)]}")
        
        # Model 2: SVM (sentiment) - with fallback for models without probability support
        try:
            p2 = predict_english_ml_probs(en_sentiment_svm, text)
            logger.debug(f"English SVM sentiment: {S_LABELS[np.argmax(p2)]}")
        except Exception as e:
            logger.warning(f"SVM sentiment prediction failed: {str(e)}, using uniform distribution")
            p2 = np.ones((1, 3)) / 3  # Uniform distribution for 3 classes
        
        # Model 3: GRU (sentiment)
        p3 = predict_english_dl_probs(en_sentiment_gru, text)
        logger.debug(f"English GRU sentiment: {S_LABELS[np.argmax(p3)]}")
        
        # Weighted soft vote
        weighted = (weights[0]*p1 + weights[1]*p2 + weights[2]*p3) / sum_weights
        
        final_idx = np.argmax(weighted, axis=1)[0]
        final_pred = S_LABELS[final_idx]
        
        logger.debug(f"English sentiment weighted vote: {final_pred}")
        return final_pred
        
    except Exception as e:
        logger.error(f"Error in English sentiment prediction: {str(e)}", exc_info=True)
        return "Neutral"
