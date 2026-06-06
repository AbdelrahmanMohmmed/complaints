"""English ensemble prediction using weighted soft voting.

Problem Type (5 models): RoBERTa(2.4) + BERT(3.0) + LR(1.6) + RF(1.2) + SVM(2.2)
Emotion (3 models): RoBERTa(2.0) + BiLSTM(1.5) + LR(1.2)
Sentiment (3 models): RoBERTa(2.0) + SVM(1.5) + GRU(1.2)
"""

from app.ai.english.ml_dl_predict import *
from app.ai.english.transformer_predict import *
from app.ai.labels import *


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
        weights = [2.4, 1.6, 1.2, 2.2]
        sum_weights = sum(weights)

        # Model 1: RoBERTa
        p1 = predict_english_transformer_probs(text, "roberta_problem")
        logger.debug(f"English RoBERTa problem: {PROBLEM_TYPE_ID2LABEL[np.argmax(p1)]}")

        # Model 3: LR (problem type)
        p3 = predict_english_ml_probs(en_problem_lr(), text)
        logger.debug(f"English LR problem: {PROBLEM_TYPE_ID2LABEL[np.argmax(p3)]}")

        # Model 4: RF (problem type)
        p4 = predict_english_ml_probs(en_problem_rf(), text)
        logger.debug(f"English RF problem: {PROBLEM_TYPE_ID2LABEL[np.argmax(p4)]}")

        # Model 5: SVM (problem type) - with fallback for models without probability support
        try:
            p5 = predict_english_ml_probs(en_problem_svm(), text)
            logger.debug(f"English SVM problem: {PROBLEM_TYPE_ID2LABEL[np.argmax(p5)]}")
        except Exception as e:
            logger.warning(
                f"SVM problem type prediction failed: {str(e)}, using uniform distribution"
            )
            p5 = np.ones((1, 8)) / 8  # Uniform distribution for 8 classes

        # Weighted soft vote
        weighted = (
            weights[0] * p1
            + weights[1] * p3
            + weights[2] * p4
            + weights[3] * p5
        ) / sum_weights

        final_idx = np.argmax(weighted, axis=1)[0]
        final_pred = PROBLEM_TYPE_ID2LABEL[final_idx]

        logger.debug(f"English problem type weighted vote: {final_pred}")
        return final_pred

    except Exception as e:
        logger.error(
            f"Error in English problem type prediction: {str(e)}", exc_info=True
        )
        return "Service Quality"


def predict_english_emotion(text: str) -> str:
    """
    Predict English emotion using weighted soft voting (3 models).

    Weights: RoBERTa(2.0) + BiLSTM(1.5) + LR(1.2)

    Args:
        text: Input English text

    Returns:
        Predicted emotion label
    """
    try:
        weights = [2.0, 1.5, 1.2]
        sum_weights = sum(weights)

        # Model 1: RoBERTa emotion
        p1 = predict_english_transformer_probs(text, "roberta_emotion")
        logger.debug(f"English RoBERTa emotion: {EMOTION_ID2LABEL[np.argmax(p1)]}")

        # Model 2: BiLSTM (emotion)
        p2 = predict_english_dl_probs(en_emotion_bilstm(), text)
        logger.debug(f"English BiLSTM emotion: {EMOTION_ID2LABEL[np.argmax(p2)]}")

        # Model 3: LR (emotion)
        p3 = predict_english_ml_probs(en_emotion_lr(), text)
        logger.debug(f"English LR emotion: {EMOTION_ID2LABEL[np.argmax(p3)]}")

        # Weighted soft vote
        weighted = (weights[0] * p1 + weights[1] * p2 + weights[2] * p3) / sum_weights

        final_idx = np.argmax(weighted, axis=1)[0]
        final_pred = EMOTION_ID2LABEL[final_idx]

        logger.debug(f"English emotion weighted vote: {final_pred}")
        return final_pred

    except Exception as e:
        logger.error(f"Error in English emotion prediction: {str(e)}", exc_info=True)
        return "Neutral"


def predict_english_sentiment(text: str) -> str:
    """
    Predict English sentiment using weighted soft voting (3 models).

    Weights: RoBERTa(2.0) + SVM(1.5) + GRU(1.2)

    Args:
        text: Input English text

    Returns:
        Predicted sentiment label
    """
    try:
        # If text is short, prefer a fine-tuned Hugging Face transformer (local if downloaded)
        weights = [2.0, 1.5, 1.2]
        sum_weights = sum(weights)

        # Model 1: RoBERTa sentiment
        p1 = predict_english_transformer_probs(text, "roberta_sentiment")
        logger.debug(f"English RoBERTa sentiment: {SENTIMENT_ID2LABEL[np.argmax(p1)]}")

        # Model 2: SVM (sentiment) - with fallback for models without probability support
        try:
            p2 = predict_english_ml_probs(en_sentiment_svm(), text)
            logger.debug(f"English SVM sentiment: {SENTIMENT_ID2LABEL[np.argmax(p2)]}")
        except Exception as e:
            logger.warning(
                f"SVM sentiment prediction failed: {str(e)}, using uniform distribution"
            )
            p2 = np.ones((1, 3)) / 3  # Uniform distribution for 3 classes

        # Model 3: GRU (sentiment)
        p3 = predict_english_dl_probs(en_sentiment_gru(), text)
        logger.debug(f"English GRU sentiment: {SENTIMENT_ID2LABEL[np.argmax(p3)]}")

        # Weighted soft vote
        weighted = (weights[0] * p1 + weights[1] * p2 + weights[2] * p3) / sum_weights

        final_idx = np.argmax(weighted, axis=1)[0]
        final_pred = SENTIMENT_ID2LABEL[final_idx]

        logger.debug(f"English sentiment weighted vote: {final_pred}")
        return final_pred

    except Exception as e:
        logger.error(f"Error in English sentiment prediction: {str(e)}", exc_info=True)
        return "Neutral"
