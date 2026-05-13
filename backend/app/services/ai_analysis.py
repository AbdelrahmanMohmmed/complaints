"""AI prediction service for scheduled feedback analysis.

Runs as a scheduled task after preprocessing via APScheduler.
Processes preprocessed feedback records through ML models to generate:
- Sentiment (positive/negative/neutral)
- Emotion (happy/sad/angry/etc.)
- Problem Type (Service Quality/Billing/etc.)
- Priority (high/medium/low)
"""

import logging
from typing import Any, Dict

from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from .. import database, models
from ..ai.predict import run_ai_pipeline

logger = logging.getLogger(__name__)


# ============================================================================
# Helper Functions
# ============================================================================


def _is_empty_text(text: str) -> bool:
    """Check if feedback text is empty or whitespace-only."""
    return not text or text.strip() == ""


def _handle_empty_feedback(feedback: models.Feedback, db: Session) -> None:
    """Mark feedback with empty text as analyzed with neutral defaults."""
    feedback.status = "analyzed"
    feedback.sentiment = "Neutral"
    feedback.emotion = "Neutral"
    feedback.problem_type = None
    feedback.priority = "Low"
    feedback.ml_processed_at = func.now()
    db.commit()
    logger.debug(f"Feedback {feedback.feedback_id}: marked as analyzed (empty content)")


def _update_feedback_with_results(
    feedback: models.Feedback, results: Dict[str, Any], db: Session
) -> None:
    """Update feedback record with AI analysis results and timestamp."""
    feedback.sentiment = results["sentiment"]
    feedback.emotion = results["emotion"]
    feedback.problem_type = results["problem_type"]
    feedback.priority = results["priority"]
    feedback.status = "analyzed"
    feedback.ml_processed_at = func.now()
    db.commit()


def _log_analysis_success(feedback_id: int, results: Dict[str, Any]) -> None:
    """Log successful AI analysis for a feedback record."""
    logger.debug(
        f"Feedback {feedback_id}: AI analysis successful | "
        f"sentiment={results['sentiment']}, "
        f"emotion={results['emotion']}, "
        f"problem_type={results['problem_type']}, "
        f"priority={results['priority']}"
    )


# ============================================================================
# Main AI Analysis Job
# ============================================================================


def run_ai_job(db: Session) -> int:
    """Run AI predictions and priority scoring on preprocessed feedback records.

    Processes all feedback with status='preprocessed', runs sentiment/emotion/
    problem_type/priority analysis, and updates database with results.

    Args:
        db: SQLAlchemy database session

    Returns:
        Number of successfully processed feedback records
    """
    processed_count = 0
    error_count = 0

    try:
        # Fetch all preprocessed feedback from database
        preprocessed_feedback = db.query(models.Feedback).filter(
            models.Feedback.status == "preprocessed"
        ).all()

        logger.info(f"Starting AI analysis for {len(preprocessed_feedback)} feedback records")

        # Process each feedback record
        for feedback in preprocessed_feedback:
            try:
                # Handle feedback with empty or whitespace-only text
                if _is_empty_text(feedback.cleaned_text):
                    _handle_empty_feedback(feedback, db)
                    processed_count += 1
                    continue

                # Run AI pipeline on cleaned text
                results = run_ai_pipeline(feedback.cleaned_text)

                # Update feedback record with analysis results
                _update_feedback_with_results(feedback, results, db)
                _log_analysis_success(feedback.feedback_id, results)

                processed_count += 1

            except Exception as e:
                error_count += 1
                logger.error(
                    f"Error analyzing feedback {feedback.feedback_id}: {str(e)}",
                    exc_info=True,
                )
                db.rollback()
                # Continue processing remaining records despite error
                continue

        # Log job completion summary
        logger.info(
            f"AI analysis job completed: {processed_count} processed, {error_count} errors"
        )
        return processed_count

    except Exception as e:
        logger.error(f"Critical error in AI analysis job: {str(e)}", exc_info=True)
        db.rollback()
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
        processed = run_ai_job(db)
        logger.info(f"AI analysis service completed: {processed} records processed")
    except Exception as e:
        logger.error(f"Error in AI analysis service: {str(e)}", exc_info=True)
    finally:
        db.close()
        db.close()


