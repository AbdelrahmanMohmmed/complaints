"""Arabic prediction module.

Problem type remains hard-vote ensemble.
Sentiment and emotion are now Hugging Face-only.
"""

from collections import Counter
import logging
from app.ai.arabic.ml_dl_predict import (
    predict_arabic_ml,
    predict_arabic_dl,
    ar_problem_lr_f,
    ar_problem_gru,
    ar_problem_lr_a,
    ar_problem_svm_a,
)
from app.ai.arabic.transformer_predict import predict_arabert
from app.ai.hf_predict import (
    predict_arabic_emotion_hf,
    predict_arabic_sentiment_hf,
)

logger = logging.getLogger(__name__)


def predict_arabic_problem_type(text: str) -> str:
    """Predict Arabic problem type using hard voting (5 models, arabert_67)."""
    try:
        pred1 = predict_arabert(text, "P")  # AraBERT 67
        pred2 = predict_arabic_ml(ar_problem_lr_f, text, "P")  # LR-F
        pred3 = predict_arabic_dl(ar_problem_gru, text, "P")  # GRU
        pred4 = predict_arabic_ml(ar_problem_lr_a, text, "P")  # LR-A
        pred5 = predict_arabic_ml(ar_problem_svm_a, text, "P")  # SVM-A

        preds = [pred1, pred2, pred3, pred4, pred5]
        votes = Counter(preds)
        final_pred = votes.most_common(1)[0][0]

        logger.debug(
            f"Arabic problem type hard vote - votes: {preds}, final: {final_pred}"
        )
        return final_pred
    except Exception as e:
        logger.error(
            f"Error in Arabic problem type prediction: {str(e)}", exc_info=True
        )
        return "Service Quality"


def predict_arabic_emotion(text: str) -> str:
    """Predict Arabic emotion using multilingual Hugging Face model."""
    try:
        return predict_arabic_emotion_hf(text)
    except Exception as e:
        logger.error(f"Error in Arabic emotion prediction: {str(e)}", exc_info=True)
        return "Neutral"


def predict_arabic_sentiment(text: str) -> str:
    """Predict Arabic sentiment using CAMeL Hugging Face model."""
    try:
        return predict_arabic_sentiment_hf(text)
    except Exception as e:
        logger.error(f"Error in Arabic sentiment prediction: {str(e)}", exc_info=True)
        return "Neutral"
