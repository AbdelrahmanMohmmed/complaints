"""English RoBERTa and BERT transformer predictions for sentiment, emotion, and problem type.

Loads transformer models from HuggingFace once at startup.
IMPORTANT: Different transformer models for each task (Problem Type, Emotion, Sentiment).
- RoBERTa Problem: roberta_70
- RoBERTa Emotion: roberta_73_emotion
- RoBERTa Sentiment: roberta_73_sentiment
- BERT Problem: bert_70
"""

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Label mappings for English models
P_LABELS = {0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene",
            3: "Service Quality", 4: "Pricing", 5: "Order Accuracy",
            6: "Bad Atmosphere", 7: "Menu"}
S_LABELS = {0: "Negative", 1: "Neutral", 2: "Positive"}
E_LABELS = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}

# Load RoBERTa models once at startup (DISABLED - using HF models instead)
en_roberta_problem_tokenizer = None
en_roberta_problem_model = None
en_roberta_emotion_tokenizer = None
en_roberta_emotion_model = None
en_roberta_sentiment_tokenizer = None
en_roberta_sentiment_model = None

# Load BERT model once at startup (DISABLED - using HF models instead)
en_bert_problem_tokenizer = None
en_bert_problem_model = None


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
            tokenizer, model = en_roberta_problem_tokenizer, en_roberta_problem_model
        elif model_name == "roberta_emotion":
            tokenizer, model = en_roberta_emotion_tokenizer, en_roberta_emotion_model
        elif model_name == "roberta_sentiment":
            tokenizer, model = en_roberta_sentiment_tokenizer, en_roberta_sentiment_model
        elif model_name == "bert_problem":
            tokenizer, model = en_bert_problem_tokenizer, en_bert_problem_model
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
