from pathlib import Path

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from app.config import settings
from .priority import calculate_priority

def load_model_and_tokenizer(path):
    """Loads a quantized model and tokenizer from the given path."""
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSequenceClassification.from_pretrained(
        path, low_cpu_mem_usage=True
    )
    model = torch.quantization.quantize_dynamic(
        model, {torch.nn.Linear}, dtype=torch.qint8
    )
    model.eval()
    return model, tokenizer

def load_arabic_models():
    """
    Loads all Arabic models and tokenizers.

    Returns:
        dict: A dictionary containing the loaded sentiment, emotion, and
              problem_type models and tokenizers.
    """
    model_paths = {
        "sentiment": settings.AR_ARABERT_SENTIMENT_PATH,
        "emotion": settings.AR_ARABERT_EMOTION_PATH,
        "problem_type": settings.AR_ARABERT_PROBLEM_PATH,
    }

    missing = [name for name, path in model_paths.items() if not path]
    if missing:
        raise ValueError(
            f"Missing Arabic model path(s) in env: {', '.join(missing)}"
        )

    for name, path in model_paths.items():
        if not Path(path).exists():
            raise FileNotFoundError(f"Arabic model path not found for {name}: {path}")

    models = {
        name: load_model_and_tokenizer(path) for name, path in model_paths.items()
    }
    return models

SENTIMENT_LABELS = {0: "Negative", 1: "Neutral", 2: "Positive"}
EMOTION_LABELS = {0: "Frustrated", 1: "Satisfied", 2: "Disgusted", 3: "Neutral"}
PROBLEM_TYPE_LABELS = {
    0: "Delivery Issue",
    1: "Food Quality",
    2: "Hygiene",
    3: "Service Quality",
    4: "Pricing",
    5: "Order Accuracy",
}


def _predict_class(text, model, tokenizer):
    """Helper function to predict a single class from text."""
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=64,
        padding="max_length",
    )
    with torch.no_grad():
        outputs = model(**inputs)
    return torch.argmax(outputs.logits, dim=1).item()


def predict_arabic(cleaned_text: str, models: dict):
    """
    Predicts sentiment, emotion, and problem type for a given Arabic text.

    Args:
        cleaned_text: The input text.
        models: A dictionary of loaded models and tokenizers.

    Returns:
        A dictionary with prediction results.
    """
    # 1. Predict Sentiment
    sentiment_model, sentiment_tokenizer = models["sentiment"]
    sentiment_class = _predict_class(
        cleaned_text, sentiment_model, sentiment_tokenizer
    )
    sentiment = SENTIMENT_LABELS[sentiment_class]

    # 2. Predict Emotion
    emotion_model, emotion_tokenizer = models["emotion"]
    emotion_class = _predict_class(cleaned_text, emotion_model, emotion_tokenizer)
    emotion = EMOTION_LABELS[emotion_class]

    # 3. Apply problem type gate
    problem_type = None
    if sentiment == "Positive":
        problem_type = None
    elif sentiment == "Neutral" and emotion in ["Neutral", "Satisfied"]:
        problem_type = None
    else:
        problem_type_model, problem_type_tokenizer = models["problem_type"]
        problem_type_class = _predict_class(
            cleaned_text, problem_type_model, problem_type_tokenizer
        )
        problem_type = PROBLEM_TYPE_LABELS[problem_type_class]

    # 4. Calculate Priority
    priority = calculate_priority(
        problem_type=problem_type, emotion=emotion, sentiment=sentiment
    )

    return {
        "sentiment": sentiment,
        "emotion": emotion,
        "problem_type": problem_type,
        "priority": priority,
    }
