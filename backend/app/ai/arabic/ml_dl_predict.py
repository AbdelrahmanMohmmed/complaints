"""Arabic ML/DL model predictions using FastText representation.

Loads trained ML models (LR, SVM) and DL models (GRU, BiLSTM) once at startup.
IMPORTANT: Different models for each task (Problem Type, Emotion, Sentiment).

Model input types:
- LR models: FastText embeddings (100 dims)
- DL models: FastText + padded sequences (30 dims)
- SVM models: AraBERT embeddings (768 dims) - CRITICAL DIFFERENCE
"""

import numpy as np
import logging
import torch
from app.config import settings
from app.ai.arabic.representation import embed_arabic
from app.ai.modelLoad import ModelLoad
logger = logging.getLogger(__name__)

# Label mappings for Arabic models
P_LABELS = {0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene",
            3: "Service Quality", 4: "Pricing", 5: "Order Accuracy",
            6: "Bad Atmosphere", 7: "Menu"}
S_LABELS = {0: "Negative", 1: "Neutral", 2: "Positive"}
E_LABELS = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}

model_loader = ModelLoad()
# ============================================================================
# Lazy Loading Getter Functions - Problem Type
# ============================================================================

def ar_problem_lr_f():
    return model_loader.load_pickle(settings.AR_PROBLEM_LR_F_PATH)


def ar_problem_gru():
    return model_loader.load_keras_model(settings.AR_PROBLEM_GRU_PATH)

#corrupted
# def ar_problem_lr_a():
#     return model_loader.load_pickle(settings.AR_PROBLEM_LR_A_PATH)

#corrupted
# def ar_problem_svm_a():
#     return model_loader.load_pickle(settings.AR_PROBLEM_SVM_A_PATH)

# ============================================================================
# Lazy Loading Getter Functions - Emotion
# ============================================================================

def ar_emotion_lr_f():
    return model_loader.load_pickle(settings.AR_EMOTION_LR_F_PATH)

def ar_emotion_bilstm():
    return model_loader.load_keras_model(settings.AR_EMOTION_BILSTM_PATH)

#corrupted
# def ar_emotion_lr_a():
#     return model_loader.load_pickle(settings.AR_EMOTION_LR_A_PATH)
#
# def ar_emotion_svm_a():
#     return model_loader.load_pickle(settings.AR_EMOTION_SVM_A_PATH)

# ============================================================================
# Lazy Loading Getter Functions - Sentiment
# ============================================================================

def ar_sentiment_lr_f():
    return model_loader.load_pickle(settings.AR_SENTIMENT_LR_F_PATH)

def ar_sentiment_bilstm():
    return model_loader.load_keras_model(settings.AR_SENTIMENT_BILSTM_PATH)

# def ar_sentiment_svm_a():
#     return model_loader.load_pickle(settings.AR_SENTIMENT_SVM_A_PATH)
#
# def ar_sentiment_lr_a():
#     return model_loader.load_pickle(settings.AR_SENTIMENT_LR_A_PATH)
# ============================================================================
# AraBERT Embedding Extraction (for SVM models)
# ============================================================================

