"""English text representation using FastText and Keras tokenizer.

Lazy loads FastText model and tokenizer on first use to avoid memory exhaustion at startup.
Supports both ML embeddings (FastText vectors) and DL sequences (tokenized & padded).
"""

import numpy as np
import logging
import torch
from tensorflow.keras.preprocessing.sequence import pad_sequences
import tensorflow.keras as keras

from app.config import settings
from app.ai.modelLoad import ModelLoad
logger = logging.getLogger(__name__)

_MAX_LEN = 65  # Sequence length for DL models (GRU, BiLSTM)
modelLoad = ModelLoad()

# ============================
# English RoBERTa Models
# ============================
def get_en_roberta_problem():
    """Returns (tokenizer, model) for English RoBERTa Problem Type"""
    return modelLoad.load_transformer(settings.EN_ROBERTA_PROBLEM_PATH)


def get_en_roberta_emotion():
    """Returns (tokenizer, model) for English RoBERTa Emotion"""
    return modelLoad.load_transformer(settings.EN_ROBERTA_EMOTION_PATH)


def get_en_roberta_sentiment():
    """Returns (tokenizer, model) for English RoBERTa Sentiment"""
    return modelLoad.load_transformer(settings.EN_ROBERTA_SENTIMENT_PATH)


# ============================
# English BERT Models
# ============================
def get_en_bert_problem():
    """Returns (tokenizer, model) for English BERT Problem Type"""
    return modelLoad.load_transformer(settings.EN_BERT_PROBLEM_PATH)


def predict_english_transformer_probs(text: str, model_name: str) -> np.ndarray:
    """
    Get probability predictions from English transformer model.

    Args:
        text: Input English text
        model_name: Model identifier - "roberta_problem", "roberta_emotion",
                   "roberta_sentiment", or "bert_problem"

    Returns:
        Probability array of shape (1, num_classes)
    """
    try:
        if model_name == "roberta_problem":
            tokenizer, model = get_en_roberta_problem()
        elif model_name == "roberta_emotion":
            tokenizer, model = get_en_roberta_emotion()
        elif model_name == "roberta_sentiment":
            tokenizer, model = get_en_roberta_sentiment()
        elif model_name == "bert_problem":
            tokenizer, model = get_en_bert_problem()
        else:
            logger.error(f"Unknown transformer model: {model_name}")
            raise ValueError(f"Unknown transformer model: {model_name}")

        if tokenizer is None or model is None:
            logger.error(f"Transformer model or tokenizer not loaded for {model_name}")
            raise RuntimeError(f"Transformer model not loaded: {model_name}")

        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)

        with torch.no_grad():
            outputs = model(**inputs)

        # Apply softmax to get probabilities and convert to numpy
        probs = torch.softmax(outputs.logits, dim=1).numpy()
        return probs

    except Exception as e:
        logger.error(f"Error getting English transformer probabilities ({model_name}): {str(e)}", exc_info=True)
        raise


def embed_english(text: str, for_ml: bool = True) -> np.ndarray:
    """
    Generate English text embedding or sequence for ML/DL models.
    
    For ML models: Returns FastText embedding vector (1, 100)
    For DL models: Returns tokenized and padded sequence (1, 65)
    
    Args:
        text: Input English text
        for_ml: If True, return FastText embedding for ML models.
               If False, return padded sequence for DL models (GRU, BiLSTM)
        
    Returns:
        - ML: FastText embedding reshaped to (1, 100)
        - DL: Tokenized and padded sequence (1, 65)
    """
    try:
        if for_ml:
            # For ML models: use FastText embedding directly
            en_ft_model = modelLoad.load_fasttext_model(settings.EN_FASTTEXT_PATH)
            if en_ft_model is None:
                logger.error("English FastText model not loaded")
                raise RuntimeError("English FastText model not loaded")
            
            vector = en_ft_model.get_sentence_vector(text.lower())
            return vector.reshape(1, -1)
        else:
            # For DL models (GRU, BiLSTM): use tokenized and padded sequences
            en_tokenizer = modelLoad.load_pickle(settings.EN_TOKENIZER_PATH)
            if en_tokenizer is None:
                logger.error("English tokenizer not loaded for DL sequences")
                raise RuntimeError("English tokenizer not loaded")
            
            # Tokenize and pad sequence
            seq = en_tokenizer.texts_to_sequences([text])
            if not seq or not seq[0]:
                logger.warning(f"No tokens generated for English text: {text[:50]}")
                seq = [[1]]  # Use default token if empty
            
            padded = pad_sequences(seq, maxlen=_MAX_LEN)
            return padded
            
    except Exception as e:
        logger.error(f"Error embedding English text: {str(e)}", exc_info=True)
        raise

def predict_english_dl_probs(model, text: str) -> np.ndarray:
    """Get probability predictions from English DL model with FastText embedding."""
    # Handle both direct model and lazy getter
    if callable(model) and not isinstance(model, (keras.Model, keras.layers.Layer)):
        print(f"Loading DL model via getter: {model.__name__ if hasattr(model, '__name__') else 'unknown'}")
        model = model()  # Call getter only if it's still a function
    if model is None:
        raise RuntimeError("DL model not loaded")
    vec = embed_english(text, for_ml=False)
    return model.predict(vec, verbose=0)