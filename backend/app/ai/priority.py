"""
Priority scoring engine using sigmoid-based scoring function.
Incorporates problem_type, emotion, and sentiment using weighted sigmoid scoring.
"""

import math
import logging

logger = logging.getLogger(__name__)


def sigmoid(z):
    """Sigmoid activation function for probability conversion."""
    return 1 / (1 + math.exp(-z))


def calculate_priority(problem_type: str, emotion: str, sentiment: str) -> str:
    """
    Convert labels from each predicted class into a priority score
    and this score is converted to an appropriate label.

    Args:
        problem_type (str): label for class problem type (can be None)
        emotion (str): label for class emotion
        sentiment (str): label for class sentiment

    Returns:
        Priority label (str): Critical, High, Medium or Low
    """
    try:
        # Map problem type to severity score
        problem_severity = {
            "Hygiene": 1.00,
            "Pricing": 0.35,
            "Service Quality": 0.80,
            "Delivery Issue": 0.50,
            "Order Accuracy": 0.60,
            "Food Quality": 0.90,
            "Bad Atmosphere": 0.20,
            "Menu": 0.15,
            None: 0.00
        }
        
        # Sentiment scoring
        sentiment_score = {
            "Negative": 1.0,
            "Neutral": 0.0,
            "Positive": -1.0
        }
        
        # Emotion scoring
        emotion_score = {
            "Frustrated": 1.0,
            "Disgusted": 0.9,
            "Neutral": 0.0,
            "Satisfied": -1.0
        }

        # Weights for each component
        w_problem = 2.0
        w_sentiment = 1.5
        w_emotion = 1.2
        bias = -2

        # Calculate weighted score
        z = (
            bias +
            w_problem * problem_severity.get(problem_type, 0.00) +
            w_sentiment * sentiment_score.get(sentiment, 0.0) +
            w_emotion * emotion_score.get(emotion, 0.0)
        )

        # Apply sigmoid to convert to probability (0-100 scale)
        prob = sigmoid(z) * 100

        # Convert probability to priority label
        if prob >= 75:
            priority = "Critical"
        elif prob >= 50:
            priority = "High"
        elif prob >= 25:
            priority = "Medium"
        else:
            priority = "Low"

        logger.debug(
            f"Priority calculated: {priority} (prob={prob:.2f}, "
            f"problem_type={problem_type}, sentiment={sentiment}, emotion={emotion})"
        )

        return priority

    except Exception as e:
        logger.error(
            f"Error calculating priority (problem_type={problem_type}, "
            f"sentiment={sentiment}, emotion={emotion}): {str(e)}",
            exc_info=True,
        )
        # Return default priority on error
        return "Medium"
