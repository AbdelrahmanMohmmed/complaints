"""
BERT model for problem type classification.
Loads and uses the fine-tuned BERT model for predictions.
"""

import logging
import torch
from transformers import BertForSequenceClassification, AutoTokenizer

logger = logging.getLogger(__name__)

# Global model and tokenizer instances
_bert_model = None
_bert_tokenizer = None
_device = None

# Label mapping
ID2LABEL = {
    0: "Delivery Issue",
    1: "Food Quality",
    2: "Hygiene",
    3: "Service Quality",
    4: "Pricing",
    5: "Order Accuracy",
    6: "Bad Atmosphere",
    7: "Menu"
}


def load_bert_model(model_path: str) -> bool:
    """
    Load BERT model and tokenizer.
    
    Args:
        model_path: Path to the fine-tuned BERT model directory
        
    Returns:
        True if successful, False otherwise
    """
    global _bert_model, _bert_tokenizer, _device
    
    try:
        # Set device
        _device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {_device}")
        
        # Load model
        _bert_model = BertForSequenceClassification.from_pretrained(model_path).to(_device)
        _bert_model.eval()
        logger.info(f"BERT model loaded from {model_path}")
        
        # Load tokenizer
        _bert_tokenizer = AutoTokenizer.from_pretrained(model_path)
        logger.info(f"BERT tokenizer loaded from {model_path}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error loading BERT model: {str(e)}", exc_info=True)
        return False


def predict_bert(text: str) -> str:
    """
    Predict problem type using BERT model.
    
    Args:
        text: Input text to classify
        
    Returns:
        Predicted problem type label
        
    Raises:
        RuntimeError: If model not loaded
    """
    global _bert_model, _bert_tokenizer, _device
    
    if _bert_model is None or _bert_tokenizer is None:
        raise RuntimeError("BERT model not loaded. Call load_bert_model() first.")
    
    try:
        # Tokenize input
        inputs = _bert_tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=128,
            return_tensors="pt"
        )
        
        # Move inputs to device
        inputs = {k: v.to(_device) for k, v in inputs.items()}
        
        # Get prediction
        with torch.no_grad():
            outputs = _bert_model(**inputs)
            logits = outputs.logits
            pred_id = torch.argmax(logits, dim=1).cpu().item()
        
        label = ID2LABEL.get(pred_id, "Service Quality")
        logger.debug(f"BERT prediction: {label} (id: {pred_id})")
        
        return label
        
    except Exception as e:
        logger.error(f"Error in BERT prediction: {str(e)}", exc_info=True)
        raise
