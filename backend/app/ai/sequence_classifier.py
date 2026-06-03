"""Shared helpers for transformer-based sequence classification models."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import torch
from transformers import AutoTokenizer

logger = logging.getLogger(__name__)


@dataclass
class SequenceClassifierState:
    model: Any | None = None
    tokenizer: Any | None = None
    device: str | None = None


def load_sequence_classifier(
    state: SequenceClassifierState,
    *,
    model_cls: Any,
    model_path: str,
    model_name: str,
    logger_obj: logging.Logger = logger,
) -> bool:
    """Load a Hugging Face sequence classifier and tokenizer into a shared state."""
    try:
        state.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger_obj.info("Using device: %s", state.device)

        state.model = model_cls.from_pretrained(model_path).to(state.device)
        state.model.eval()
        logger_obj.info("%s model loaded from %s", model_name, model_path)

        state.tokenizer = AutoTokenizer.from_pretrained(model_path)
        logger_obj.info("%s tokenizer loaded from %s", model_name, model_path)
        return True
    except Exception as exc:
        logger_obj.error(
            "Error loading %s model: %s", model_name, str(exc), exc_info=True
        )
        return False


def predict_sequence_label(
    state: SequenceClassifierState,
    text: str,
    *,
    model_name: str,
    default_label: str,
    id2label: dict[int, str],
    logger_obj: logging.Logger = logger,
    max_length: int = 128,
) -> str:
    """Predict a label for a loaded sequence classifier."""
    if state.model is None or state.tokenizer is None or state.device is None:
        raise RuntimeError(
            f"{model_name} model not loaded. Call load_{model_name.lower()}_model() first."
        )

    try:
        inputs = state.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=max_length,
            return_tensors="pt",
        )
        inputs = {key: value.to(state.device) for key, value in inputs.items()}

        with torch.no_grad():
            outputs = state.model(**inputs)
            pred_id = torch.argmax(outputs.logits, dim=1).cpu().item()

        label = id2label.get(pred_id, default_label)
        logger_obj.debug("%s prediction: %s (id: %s)", model_name, label, pred_id)
        return label
    except Exception as exc:
        logger_obj.error(
            "Error in %s prediction: %s", model_name, str(exc), exc_info=True
        )
        raise

"""
BERT model for problem type classification.
Loads and uses the fine-tuned BERT model for predictions.
"""

from transformers import BertForSequenceClassification

# Global model and tokenizer instances
_state = SequenceClassifierState()


def load_bert_model(model_path: str) -> bool:
    """
    Load BERT model and tokenizer.

    Args:
        model_path: Path to the fine-tuned BERT model directory

    Returns:
        True if successful, False otherwise
    """
    return load_sequence_classifier(
        _state,
        model_cls=BertForSequenceClassification,
        model_path=model_path,
        model_name="BERT",
        logger_obj=logger,
    )


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
    return predict_sequence_label(
        _state,
        text,
        model_name="BERT",
        default_label=PROBLEM_TYPE_DEFAULT_LABEL,
        id2label=PROBLEM_TYPE_ID2LABEL,
        logger_obj=logger,
    )

"""
RoBERTa model for problem type classification.
Loads and uses the fine-tuned RoBERTa model for predictions.
"""

from transformers import RobertaForSequenceClassification
from .labels import PROBLEM_TYPE_DEFAULT_LABEL, PROBLEM_TYPE_ID2LABEL


# Global model and tokenizer instances
_state2 = SequenceClassifierState()


def load_roberta_model(model_path: str) -> bool:
    """
    Load RoBERTa model and tokenizer.

    Args:
        model_path: Path to the fine-tuned RoBERTa model directory

    Returns:
        True if successful, False otherwise
    """
    return load_sequence_classifier(
        _state2,
        model_cls=RobertaForSequenceClassification,
        model_path=model_path,
        model_name="RoBERTa",
        logger_obj=logger,
    )


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
    return predict_sequence_label(
        _state2,
        text,
        model_name="RoBERTa",
        default_label=PROBLEM_TYPE_DEFAULT_LABEL,
        id2label=PROBLEM_TYPE_ID2LABEL,
        logger_obj=logger,
    )
