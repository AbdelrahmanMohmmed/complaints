"""Arabic AraBERT transformer predictions for sentiment, emotion, and problem type.

Loads AraBERT models from HuggingFace once at startup.
IMPORTANT: Different AraBERT models for each task (arabert_67, arabert_70, arabert_85)
"""

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Label mappings for Arabic models
P_LABELS = {0: "Delivery Issue", 1: "Food Quality", 2: "Hygiene",
            3: "Service Quality", 4: "Pricing", 5: "Order Accuracy",
            6: "Bad Atmosphere", 7: "Menu"}
S_LABELS = {0: "Negative", 1: "Neutral", 2: "Positive"}
E_LABELS = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}

# ============================================================================
# Problem Type AraBERT (arabert_67)
# ============================================================================
ar_bert_problem_tokenizer = None
ar_bert_problem_model = None

try:
    ar_bert_problem_tokenizer = AutoTokenizer.from_pretrained(settings.AR_ARABERT_PROBLEM_PATH)
    ar_bert_problem_model = AutoModelForSequenceClassification.from_pretrained(settings.AR_ARABERT_PROBLEM_PATH)
    logger.info(f"Loaded Arabic AraBERT problem model from {settings.AR_ARABERT_PROBLEM_PATH}")
except Exception as e:
    logger.error(f"Failed to load Arabic AraBERT problem model: {str(e)}")

# ============================================================================
# Emotion AraBERT (arabert_70)
# ============================================================================
ar_bert_emotion_tokenizer = None
ar_bert_emotion_model = None

try:
    ar_bert_emotion_tokenizer = AutoTokenizer.from_pretrained(settings.AR_ARABERT_EMOTION_PATH)
    ar_bert_emotion_model = AutoModelForSequenceClassification.from_pretrained(settings.AR_ARABERT_EMOTION_PATH)
    logger.info(f"Loaded Arabic AraBERT emotion model from {settings.AR_ARABERT_EMOTION_PATH}")
except Exception as e:
    logger.error(f"Failed to load Arabic AraBERT emotion model: {str(e)}")

# ============================================================================
# Sentiment AraBERT (arabert_85)
# ============================================================================
ar_bert_sentiment_tokenizer = None
ar_bert_sentiment_model = None

try:
    ar_bert_sentiment_tokenizer = AutoTokenizer.from_pretrained(settings.AR_ARABERT_SENTIMENT_PATH)
    ar_bert_sentiment_model = AutoModelForSequenceClassification.from_pretrained(settings.AR_ARABERT_SENTIMENT_PATH)
    logger.info(f"Loaded Arabic AraBERT sentiment model from {settings.AR_ARABERT_SENTIMENT_PATH}")
except Exception as e:
    logger.error(f"Failed to load Arabic AraBERT sentiment model: {str(e)}")


def predict_arabert(text: str, clf_type: str) -> str:
    """
    Predict using Arabic AraBERT transformer model (task-specific).
    
    Args:
        text: Input Arabic text
        clf_type: Classification type - "P" (problem, arabert_67), 
                 "S" (sentiment, arabert_85), "E" (emotion, arabert_70)
        
    Returns:
        Predicted label string
    """
    try:
        if clf_type == "P":
            tokenizer, model, labels = ar_bert_problem_tokenizer, ar_bert_problem_model, P_LABELS
            model_name = "arabert_67 (problem)"
        elif clf_type == "S":
            tokenizer, model, labels = ar_bert_sentiment_tokenizer, ar_bert_sentiment_model, S_LABELS
            model_name = "arabert_85 (sentiment)"
        else:  # "E"
            tokenizer, model, labels = ar_bert_emotion_tokenizer, ar_bert_emotion_model, E_LABELS
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
