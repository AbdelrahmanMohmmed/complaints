"""Async AI analysis service."""

import logging
import asyncio
from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from .. import models
from ..ai.labels import *
from ..ai.predict import run_ai_pipeline

logger = logging.getLogger(__name__)


async def run_ai_analysis_async(db: AsyncSession) -> int:
    """Process AI analysis in async batches."""
    processed = 0
    batch_size = 3

    result = await db.execute(
        select(models.Feedback)
        .where(models.Feedback.status == "preprocessed")
        .limit(batch_size)
    )
    batch = result.scalars().all()

    if not batch:
        return 0

    tasks = [analyze_single(feedback.cleaned_text or "") for feedback in batch]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for feedback, result in zip(batch, results):
        try:
            if isinstance(result, Exception):
                raise result

            if not result:
                # Empty text — defaults
                feedback.sentiment = SENTIMENT_DEFAULT_LABEL      # ← ADD: string
                feedback.sentiment_id = SENTIMENT_DEFAULT_ID      # int
                feedback.emotion = EMOTION_DEFAULT_LABEL            # ← ADD: string
                feedback.emotion_id = EMOTION_DEFAULT_ID            # int
                feedback.problem_type = None                        # ← ADD: string
                feedback.problem_type_id = PROBLEM_TYPE_DEFAULT_ID  # int
                feedback.priority = "Low"
            else:
                # Sentiment: store BOTH string and id
                sentiment_key = result.get("sentiment", "") or SENTIMENT_DEFAULT_LABEL
                feedback.sentiment = sentiment_key.capitalize()     # ← ADD: "Positive", "Negative", "Neutral"
                feedback.sentiment_id = result.get("sentiment_id") or SENTIMENT_LABEL2ID.get(
                    sentiment_key, SENTIMENT_DEFAULT_ID
                )

                # Emotion: store BOTH string and id
                emotion_key = result.get("emotion", "") or EMOTION_DEFAULT_LABEL
                feedback.emotion = emotion_key.capitalize()       # ← ADD: "Happy", "Sad", etc.
                feedback.emotion_id = result.get("emotion_id") or EMOTION_LABEL2ID.get(
                    emotion_key, EMOTION_DEFAULT_ID
                )

                # Problem type: store BOTH string and id (can be None)
                problem_type_key = result.get("problem_type")
                if problem_type_key:
                    feedback.problem_type = problem_type_key.capitalize()  # ← ADD
                    feedback.problem_type_id = result.get("problem_type_id") or PROBLEM_TYPE_LABEL2ID.get(
                        problem_type_key, PROBLEM_TYPE_DEFAULT_ID
                    )
                else:
                    feedback.problem_type = None
                    feedback.problem_type_id = None

                # Priority
                priority_val = result.get("priority", "Low")
                # Handle if priority is int (1-4) from calculate_priority
                if isinstance(priority_val, int):
                    priority_map = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}
                    feedback.priority = priority_map.get(priority_val, "Low")
                else:
                    feedback.priority = str(priority_val)

            feedback.status = "analyzed"
            feedback.ml_processed_at = func.now()
            processed += 1

        except Exception as e:
            logger.error(f"AI failed for feedback {feedback.feedback_id}: {e}")
            # Don't mark as analyzed — will retry

    await db.commit()
    return processed


async def analyze_single(text: str) -> Dict[str, Any]:
    """Run AI pipeline in thread pool."""
    if not text.strip():
        return None

    loop = asyncio.get_running_loop()

    try:
        result = await asyncio.wait_for(
            loop.run_in_executor(None, run_ai_pipeline, text),
            timeout=45.0
        )
        return result
    except asyncio.TimeoutError:
        logger.error("AI pipeline timeout")
        raise