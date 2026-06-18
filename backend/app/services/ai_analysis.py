"""AI prediction service for scheduled feedback analysis.

Runs as a scheduled task after preprocessing via APScheduler.
Processes preprocessed feedback records through ML models to generate:
- Sentiment (positive/negative/neutral)
- Emotion (happy/sad/angry/etc.)
- Problem Type (Service Quality/Billing/etc.)
- Priority (high/medium/low)
"""

import gc
import logging
from typing import Any, Dict, List

from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from .. import database, models
from ..ai.arabic_predictor import load_arabic_models, predict_arabic
from ..ai.english_predictor import load_english_models, predict_english
from ..ai.labels import (
    SENTIMENT_LABEL2ID,
    EMOTION_LABEL2ID,
    PROBLEM_TYPE_LABEL2ID,
)

logger = logging.getLogger(__name__)


# ============================================================================
# Helper Functions
# ============================================================================


def _get_unprocessed_feedback(db: Session, limit: int = 30) -> List[models.Feedback]:
    """Fetch feedback records with status 'preprocessed', limited per run."""
    return (
        db.query(models.Feedback)
        .filter(models.Feedback.status == "preprocessed")
        .limit(limit)
        .all()
    )


def _batch_iterator(data: list, batch_size: int):
    """Yield successive n-sized chunks from a list."""
    for i in range(0, len(data), batch_size):
        yield data[i : i + batch_size]


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


# ============================================================================
# Main AI Analysis Job
# ============================================================================


def run_ai_job(db: Session, batch_size: int = 50, max_records: int = 30) -> int:
    """Run AI predictions on preprocessed feedback, batched by language.

    Args:
        db: SQLAlchemy database session.
        batch_size: Number of records to process per batch.
        max_records: Max records to process per run (prevents timeout).

    Returns:
        Number of successfully processed feedback records.
    """
    processed_count = 0
    feedback_items = _get_unprocessed_feedback(db, limit=max_records)
    if not feedback_items:
        logger.info("No preprocessed feedback to analyze.")
        return 0

    logger.info(f"Starting AI analysis for {len(feedback_items)} feedback records (limit={max_records}).")

    # Split by language
    arabic_feedback = [f for f in feedback_items if f.language in ("ar", "franko")]
    english_feedback = [f for f in feedback_items if f.language == "en" or not f.language]

    # Process Arabic feedback
    if arabic_feedback:
        logger.info(f"Processing {len(arabic_feedback)} Arabic feedback records.")
        try:
            arabic_models = load_arabic_models()
            for batch in _batch_iterator(arabic_feedback, batch_size):
                for feedback in batch:
                    try:
                        if not feedback.cleaned_text:
                            continue
                        predictions = predict_arabic(feedback.cleaned_text, arabic_models)
                        _update_feedback_record(db, feedback, predictions)
                        processed_count += 1
                    except Exception as e:
                        logger.error(
                            f"Error analyzing Arabic feedback {feedback.feedback_id}: {e}",
                            exc_info=True,
                        )
                        db.rollback()
                        continue
                db.commit()
        finally:
            del arabic_models
            gc.collect()
            logger.info("Unloaded Arabic models and triggered garbage collection.")

    # Process English feedback
    if english_feedback:
        logger.info(f"Processing {len(english_feedback)} English feedback records.")
        try:
            english_models = load_english_models()
            for batch in _batch_iterator(english_feedback, batch_size):
                for feedback in batch:
                    try:
                        if not feedback.cleaned_text:
                            continue
                        predictions = predict_english(feedback.cleaned_text, english_models)
                        _update_feedback_record(db, feedback, predictions)
                        processed_count += 1
                    except Exception as e:
                        logger.error(
                            f"Error analyzing English feedback {feedback.feedback_id}: {e}",
                            exc_info=True,
                        )
                        db.rollback()
                        continue
                db.commit()
        finally:
            del english_models
            gc.collect()
            logger.info("Unloaded English models and triggered garbage collection.")

    logger.info(f"AI analysis job completed: {processed_count} records processed.")
    return processed_count


# ============================================================================
# Service Wrapper
# ============================================================================


def ai_analysis_service() -> None:
    """Wrapper function for the AI analysis job with database session management.

    Called by APScheduler as a background scheduled task.
    Handles database session creation, error handling, and cleanup.
    """
    db = database.SessionLocal()
    try:
        processed = run_ai_job(db, max_records=30)
        logger.info(f"AI analysis service completed: {processed} records processed")
    except Exception as e:
        logger.error(f"Error in AI analysis service: {str(e)}", exc_info=True)
    finally:
        db.close()