def get_arabert_embedding(text: str, clf_type: str) -> np.ndarray:
    """
    Extract AraBERT embeddings (768 dims) for SVM models.
    
    IMPORTANT: SVM models are trained on AraBERT embeddings (768 dims),
    NOT FastText embeddings (100 dims).
    
    Args:
        text: Input Arabic text
        clf_type: Classification type - "P" (problem), "S" (sentiment), "E" (emotion)
        
    Returns:
        Embedding array of shape (1, 768) - AraBERT hidden state
    """
    try:
        from app.ai.arabic.transformer_predict import (
            ar_bert_problem_tokenizer, ar_bert_problem_model,
            ar_bert_emotion_tokenizer, ar_bert_emotion_model,
            ar_bert_sentiment_tokenizer, ar_bert_sentiment_model
        )
        
        # Select appropriate tokenizer and model
        if clf_type == "P":
            tokenizer, model = ar_bert_problem_tokenizer, ar_bert_problem_model
            model_name = "arabert_67 (problem)"
        elif clf_type == "E":
            tokenizer, model = ar_bert_emotion_tokenizer, ar_bert_emotion_model
            model_name = "arabert_70 (emotion)"
        else:  # "S"
            tokenizer, model = ar_bert_sentiment_tokenizer, ar_bert_sentiment_model
            model_name = "arabert_85 (sentiment)"
        
        if tokenizer is None or model is None:
            logger.error(f"AraBERT model/tokenizer not loaded for {model_name}")
            raise RuntimeError(f"AraBERT {model_name} not loaded")
        
        # Tokenize input
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        
        # Get embeddings from [CLS] token (first hidden state)
        with torch.no_grad():
            outputs = model(**inputs, output_hidden_states=True)
            # Use last layer hidden state of [CLS] token as embedding
            embedding = outputs.hidden_states[-1][:, 0, :].cpu().numpy()
        
        return embedding
        
    except Exception as e:
        logger.error(f"Error extracting AraBERT embedding ({clf_type}): {str(e)}", exc_info=True)
        raise


def predict_arabic_ml(model, text: str, clf_type: str) -> str:
    """
    Predict using Arabic ML model with appropriate embeddings.
    
    CRITICAL: Different models use different embeddings:
    - LR models: FastText embeddings (100 dims)
    - SVM models: AraBERT embeddings (768 dims)
    
    Args:
        model: Loaded scikit-learn model (LR, SVM)
        text: Input Arabic text
        clf_type: Classification type - "P" (problem), "S" (sentiment), "E" (emotion)
        
    Returns:
        Predicted label string
    """
    try:
        if model is None:
            logger.error(f"Model not loaded for Arabic ML prediction ({clf_type})")
            return "Service Quality" if clf_type == "P" else "Neutral"
        
        # Detect model type and use appropriate embeddings
        # SVM models trained on 768-dim AraBERT embeddings
        # LR models trained on 100-dim FastText embeddings
        expected_features = model.n_features_in_ if hasattr(model, 'n_features_in_') else None
        
        if expected_features == 768:
            # SVM model - use AraBERT embeddings
            logger.debug(f"Using AraBERT embeddings for SVM ({clf_type})")
            vec = get_arabert_embedding(text, clf_type)
        else:
            # LR model - use FastText embeddings
            logger.debug(f"Using FastText embeddings for LR ({clf_type})")
            vec = embed_arabic(text, for_ml=True)
        
        pred = model.predict(vec)[0]
        labels = P_LABELS if clf_type == "P" else S_LABELS if clf_type == "S" else E_LABELS
        return labels[pred]
        
    except Exception as e:
        logger.error(f"Error in Arabic ML prediction ({clf_type}): {str(e)}", exc_info=True)
        return "Service Quality" if clf_type == "P" else "Neutral"


def predict_arabic_dl(model, text: str, clf_type: str) -> str:
    """
    Predict using Arabic DL model (GRU, BiLSTM) with FastText embedding.
    
    Args:
        model: Loaded Keras DL model
        text: Input Arabic text
        clf_type: Classification type - "P" (problem), "S" (sentiment), "E" (emotion)
        
    Returns:
        Predicted label string
    """
    try:
        if model is None:
            logger.error(f"Model not loaded for Arabic DL prediction ({clf_type})")
            return "Service Quality" if clf_type == "P" else "Neutral"
        
        vec = embed_arabic(text, for_ml=False)
        probs = model.predict(vec, verbose=0)
        idx = np.argmax(probs, axis=1)[0]
        labels = P_LABELS if clf_type == "P" else S_LABELS if clf_type == "S" else E_LABELS
        return labels[idx]
    except Exception as e:
        logger.error(f"Error in Arabic DL prediction ({clf_type}): {str(e)}", exc_info=True)
        return "Service Quality" if clf_type == "P" else "Neutral"
