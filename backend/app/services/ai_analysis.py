"""
AI prediction service for scheduled feedback analysis.
Runs as a scheduled task after preprocessing via APScheduler.
"""

import logging
from sqlalchemy.orm import Session
from .. import models, database
from ..ai.predict import run_ai_pipeline

logger = logging.getLogger(__name__)


def run_ai_job(db: Session) -> int:
    """
    Run AI predictions and priority scoring on preprocessed feedback.
    
    Args:
        db: Database session
        
    Returns:
        Number of successfully processed records
    """
    processed_count = 0
    error_count = 0

    try:
        # Query all feedback with status = preprocessed
        preprocessed = db.query(models.Feedback).filter(
            models.Feedback.status == "preprocessed"
        ).all()

        logger.info(f"Starting AI analysis for {len(preprocessed)} feedback records")

        for feedback in preprocessed:
            try:
                # Skip feedback with empty cleaned_text
                if not feedback.cleaned_text or feedback.cleaned_text.strip() == "":
                    logger.debug(f"Feedback {feedback.feedback_id}: empty cleaned_text, skipping")
                    feedback.status = "analyzed"
                    feedback.sentiment = "neutral"
                    feedback.emotion = "neutral"
                    feedback.priority = "Low"
                    db.commit()
                    processed_count += 1
                    continue

                # Run AI pipeline
                results = run_ai_pipeline(feedback.cleaned_text)

                # Update feedback record
                feedback.sentiment = results["sentiment"]
                feedback.emotion = results["emotion"]
                feedback.priority = results["priority"]
                feedback.status = "analyzed"
                db.commit()

                processed_count += 1
                logger.debug(
                    f"Feedback {feedback.feedback_id}: AI analysis successful - "
                    f"sentiment={results['sentiment']}, emotion={results['emotion']}, "
                    f"priority={results['priority']}"
                )

            except Exception as e:
                error_count += 1
                logger.error(
                    f"Error analyzing feedback {feedback.feedback_id}: {str(e)}",
                    exc_info=True,
                )
                db.rollback()
                # Continue with next record even if one fails
                continue

        logger.info(
            f"AI analysis job completed: {processed_count} successful, {error_count} errors"
        )
        return processed_count

    except Exception as e:
        logger.error(f"Critical error in AI analysis job: {str(e)}", exc_info=True)
        db.rollback()
        return processed_count


def ai_analysis_service():
    """
    Wrapper function to run the AI analysis job with database session.
    Called by APScheduler.
    """
    db = database.SessionLocal()
    try:
        count = run_ai_job(db)
        logger.info(f"AI analysis service processed {count} records")
    except Exception as e:
        logger.error(f"Error in AI analysis service: {str(e)}", exc_info=True)
    finally:
        db.close()
