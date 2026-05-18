"""
Main AI pipeline orchestrator with language-aware ensemble voting.

Combines Arabic hard voting (5 models) and English weighted soft voting (3-5 models).
Language is re-detected from cleaned_text using route_pipeline function.
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
    SENTIMENT_DEFAULT_ID,
    SENTIMENT_DEFAULT_LABEL,
    SENTIMENT_LABEL2ID,
)
from app.ai.arabic.ensemble import (
    predict_arabic_sentiment,
    predict_arabic_emotion,
    predict_arabic_problem_type,
)
from app.ai.english.ensemble import (
    predict_english_sentiment,
    predict_english_emotion,
    predict_english_problem_type,
)
from app.ai.priority import calculate_priority
from app.preprocessing.router import route_pipeline

logger = logging.getLogger(__name__)


def should_classify_problem_type(sentiment: str, emotion: str) -> bool:
    """
    Determines whether problem type classification is worth running.
    No need to classify if feedback is clearly positive or neutral.

    Rules:
    - Positive sentiment → skip (no real complaint)
    - Neutral sentiment + Neutral or Satisfied emotion → skip
    - Everything else → classify

    Args:
        sentiment: Sentiment label ("Positive", "Neutral", "Negative")
        emotion: Emotion label ("Frustrated", "Satisfied", "Disgusted", "Neutral")

    Returns:
        bool: True if problem type classification should run, False otherwise
    """
    sentiment_key = (sentiment or "").strip().lower()
    emotion_key = (emotion or "").strip().lower()

    if sentiment_key == "positive":
        return False
    if sentiment_key == "neutral" and emotion_key in ["neutral", "satisfied"]:
        return False
    return True


def run_ai_pipeline(text: str) -> dict:
    """
    Run the complete AI prediction pipeline with language-aware ensemble voting.

    Pipeline flow:
    1. Detect language from cleaned_text using route_pipeline
       (franko text is already converted to Arabic, so will be detected as Arabic)
    2. Predict sentiment using appropriate language ensemble
    3. Predict emotion using appropriate language ensemble
    4. Conditionally predict problem type based on sentiment and emotion
    5. Calculate priority using sigmoid-based scoring

    Args:
        text: Cleaned text to analyze (preprocessed and potentially language-converted)

    Returns:
        Dictionary with keys: sentiment, emotion, problem_type, priority
    """
    try:
        if not text or text.strip() == "":
            logger.warning("Empty text provided to AI pipeline")
            return {
                "sentiment": SENTIMENT_DEFAULT_LABEL,
                "sentiment_id": SENTIMENT_DEFAULT_ID,
                "emotion": EMOTION_DEFAULT_LABEL,
                "emotion_id": EMOTION_DEFAULT_ID,
                "priority": "Low",
                "problem_type": PROBLEM_TYPE_DEFAULT_LABEL,
                "problem_type_id": PROBLEM_TYPE_DEFAULT_ID,
            }

        logger.debug(f"Running AI pipeline on text: {text[:100]}...")

        # Step 1: Detect language from cleaned_text
        # Note: franko text is already converted to Arabic by preprocessing,
        # so route_pipeline will correctly detect it as Arabic
        language = route_pipeline(text)
        logger.debug(f"Detected language: {language}")

        # Step 2 & 3: Predict sentiment and emotion based on language
        if language == "arabic":
            logger.debug("Running Arabic ensemble predictions")
            sentiment = predict_arabic_sentiment(text)
            emotion = predict_arabic_emotion(text)
        else:  # english
            logger.debug("Running English ensemble predictions")
            sentiment = predict_english_sentiment(text)
            emotion = predict_english_emotion(text)

        sentiment_key = (sentiment or "").strip().lower()
        emotion_key = (emotion or "").strip().lower()
        sentiment_id = SENTIMENT_LABEL2ID.get(sentiment_key, SENTIMENT_DEFAULT_ID)
        emotion_id = EMOTION_LABEL2ID.get(emotion_key, EMOTION_DEFAULT_ID)

        logger.debug(
            "Sentiment: %s (id=%s), Emotion: %s (id=%s)",
            sentiment_key,
            sentiment_id,
            emotion_key,
            emotion_id,
        )

        # Step 4: Conditionally predict problem type
        if should_classify_problem_type(sentiment, emotion):
            logger.debug(
                f"Classifying problem type (sentiment={sentiment}, emotion={emotion})"
            )
            if language == "arabic":
                problem_type = predict_arabic_problem_type(text)
            else:  # english
                problem_type = predict_english_problem_type(text)
        else:
            # Feedback is positive or neutral+satisfied — no problem to classify
            problem_type = None
            logger.debug(
                f"Skipping problem type classification (sentiment={sentiment}, emotion={emotion})"
            )

        problem_type_id = (
            PROBLEM_TYPE_LABEL2ID.get(problem_type, PROBLEM_TYPE_DEFAULT_ID)
            if problem_type
            else None
        )

        # Step 5: Calculate priority using sigmoid scoring
        priority = calculate_priority(
            problem_type=problem_type, emotion=emotion, sentiment=sentiment
        )
        logger.debug(f"Priority: {priority}")

        result = {
            "sentiment": sentiment_key or SENTIMENT_DEFAULT_LABEL,
            "sentiment_id": sentiment_id,
            "emotion": emotion_key or EMOTION_DEFAULT_LABEL,
            "emotion_id": emotion_id,
            "priority": priority,
            "problem_type": problem_type,
            "problem_type_id": problem_type_id,
        }

        logger.info(f"AI pipeline result: {result}")
        return result

    except Exception as e:
        logger.error(f"Error running AI pipeline: {str(e)}", exc_info=True)
        raise
