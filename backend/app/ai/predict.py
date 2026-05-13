"""
Main AI pipeline orchestrator.
Combines sentiment, emotion, priority scoring, and problem type classification.
"""

import logging
from .labels import (
    EMOTION_DEFAULT_ID,
    EMOTION_DEFAULT_LABEL,
    EMOTION_ID2LABEL,
    EMOTION_LABEL2ID,
    PROBLEM_TYPE_DEFAULT_ID,
    PROBLEM_TYPE_DEFAULT_LABEL,
    PROBLEM_TYPE_LABEL2ID,
    PROBLEM_TYPE_ID2LABEL,
)
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
        Dictionary with keys: sentiment, emotion, emotion_id, priority, problem_type, problem_type_id
    """
    try:
        if not text or text.strip() == "":
            logger.warning("Empty text provided to AI pipeline")
            return {
                "sentiment": "neutral",
                "emotion": EMOTION_DEFAULT_LABEL,
                "emotion_id": EMOTION_DEFAULT_ID,
                "priority": "Low",
                "problem_type": PROBLEM_TYPE_DEFAULT_LABEL,
                "problem_type_id": PROBLEM_TYPE_DEFAULT_ID,
            }

        logger.debug(f"Running AI pipeline on text: {text[:100]}...")

        # Step 1: Predict sentiment
        sentiment = predict_sentiment(text)

        # Step 2: Predict emotion
        emotion = predict_emotion(text)
        emotion_id = EMOTION_LABEL2ID.get(emotion, EMOTION_DEFAULT_ID)
        emotion = EMOTION_ID2LABEL.get(emotion_id, EMOTION_DEFAULT_LABEL)

        # Step 3: Calculate priority
        priority = calculate_priority(sentiment, emotion)

        # Step 4: Predict problem type (ensemble voting)
        problem_type = predict_problem_type_label(text)
        problem_type_id = PROBLEM_TYPE_LABEL2ID.get(
            problem_type, PROBLEM_TYPE_DEFAULT_ID
        )
        problem_type = PROBLEM_TYPE_ID2LABEL.get(
            problem_type_id, PROBLEM_TYPE_DEFAULT_LABEL
        )

        result = {
            "sentiment": sentiment,
            "emotion": emotion,
            "emotion_id": emotion_id,
            "priority": priority,
            "problem_type": problem_type,
            "problem_type_id": problem_type_id,
        }

        logger.debug(f"AI pipeline result: {result}")
        return result

    except Exception as e:
        logger.error(f"Error running AI pipeline: {str(e)}", exc_info=True)
        raise
