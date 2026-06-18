"""Combined preprocessing + AI analysis service.

Runs as a single scheduled job - no separate preprocessing step.
Processes unprocessed feedback directly through AI models.
"""

import gc
import logging
import time
from typing import Any, Dict, List

from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from .. import database, models
from ..preprocessing.router import detect_language, preprocess_feedback
from ..ai.arabic_predictor import load_arabic_models, predict_arabic
from ..ai.english_predictor import load_english_models, predict_english
from ..ai.labels import (
    SENTIMENT_LABEL2ID,
    EMOTION_LABEL2ID,
    PROBLEM_TYPE_LABEL2ID,
)

logger = logging.getLogger(__name__)


def _get_unprocessed_feedback(db: Session, limit: int = 30) -> List[models.Feedback]:
    """Fetch unprocessed feedback records."""
    return (
        db.query(models.Feedback)
        .filter(models.Feedback.status == "unprocessed")
        .limit(limit)
        .all()
    )


def _update_feedback_record(
    db: Session, feedback: models.Feedback, predictions: Dict[str, Any]
):
    """Update a feedback record with AI predictions."""
    sentiment = predictions["sentiment"]
    emotion = predictions["emotion"]
    problem_type = predictions["problem_type"]

    feedback.sentiment = sentiment
    feedback.sentiment_id = SENTIMENT_LABEL2ID.get(sentiment.lower()) if sentiment else None
    feedback.emotion = emotion
    feedback.emotion_id = EMOTION_LABEL2ID.get(emotion.lower()) if emotion else None
    feedback.problem_type = problem_type
    feedback.problem_type_id = PROBLEM_TYPE_LABEL2ID.get(problem_type) if problem_type else None

    priority = predictions.get("priority")
    feedback.priority = priority.lower() if isinstance(priority, str) else priority
    feedback.status = "analyzed"
    feedback.ml_processed_at = func.now()


def run_combined_job(db: Session, batch_size: int = 30) -> int:
    """Run combined preprocess + AI on unprocessed feedback.

    Args:
        db: SQLAlchemy database session.
        batch_size: Number of records to process per run.

    Returns:
        Number of successfully processed feedback records.
    """
    processed_count = 0
    feedback_items = _get_unprocessed_feedback(db, limit=batch_size)

    if not feedback_items:
        logger.info("No unprocessed feedback to analyze.")
        return 0

    logger.info(f"Starting combined processing for {len(feedback_items)} feedback records.")
    job_start = time.time()

    # Split by language
    arabic_feedback = [f for f in feedback_items if f.language in ("ar", "franko")]
    english_feedback = [f for f in feedback_items if f.language == "en" or not f.language]

    # First pass: detect language and preprocess for all
    for fb in feedback_items:
        try:
            if not fb.feedback_context or not fb.feedback_context.strip():
                fb.language = "en"
                fb.cleaned_text = ""
            else:
                fb.language = detect_language(fb.feedback_context)
                fb.cleaned_text = preprocess_feedback(fb.feedback_context)
        except Exception as e:
            logger.error(f"Preprocess failed for feedback {fb.feedback_id}: {e}")
            fb.language = "en"
            fb.cleaned_text = fb.feedback_context or ""

    # Process Arabic feedback
    if arabic_feedback:
        logger.info(f"Processing {len(arabic_feedback)} Arabic feedback records.")
        try:
            arabic_models = load_arabic_models()
            for feedback in arabic_feedback:
                try:
                    if not feedback.cleaned_text:
                        continue
                    predictions = predict_arabic(feedback.cleaned_text, arabic_models)
                    _update_feedback_record(db, feedback, predictions)
                    processed_count += 1
                except Exception as e:
                    logger.error(f"Error analyzing Arabic feedback {feedback.feedback_id}: {e}")
                    continue
            db.commit()
        finally:
            del arabic_models
            gc.collect()
            logger.info("Unloaded Arabic models.")

    # Process English feedback
    if english_feedback:
        logger.info(f"Processing {len(english_feedback)} English feedback records.")
        try:
            english_models = load_english_models()
            for feedback in english_feedback:
                try:
                    if not feedback.cleaned_text:
                        continue
                    predictions = predict_english(feedback.cleaned_text, english_models)
                    _update_feedback_record(db, feedback, predictions)
                    processed_count += 1
                except Exception as e:
                    logger.error(f"Error analyzing English feedback {feedback.feedback_id}: {e}")
                    continue
            db.commit()
        finally:
            del english_models
            gc.collect()
            logger.info("Unloaded English models.")

    logger.info(f"Combined job completed: {processed_count} records in {time.time()-job_start:.2f}s.")
    return processed_count


def combined_service() -> None:
    """Wrapper function with database session management."""
    db = database.SessionLocal()
    try:
        processed = run_combined_job(db)
        logger.info(f"Combined service completed: {processed} records processed")
    except Exception as e:
        logger.error(f"Error in combined service: {e}", exc_info=True)
    finally:
        db.close()
