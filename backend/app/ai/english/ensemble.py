"""English prediction module.

Problem type remains ensemble-based.
Sentiment and emotion are now Hugging Face-only.
"""
from app.ai.english.ml_dl_predict import *
from app.ai.english.transformer_predict import predict_english_transformer_probs


logger = logging.getLogger(__name__)

# Label mappings for English models
P_LABELS = {
    0: "Delivery Issue",
    1: "Food Quality",
    2: "Hygiene",
    3: "Service Quality",
    4: "Pricing",
    5: "Order Accuracy",
    6: "Bad Atmosphere",
    7: "Menu",
}


def predict_english_problem_type(text: str) -> str:
    """
    Predict English problem type using weighted soft voting (5 models).

    Weights: RoBERTa(2.4) + BERT(3.0) + LR(1.6) + RF(1.2) + SVM(2.2)

    Args:
        text: Input English text

    Returns:
        Predicted problem type label
    """
    try:
        weights = [2.4, 3.0, 1.6, 1.2, 2.2]
        sum_weights = sum(weights)

        # Model 1: RoBERTa
        p1 = predict_english_transformer_probs(text, "roberta_problem")
        logger.debug(f"English RoBERTa problem: {P_LABELS[np.argmax(p1)]}")

        # Model 2: BERT
        p2 = predict_english_transformer_probs(text, "bert_problem")
        logger.debug(f"English BERT problem: {P_LABELS[np.argmax(p2)]}")

        # Model 3: LR (problem type)
        p3 = predict_english_ml_probs(en_problem_lr, text)
        logger.debug(f"English LR problem: {P_LABELS[np.argmax(p3)]}")

        # Model 4: RF (problem type)
        p4 = predict_english_ml_probs(en_problem_rf, text)
        logger.debug(f"English RF problem: {P_LABELS[np.argmax(p4)]}")

        # Model 5: SVM (problem type) - with fallback for models without probability support
        try:
            p5 = predict_english_ml_probs(en_problem_svm, text)
            logger.debug(f"English SVM problem: {P_LABELS[np.argmax(p5)]}")
        except Exception as e:
            logger.warning(
                f"SVM problem type prediction failed: {str(e)}, using uniform distribution"
            )
            p5 = np.ones((1, 8)) / 8  # Uniform distribution for 8 classes

        # Weighted soft vote
        weighted = (
            weights[0] * p1
            + weights[1] * p2
            + weights[2] * p3
            + weights[3] * p4
            + weights[4] * p5
        ) / sum_weights

        final_idx = np.argmax(weighted, axis=1)[0]
        final_pred = P_LABELS[final_idx]

        logger.debug(f"English problem type weighted vote: {final_pred}")
        return final_pred

    except Exception as e:
        logger.error(
            f"Error in English problem type prediction: {str(e)}", exc_info=True
        )
        return "Service Quality"


def predict_english_emotion(text: str) -> str:
    """Predict English emotion using weighted soft voting (3 models)."""
    try:
        weights = [2.0, 1.5, 1.2]
        sum_weights = sum(weights)

        p1 = predict_english_transformer_probs(text, "roberta_emotion")
        p2 = predict_english_dl_probs(en_emotion_bilstm, text)
        p3 = predict_english_ml_probs(en_emotion_lr, text)

        weighted = (weights[0] * p1 + weights[1] * p2 + weights[2] * p3) / sum_weights

        final_idx = np.argmax(weighted, axis=1)[0]
        return E_LABELS[final_idx]

    except Exception as e:
        logger.error("Error in English emotion: %s", e, exc_info=True)
        return "Neutral"


def predict_english_sentiment(text: str) -> str:
    """Predict English sentiment using weighted soft voting (3 models)."""
    try:
        weights = [2.0, 1.5, 1.2]
        sum_weights = sum(weights)

        p1 = predict_english_transformer_probs(text, "roberta_sentiment")
        p2 = predict_english_ml_probs(en_sentiment_svm, text)
        p3 = predict_english_dl_probs(en_sentiment_gru, text)

        weighted = (weights[0] * p1 + weights[1] * p2 + weights[2] * p3) / sum_weights

        final_idx = np.argmax(weighted, axis=1)[0]
        return S_LABELS[final_idx]

    except Exception as e:
        logger.error("Error in English sentiment: %s", e, exc_info=True)
        return "Neutral"
