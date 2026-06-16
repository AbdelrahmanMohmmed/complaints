"""Arabic ensemble prediction using hard voting (majority vote).

IMPORTANT: Different models for each task (Problem Type, Emotion, Sentiment)

Problem Type (5 models):
1. arabert_67
2. LR-F (problem type version)
3. GRU (problem type version)
4. LR-A (problem type version)
5. SVM-A (problem type version)

Emotion (5 models):
1. arabert_70
2. LR-F (emotion version)
3. BiLSTM (emotion version)
4. LR-A (emotion version)
5. SVM-A (emotion version)

Sentiment (5 models):
1. arabert_85
2. LR-F (sentiment version)
3. BiLSTM (sentiment version)
4. SVM-A (sentiment version)
5. LR-A (sentiment version)
"""

from collections import Counter
import logging
from app.ai.arabic.ml_dl_predict import (
    predict_arabic_ml, predict_arabic_dl,
    ar_problem_lr_f, ar_problem_gru,
    ar_emotion_lr_f, ar_emotion_bilstm,
    ar_sentiment_lr_f, ar_sentiment_bilstm)

logger = logging.getLogger(__name__)


def predict_arabic_problem_type(text: str) -> str:
    """Predict Arabic problem type using hard voting (5 models, arabert_67)."""
    try:
        # print("Step 0: Starting")
        # pred1 = predict_arabert(text, "P")  # AraBERT 67
        # print(f"Step 1: AraBERT done -> {pred1}")
        pred2 = predict_arabic_ml(ar_problem_lr_f(), text, "P")  # LR-F
        pred3 = predict_arabic_dl(ar_problem_gru(), text, "P")  # GRU

        preds = [ pred2, pred3]
        votes = Counter(preds)
        final_pred = votes.most_common(1)[0][0]
        
        logger.debug(f"Arabic problem type hard vote - votes: {preds}, final: {final_pred}")
        return final_pred
    except Exception as e:
        logger.error(f"Error in Arabic problem type prediction: {str(e)}", exc_info=True)
        return "Service Quality"


def predict_arabic_emotion(text: str) -> str:
    """Predict Arabic emotion using hard voting (5 models, arabert_70)."""
    try:
        # pred1 = predict_arabert(text, "E")  # AraBERT 70
        pred2 = predict_arabic_ml(ar_emotion_lr_f(), text, "E")  # LR-F
        pred3 = predict_arabic_dl(ar_emotion_bilstm(), text, "E")  # BiLSTM

        preds = [pred2, pred3]
        votes = Counter(preds)
        final_pred = votes.most_common(1)[0][0]

        logger.debug(f"Arabic emotion hard vote - votes: {preds}, final: {final_pred}")
        return final_pred
    except Exception as e:
        logger.error(f"Error in Arabic emotion prediction: {str(e)}", exc_info=True)
        return "Neutral"


def predict_arabic_sentiment(text: str) -> str:
    """Predict Arabic sentiment using hard voting (5 models, arabert_85)."""
    try:
        # pred1 = predict_arabert(text, "S")  # AraBERT 85
        pred2 = predict_arabic_ml(ar_sentiment_lr_f(), text, "S")  # LR-F
        pred3 = predict_arabic_dl(ar_sentiment_bilstm(), text, "S")  # BiLSTM

        preds = [pred2, pred3]
        votes = Counter(preds)
        final_pred = votes.most_common(1)[0][0]

        logger.debug(f"Arabic sentiment hard vote - votes: {preds}, final: {final_pred}")
        return final_pred
    except Exception as e:
        logger.error(f"Error in Arabic sentiment prediction: {str(e)}", exc_info=True)
        return "Neutral"
