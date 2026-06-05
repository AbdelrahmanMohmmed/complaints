"""Main FastAPI application with middleware, routes, and background schedulers."""

import asyncio
import logging
import threading
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import asyncio
from . import models, database
from .routers import (
    auth,
    company,
    contact,
    dashboard,
    domain,
    feedback,
    integration,
    categories,
    user,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import database, models
from .ai import load_models
from .config import settings
from .services.ai_analysis import ai_analysis_service
from .services.feedback_ingestion import ingest_feedback
from .services.preprocessing import preprocess_feedback_service

# ============================================================================
# Logging Configuration
# ============================================================================

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Configure module-specific loggers
logging.getLogger("app.ai").setLevel(logging.DEBUG)
logging.getLogger("app.services").setLevel(logging.DEBUG)
logging.getLogger("app.preprocessing").setLevel(logging.DEBUG)

logger = logging.getLogger(__name__)


# ============================================================================
# Database & Application Setup
# ============================================================================

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Complaints Management System", version="1.0.0")

# Global scheduler instance
scheduler = None


# ============================================================================
# Middleware Configuration
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(company.router, prefix="/api/v1")
app.include_router(integration.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(domain.router, prefix="/api/v1")
app.include_router(contact.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")


# ============================================================================
# Scheduled Background Jobs
# ============================================================================


def scheduled_feedback_ingestion() -> None:
    """Wrapper to run async feedback ingestion job synchronously."""
    try:
        asyncio.run(ingest_feedback())
    except Exception as e:
        logger.error(f"Error in scheduled feedback ingestion: {str(e)}", exc_info=True)


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize and start background schedulers on application startup.

    Tasks:
    - Load pre-trained AI models from configured paths
    - Initialize APScheduler for feedback pipeline
    - Schedule three periodic jobs: ingestion, preprocessing, AI analysis
    """
    global scheduler
    def _preload():
        logger.info("Background model preloading started...")
        from app.ai.arabic.ensemble import predict_arabic_problem_type, predict_arabic_emotion, predict_arabic_sentiment
        from app.ai.english.ensemble import predict_english_problem_type, predict_english_emotion, predict_english_sentiment
        predict_arabic_problem_type("test")
        predict_arabic_emotion("test")
        predict_arabic_sentiment("test")
        predict_english_problem_type("test")
        predict_english_emotion("test")
        predict_english_sentiment("test")
        logger.info("Background model preloading complete")
    
    threading.Thread(target=_preload, daemon=True).start()
    try:
        # Validate AI model configuration (models load lazily on first use)
        logger.info("Validating AI model configuration...")
        models_loaded = load_models()

        if models_loaded:
            logger.info("AI model configuration validated successfully")
        else:
            logger.warning("Some AI models are not configured. Check .env paths.")

        # Initialize scheduler
        scheduler = BackgroundScheduler()

        # Schedule feedback ingestion (fetch from APIs)
        scheduler.add_job(
            scheduled_feedback_ingestion,
            trigger=IntervalTrigger(minutes=1),
            id="feedback_ingestion_job",
            name="Feedback Ingestion Job",
            replace_existing=True,
        )

        # Schedule text preprocessing
        scheduler.add_job(
            preprocess_feedback_service,
            trigger=IntervalTrigger(minutes=1),
            id="feedback_preprocessing_job",
            name="Feedback Preprocessing Job",
            replace_existing=True,
        )

        # Schedule ML analysis (sentiment, emotion, priority scoring)
        scheduler.add_job(
            ai_analysis_service,
            trigger=IntervalTrigger(minutes=1),
            id="feedback_ai_job",
            name="Feedback AI Analysis Job",
            replace_existing=True,
        )

        scheduler.start()
        logger.info("All background schedulers started successfully")

    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}", exc_info=True)
        raise


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Gracefully shutdown background schedulers on application shutdown."""
    global scheduler

    if scheduler and scheduler.running:
        try:
            scheduler.shutdown(wait=True)
            logger.info("Schedulers shut down gracefully")
        except Exception as e:
            logger.error(f"Error shutting down scheduler: {str(e)}", exc_info=True)


# ============================================================================
# Health Check Endpoints
# ============================================================================


@app.get("/", tags=["Health"])
def health_check() -> dict:
    """Root health check endpoint."""
    return {"status": "healthy", "message": "Complaints Management System API"}


@app.get("/health", tags=["Health"])
def health_status() -> dict:
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "service": "complaints-api",
        "version": "1.0.0",
    }
