"""
RoBERTa model for problem type classification.
Loads and uses the fine-tuned RoBERTa model for predictions.
"""

import logging
import torch
from transformers import RobertaForSequenceClassification, AutoTokenizer
from .labels import PROBLEM_TYPE_DEFAULT_LABEL, PROBLEM_TYPE_ID2LABEL

logger = logging.getLogger(__name__)

# Global model and tokenizer instances
_roberta_model = None
_roberta_tokenizer = None
_device = None

# Label mapping


def load_roberta_model(model_path: str) -> bool:
    """
    Load RoBERTa model and tokenizer.

    Args:
        model_path: Path to the fine-tuned RoBERTa model directory

    Returns:
        True if successful, False otherwise
    """
    global _roberta_model, _roberta_tokenizer, _device

    try:
        # Set device
        _device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {_device}")

        # Load model
        _roberta_model = RobertaForSequenceClassification.from_pretrained(
            model_path
        ).to(_device)
        _roberta_model.eval()
        logger.info(f"RoBERTa model loaded from {model_path}")

        # Load tokenizer
        _roberta_tokenizer = AutoTokenizer.from_pretrained(model_path)
        logger.info(f"RoBERTa tokenizer loaded from {model_path}")

        return True

    except Exception as e:
        logger.error(f"Error loading RoBERTa model: {str(e)}", exc_info=True)
        return False


def predict_roberta(text: str) -> str:
    """
    Predict problem type using RoBERTa model.

    Args:
        text: Input text to classify

    Returns:
        Predicted problem type label

    Raises:
        RuntimeError: If model not loaded
    """
    global _roberta_model, _roberta_tokenizer, _device

    if _roberta_model is None or _roberta_tokenizer is None:
        raise RuntimeError("RoBERTa model not loaded. Call load_roberta_model() first.")

    try:
        # Tokenize input
        inputs = _roberta_tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=128,
            return_tensors="pt",
        )

        # Move inputs to device
        inputs = {k: v.to(_device) for k, v in inputs.items()}

        # Get prediction
        with torch.no_grad():
            outputs = _roberta_model(**inputs)
            logits = outputs.logits
            pred_id = torch.argmax(logits, dim=1).cpu().item()

        label = PROBLEM_TYPE_ID2LABEL.get(pred_id, PROBLEM_TYPE_DEFAULT_LABEL)
        logger.debug(f"RoBERTa prediction: {label} (id: {pred_id})")

        return label

    except Exception as e:
        logger.error(f"Error in RoBERTa prediction: {str(e)}", exc_info=True)
        raise
