"""Feedback preprocessing service for cleansing and normalizing text.

Runs as a scheduled task after feedback ingestion via APScheduler.
Transforms raw feedback text into cleaned, normalized format for ML analysis.
"""

import logging
from typing import Optional

from sqlalchemy import and_
from sqlalchemy.orm import Session

from .. import database, models
from ..preprocessing.router import detect_language, preprocess_feedback

logger = logging.getLogger(__name__)


# ============================================================================
# Helper Functions
# ============================================================================


def _is_empty_content(content: str) -> bool:
    """Check if feedback content is empty or whitespace-only."""
    return not content or content.strip() == ""


# ============================================================================
# Main Preprocessing Job
# ============================================================================


def run_preprocessing_job(db: Session) -> int:
    """Preprocess all unprocessed feedback records.

    Transforms raw feedback_context into cleaned_text using text preprocessing.
    Updates status from 'unprocessed' to 'preprocessed'.

    Args:
        db: Database session

    Returns:
        Number of successfully processed records
    """
    processed_count = 0
    error_count = 0

    try:
        # Query all feedback with status = unprocessed
        unprocessed_feedback = db.query(models.Feedback).filter(
            models.Feedback.status == "unprocessed"
        ).all()

        logger.info(f"Starting preprocessing for {len(unprocessed_feedback)} feedback records")

        # Process each feedback record
        for feedback in unprocessed_feedback:
            try:
                # Handle feedback with empty content
                if _is_empty_content(feedback.feedback_context):
                    feedback.language = "en"
                    feedback.cleaned_text = ""
                    feedback.status = "preprocessed"
                    db.commit()
                    logger.debug(f"Feedback {feedback.feedback_id}: empty content, marked as preprocessed")
                    processed_count += 1
                    continue

                # Clean and normalize feedback text
                feedback.language = detect_language(feedback.feedback_context)
                cleaned_text = preprocess_feedback(feedback.feedback_context)

                # Update feedback with cleaned text and status
                feedback.cleaned_text = cleaned_text
                feedback.status = "preprocessed"
                db.commit()

                processed_count += 1
                logger.debug(f"Feedback {feedback.feedback_id}: preprocessing successful")

            except Exception as e:
                error_count += 1
                logger.error(
                    f"Error preprocessing feedback {feedback.feedback_id}: {str(e)}",
                    exc_info=True,
                )
                db.rollback()
                continue

        # Log job completion
        logger.info(
            f"Preprocessing job completed: {processed_count} processed, {error_count} errors"
        )
        return processed_count

    except Exception as e:
        logger.error(f"Critical error in preprocessing job: {str(e)}", exc_info=True)
        db.rollback()
        return processed_count


# ============================================================================
# Service Wrapper
# ============================================================================


def preprocess_feedback_service() -> None:
    """Wrapper function for preprocessing job with database session management.

    Called by APScheduler as a background scheduled task.
    Handles database session creation, error handling, and cleanup.
    """
    db = database.SessionLocal()
    try:
        processed = run_preprocessing_job(db)
        logger.info(f"Preprocessing service completed: {processed} records processed")
    except Exception as e:
        logger.error(f"Error in preprocessing service: {str(e)}", exc_info=True)
    finally:
        db.close()
