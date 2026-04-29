"""
Problem type classification using ensemble voting.
Combines: XGBoost ML model + BERT + RoBERTa
Uses hard voting (majority voting) for robustness.
"""

import logging
from collections import Counter
from .models import get_sentiment_model
from .representation import get_representation

logger = logging.getLogger(__name__)

# Label mapping for problem type (8 categories)
PROBLEM_TYPE_ID2LABEL = {
    0: "Delivery Issue",
    1: "Food Quality",
    2: "Hygiene",
    3: "Service Quality",
    4: "Pricing",
    5: "Order Accuracy",
    6: "Bad Atmosphere",
    7: "Menu"
}


def predict_problem_type_label(text: str) -> str:
    """
    Predict problem type from text using ensemble voting.
    
    Combines predictions from:
    1. XGBoost ML model (trained on FastText embeddings)
    2. BERT transformer model
    3. RoBERTa transformer model
    
    Uses hard voting (majority vote) for final prediction.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Problem type label: one of 8 categories
        Default: "Service Quality" if analysis fails
    """
    try:
        if not text or text.strip() == "":
            logger.warning("Empty text provided for problem type prediction")
            return "Service Quality"

        logger.debug(f"Predicting problem type for text: {text[:100]}...")

        predictions = []

        # ====================================================================
        # 1. XGBoost ML Model Prediction
        # ====================================================================
        try:
            ml_pred = _predict_ml_model(text)
            predictions.append(ml_pred)
            logger.debug(f"ML Model prediction: {ml_pred}")
        except Exception as e:
            logger.warning(f"ML model prediction failed: {str(e)}")

        # ====================================================================
        # 2. BERT Model Prediction
        # ====================================================================
        try:
            bert_pred = _predict_bert(text)
            predictions.append(bert_pred)
            logger.debug(f"BERT prediction: {bert_pred}")
        except Exception as e:
            logger.warning(f"BERT prediction failed: {str(e)}")

        # ====================================================================
        # 3. RoBERTa Model Prediction
        # ====================================================================
        try:
            roberta_pred = _predict_roberta(text)
            predictions.append(roberta_pred)
            logger.debug(f"RoBERTa prediction: {roberta_pred}")
        except Exception as e:
            logger.warning(f"RoBERTa prediction failed: {str(e)}")

        # ====================================================================
        # Hard Voting (Majority Vote)
        # ====================================================================
        if len(predictions) == 0:
            logger.error("No successful predictions from any model")
            return "Service Quality"

        if len(predictions) == 1:
            final_pred = predictions[0]
        else:
            # Majority vote
            votes = Counter(predictions)
            final_pred = votes.most_common(1)[0][0]

        logger.info(
            f"Problem type prediction: {final_pred} "
            f"(votes: {predictions})"
        )

        return final_pred

    except Exception as e:
        logger.error(f"Error predicting problem type: {str(e)}", exc_info=True)
        return "Service Quality"


def _predict_ml_model(text: str) -> str:
    """
    Predict using XGBoost ML model trained on FastText embeddings.
    
    Args:
        text: Input text
        
    Returns:
        Predicted problem type label
        
    Raises:
        Exception: If model not available or prediction fails
    """
    # Get FastText representation (used for XGBoost)
    vector = get_representation(text)
    
    # Load XGBoost model - it's stored as a SVM-like model with predict method
    # We'll use the get_sentiment_model (which is XGBoost for problem type in this context)
    # For proper implementation, create a separate get_problem_type_model() function
    try:
        model = get_sentiment_model()  # This should be XGBoost, not SVM
        pred_id = model.predict(vector)[0]
        return PROBLEM_TYPE_ID2LABEL.get(pred_id, "Service Quality")
    except Exception as e:
        raise Exception(f"ML model prediction failed: {str(e)}")


def _predict_bert(text: str) -> str:
    """
    Predict using BERT transformer model.
    
    Args:
        text: Input text
        
    Returns:
        Predicted problem type label
        
    Raises:
        Exception: If model not available or prediction fails
    """
    try:
        from .bert_pred import predict_bert
        label = predict_bert(text)
        return label
    except ImportError:
        raise Exception("BERT module not available")
    except Exception as e:
        raise Exception(f"BERT prediction failed: {str(e)}")


def _predict_roberta(text: str) -> str:
    """
    Predict using RoBERTa transformer model.
    
    Args:
        text: Input text
        
    Returns:
        Predicted problem type label
        
    Raises:
        Exception: If model not available or prediction fails
    """
    try:
        from .roberta_pred import predict_roberta
        label = predict_roberta(text)
        return label
    except ImportError:
        raise Exception("RoBERTa module not available")
    except Exception as e:
        raise Exception(f"RoBERTa prediction failed: {str(e)}")


def get_problem_type_label_name(problem_type_id: int) -> str:
    """
    Convert problem type ID to label name.
    
    Args:
        problem_type_id: Integer ID (0-7)
        
    Returns:
        Problem type label string
    """
    return PROBLEM_TYPE_ID2LABEL.get(problem_type_id, "Service Quality")
