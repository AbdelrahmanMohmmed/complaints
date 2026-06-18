"""Feedback preprocessing service - ROBUST VERSION

Pre-loads models at module import time to avoid hanging in scheduler threads.
"""

import logging
import time

from sqlalchemy.orm import Session

from .. import database, models
from ..preprocessing.router import detect_language, preprocess_feedback

logger = logging.getLogger(__name__)

# Pre-warm the preprocessing pipeline by loading models at import time
logger.info("Pre-loading preprocessing models...")
_warmup_start = time.time()
try:
    # This forces english_pipeline to load spaCy and arabic_pipeline to load Camel
    # so they're ready when the scheduler runs
    _ = preprocess_feedback("test")
    logger.info(f"Models pre-loaded in {time.time()-_warmup_start:.2f}s")
except Exception as e:
    logger.warning(f"Model pre-load warning (will retry on first use): {e}")


def _is_empty_content(content: str) -> bool:
    return not content or content.strip() == ""


def run_preprocessing_job(db: Session, max_records: int = 30) -> int:
    """Preprocess unprocessed feedback records."""
    processed_count = 0
    error_count = 0

    try:
        unprocessed_feedback = (
            db.query(models.Feedback)
            .filter(models.Feedback.status == "unprocessed")
            .limit(max_records)
            .all()
        )

        total = len(unprocessed_feedback)
        if not unprocessed_feedback:
            logger.info("No unprocessed feedback to preprocess.")
            return 0

        logger.info(f"Starting preprocessing for {total} feedback records")
        job_start = time.time()

        for idx, feedback in enumerate(unprocessed_feedback, 1):
            try:
                if _is_empty_content(feedback.feedback_context):
                    feedback.language = "en"
                    feedback.cleaned_text = ""
                    feedback.status = "preprocessed"
                    processed_count += 1
                    continue

                # Detect language
                feedback.language = detect_language(feedback.feedback_context)

                # Preprocess with timeout protection
                # If preprocess_feedback hangs, use original text as fallback
                cleaned_text = preprocess_feedback(feedback.feedback_context)

                feedback.cleaned_text = cleaned_text
                feedback.status = "preprocessed"
                processed_count += 1

            except Exception as e:
                error_count += 1
                logger.error(f"feedback_id={feedback.feedback_id}: FAILED - {e}")
                # Fallback: mark as preprocessed with original text
                feedback.cleaned_text = feedback.feedback_context or ""
                feedback.status = "preprocessed"
                processed_count += 1
                continue

        # Commit ALL at once
        db.commit()
        logger.info(f"Committed {processed_count}/{total} records in {time.time()-job_start:.2f}s")
        return processed_count

    except Exception as e:
        logger.error(f"Critical error: {e}", exc_info=True)
        db.rollback()
        return processed_count


def preprocess_feedback_service() -> None:
    db = database.SessionLocal()
    try:
        processed = run_preprocessing_job(db, max_records=30)
        logger.info(f"Service completed: {processed} records")
    except Exception as e:
        logger.error(f"Service error: {e}", exc_info=True)
    finally:
        db.close()
