"""
Feedback preprocessing service for cleansing and normalizing text.
Runs as a scheduled task after feedback ingestion via APScheduler.
"""
import logging
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .. import models, database
from ..preprocessing.router import preprocess_feedback

logger = logging.getLogger(__name__)


def run_preprocessing_job(db: Session) -> int:
    """
    Preprocess all unprocessed feedback records.
    
    Args:
        db: Database session
        
    Returns:
        Number of successfully processed records
    """
    processed_count = 0
    error_count = 0
    
    try:
        # Query all feedback with status = unprocessed
        unprocessed = db.query(models.Feedback).filter(
            models.Feedback.status == "unprocessed"
        ).all()
        
        logger.info(f"Starting preprocessing for {len(unprocessed)} feedback records")
        
        for feedback in unprocessed:
            try:
                # Skip feedback with empty content
                if not feedback.feedback_context or feedback.feedback_context.strip() == "":
                    logger.debug(f"Feedback {feedback.feedback_id}: empty content, skipping")
                    feedback.status = "preprocessed"
                    feedback.cleaned_text = ""
                    db.commit()
                    processed_count += 1
                    continue
                
                # Preprocess the feedback text
                cleaned = preprocess_feedback(feedback.feedback_context)
                
                # Update the feedback record
                feedback.cleaned_text = cleaned
                feedback.status = "preprocessed"
                db.commit()
                
                processed_count += 1
                logger.debug(f"Feedback {feedback.feedback_id}: preprocessing successful")
                
            except Exception as e:
                error_count += 1
                logger.error(
                    f"Error preprocessing feedback {feedback.feedback_id}: {str(e)}",
                    exc_info=True
                )
                db.rollback()
                # Continue with next record even if one fails
                continue
        
        logger.info(
            f"Preprocessing job completed: {processed_count} successful, {error_count} errors"
        )
        return processed_count
        
    except Exception as e:
        logger.error(f"Critical error in preprocessing job: {str(e)}", exc_info=True)
        db.rollback()
        return processed_count


def preprocess_feedback_service():
    """
    Wrapper function to run the preprocessing job with database session.
    Called by APScheduler.
    """
    db = database.SessionLocal()
    try:
        count = run_preprocessing_job(db)
        logger.info(f"Preprocessing service processed {count} records")
    except Exception as e:
        logger.error(f"Error in preprocessing service: {str(e)}", exc_info=True)
    finally:
        db.close()
