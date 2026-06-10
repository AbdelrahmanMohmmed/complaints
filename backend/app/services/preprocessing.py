"""Async preprocessing service."""

import logging
import asyncio
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .. import models
from ..preprocessing.router import preprocess_feedback

logger = logging.getLogger(__name__)


async def run_preprocessing_async(db: AsyncSession) -> int:
    """Process feedback in small concurrent batches."""
    processed = 0
    batch_size = 5  # Small batches for responsiveness

    while True:
        # Fetch batch
        result = await db.execute(
            select(models.Feedback)
            .where(models.Feedback.status == "unprocessed")
            .limit(batch_size)
        )
        batch = result.scalars().all()

        if not batch:
            break

        # Process concurrently using thread pool for sync ML code
        tasks = []
        for feedback in batch:
            task = preprocess_single(feedback.feedback_context or "")
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Apply results
        for feedback, result in zip(batch, results):
            if isinstance(result, Exception):
                logger.error(f"Preprocessing failed: {result}")
                feedback.cleaned_text = feedback.feedback_context or ""
            else:
                feedback.cleaned_text = result
                processed += 1

            feedback.status = "preprocessed"

        await db.commit()
        logger.debug(f"Preprocessed batch: {processed} total")

        # Yield control to event loop (critical for responsiveness!)
        await asyncio.sleep(0.001)

    return processed


async def preprocess_single(text: str) -> str:
    """Run preprocessing in thread pool."""
    if not text or not text.strip():
        return ""

    # Basic cleaning first
    cleaned = text.replace('\n', ' ').replace('\r', ' ')
    cleaned = ' '.join(cleaned.split())

    # Run ML preprocessing in thread pool (never block event loop!)
    loop = asyncio.get_running_loop()

    try:
        result = await asyncio.wait_for(
            loop.run_in_executor(None, preprocess_feedback, cleaned),
            timeout=10.0
        )
        return await result or cleaned
    except asyncio.TimeoutError:
        logger.warning("Preprocessing timeout, returning basic clean")
        return cleaned
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        return cleaned