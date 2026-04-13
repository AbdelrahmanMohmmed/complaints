"""
Main AI pipeline orchestrator.
Combines sentiment, emotion, priority scoring, and problem type classification.
"""

import logging
from .sentiment import predict_sentiment
from .emotion import predict_emotion
from .priority import calculate_priority
from .problem_type import predict_problem_type_label

logger = logging.getLogger(__name__)


def run_ai_pipeline(text: str) -> dict:
    """
    Run the complete AI prediction pipeline.
    
    Args:
        text: Cleaned text to analyze
        
    Returns:
        Dictionary with keys: sentiment, emotion, priority, problem_type
    """
    try:
        if not text or text.strip() == "":
            logger.warning("Empty text provided to AI pipeline")
            return {
                "sentiment": "neutral",
                "emotion": "neutral",
                "priority": "Low",
                "problem_type": "Service Quality",
            }

        logger.debug(f"Running AI pipeline on text: {text[:100]}...")

        # Step 1: Predict sentiment
        sentiment = predict_sentiment(text)

        # Step 2: Predict emotion
        emotion = predict_emotion(text)

        # Step 3: Calculate priority
        priority = calculate_priority(sentiment, emotion)

        # Step 4: Predict problem type (ensemble voting)
        problem_type = predict_problem_type_label(text)

        result = {
            "sentiment": sentiment,
            "emotion": emotion,
            "priority": priority,
            "problem_type": problem_type,
        }

        logger.debug(f"AI pipeline result: {result}")
        return result

    except Exception as e:
        logger.error(f"Error running AI pipeline: {str(e)}", exc_info=True)
        raise
