"""Arabic AraBERT transformer predictions for sentiment, emotion, and problem type.

Loads AraBERT models from HuggingFace once at startup.
IMPORTANT: Different AraBERT models for each task (arabert_67, arabert_70, arabert_85)
"""

import torch
import logging
import numpy as np
from app.config import settings
from app.ai.modelLoad import ModelLoad
from tensorflow.keras.preprocessing.sequence import pad_sequences
from app.ai.labels import *

logger = logging.getLogger(__name__)
model_loader = ModelLoad()

# ============================================================================
# Arabic AraBERT Models
# ============================================================================

def get_ar_bert_problem():
    """Returns (tokenizer, model, label_dict)"""
    tokenizer, model = model_loader.load_transformer(settings.AR_ARABERT_PROBLEM_PATH)
    return tokenizer, model, PROBLEM_TYPE_ID2LABEL


def get_ar_bert_emotion():
    """Returns (tokenizer, model, label_dict)"""
    tokenizer, model = model_loader.load_transformer(settings.AR_ARABERT_EMOTION_PATH)
    return tokenizer, model, EMOTION_ID2LABEL


def get_ar_bert_sentiment():
    """Returns (tokenizer, model, label_dict)"""
    tokenizer, model = model_loader.load_transformer(settings.AR_ARABERT_SENTIMENT_PATH)
    return tokenizer, model, SENTIMENT_ID2LABEL

def get_arabert_embedding(text: str, clf_type: str) -> np.ndarray:
    """
    Extract 768-dim AraBERT embedding (for SVM models).

    This is used by Arabic SVM models that were trained on transformer embeddings.
    """
    try:
        if clf_type == "P":
            tokenizer, model, _ = get_ar_bert_problem()
        elif clf_type == "E":
            tokenizer, model, _ = get_ar_bert_emotion()
        else:  # "S"
            tokenizer, model, _ = get_ar_bert_sentiment()

        if tokenizer is None or model is None:
            raise RuntimeError(f"AraBERT model for {clf_type} not loaded")

        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)

        with torch.no_grad():
            outputs = model(**inputs, output_hidden_states=True)
            # Use [CLS] token representation from last layer
            embedding = outputs.hidden_states[-1][:, 0, :].cpu().numpy()

        return embedding

    except Exception as e:
        logger.error(f"Error extracting AraBERT embedding ({clf_type}): {str(e)}", exc_info=True)
        raise


def predict_arabert(text: str, clf_type: str) -> str:
    """
    Full prediction using AraBERT classification head.
    """
    try:
        if clf_type == "P":
            tokenizer, model, labels = get_ar_bert_problem()
            model_name = "arabert_67 (problem)"
        elif clf_type == "S":
            tokenizer, model, labels = get_ar_bert_sentiment()
            model_name = "arabert_85 (sentiment)"
        else:  # "E"
            tokenizer, model, labels = get_ar_bert_emotion()
            model_name = "arabert_70 (emotion)"

        if tokenizer is None or model is None:
            logger.error(f"AraBERT model or tokenizer not loaded for {model_name}")
            return "Service Quality" if clf_type == "P" else "Neutral"

        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)

        with torch.no_grad():
            outputs = model(**inputs)
            idx = torch.argmax(outputs.logits, dim=1).item()

        return labels[idx]

    except Exception as e:
        logger.error(f"Error in Arabic AraBERT prediction ({clf_type}): {str(e)}", exc_info=True)
        return "Service Quality" if clf_type == "P" else "Neutral"

_MAX_LEN = 30  # Sequence length for Arabic DL models (GRU, BiLSTM) - IMPORTANT: Different from English (65)

def embed_arabic(text: str, for_ml: bool = True) -> np.ndarray:
    """
    Generate Arabic text embedding or sequence for ML/DL models.

    For ML models: Returns FastText embedding vector (1, 100)
    For DL models: Returns tokenized and padded sequence (1, 30)

    Args:
        text: Input Arabic text
        for_ml: If True, return FastText embedding for ML models.
               If False, return padded sequence for DL models (GRU, BiLSTM)

    Returns:
        - ML: FastText embedding reshaped to (1, 100)
        - DL: Tokenized and padded sequence (1, 30)
    """
    try:
        if for_ml:
            # For ML models: use FastText embedding directly
            ar_ft_model = model_loader.load_fasttext_model(settings.AR_FASTTEXT_PATH)
            if ar_ft_model is None:
                logger.error("Arabic FastText model not loaded")
                raise RuntimeError("Arabic FastText model not loaded")

            vector = ar_ft_model.get_sentence_vector(text.lower())
            return vector.reshape(1, -1)

        else:
            # For DL models (GRU, BiLSTM): use tokenized and padded sequences
            ar_tokenizer = model_loader.load_pickle(settings.AR_TOKENIZER_PATH)
            if ar_tokenizer is None:
                logger.error("Arabic tokenizer not loaded for DL sequences")
                raise RuntimeError("Arabic tokenizer not loaded")

            # Tokenize and pad sequence
            seq = ar_tokenizer.texts_to_sequences([text])
            if not seq or not seq[0]:
                logger.warning(f"No tokens generated for Arabic text: {text[:50]}")
                seq = [[1]]  # Use default token if empty

            padded = pad_sequences(seq, maxlen=_MAX_LEN)
            return padded

    except Exception as e:
        logger.error(f"Error embedding Arabic text: {str(e)}", exc_info=True)
        raise