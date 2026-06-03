"""Arabic prediction module.

Problem type remains hard-vote ensemble.
Sentiment and emotion are now Hugging Face-only.
"""

from collections import Counter
from app.ai.arabic.ml_dl_predict import *
from app.ai.arabic.transformer_predict import predict_arabert


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
    """Predict Arabic emotion using hard voting (5 models, arabert_70)."""
    try:
        pred1 = predict_arabert(text, "E")
        pred2 = predict_arabic_ml(ar_emotion_lr_f, text, "E")
        pred3 = predict_arabic_dl(ar_emotion_bilstm, text, "E")
        pred4 = predict_arabic_ml(ar_emotion_lr_a, text, "E")
        pred5 = predict_arabic_ml(ar_emotion_svm_a, text, "E")

        preds = [pred1, pred2, pred3, pred4, pred5]
        votes = Counter(preds)
        final_pred = votes.most_common(1)[0][0]

        logger.debug("Arabic emotion hard vote - votes: %s, final: %s", preds, final_pred)
        return final_pred
    except Exception as e:
        logger.error("Error in Arabic emotion prediction: %s", e, exc_info=True)
        return "Neutral"


def predict_arabic_sentiment(text: str) -> str:
    """Predict Arabic sentiment using hard voting (5 models, arabert_85)."""
    try:
        pred1 = predict_arabert(text, "S")
        pred2 = predict_arabic_ml(ar_sentiment_lr_f, text, "S")
        pred3 = predict_arabic_dl(ar_sentiment_bilstm, text, "S")
        pred4 = predict_arabic_ml(ar_sentiment_lr_a, text, "S")
        pred5 = predict_arabic_ml(ar_sentiment_svm_a, text, "S")

        preds = [pred1, pred2, pred3, pred4, pred5]
        votes = Counter(preds)
        final_pred = votes.most_common(1)[0][0]

        logger.debug("Arabic sentiment hard vote - votes: %s, final: %s", preds, final_pred)
        return final_pred
    except Exception as e:
        logger.error("Error in Arabic sentiment prediction: %s", e, exc_info=True)
        return "Neutral"