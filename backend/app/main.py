"""Main FastAPI application with middleware, routes, and background schedulers."""

import asyncio
import logging
import sys
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
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

from .ai import load_models
from .config import settings
from .services.ai_analysis import run_ai_job
from .services.feedback_ingestion import ingest_feedback
from .services.preprocessing import preprocess_feedback_service
from fastapi.responses import HTMLResponse

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

if sys.platform == "win32" and hasattr(asyncio, "WindowsProactorEventLoopPolicy"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())


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


def run_sequential_pipeline():
    """
    Run the full feedback processing pipeline sequentially.
    1. Ingest feedback from all integrated sources.
    2. Preprocess newly ingested feedback.
    3. Run AI analysis on preprocessed feedback.
    """
    db = None
    try:
        logger.info("Starting sequential feedback pipeline...")

        # Step 1: Ingestion
        logger.info("Pipeline Step 1: Running feedback ingestion...")
        asyncio.run(ingest_feedback())
        logger.info("Pipeline Step 1: Feedback ingestion completed.")

        # Step 2: Preprocessing
        logger.info("Pipeline Step 2: Running feedback preprocessing...")
        preprocess_feedback_service()
        logger.info("Pipeline Step 2: Feedback preprocessing completed.")

        # Step 3: AI Analysis
        logger.info("Pipeline Step 3: Running AI analysis...")
        db = database.SessionLocal()
        run_ai_job(db)
        logger.info("Pipeline Step 3: AI analysis completed.")

        logger.info("Sequential feedback pipeline finished successfully.")

    except Exception as e:
        logger.error(f"Error in sequential feedback pipeline: {e}", exc_info=True)
    finally:
        if db:
            db.close()


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize and start background scheduler on application startup."""
    global scheduler
    try:
        logger.info("Initializing background scheduler...")
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            run_sequential_pipeline,
            trigger=IntervalTrigger(minutes=1),
            id="sequential_feedback_pipeline_job",
            name="Sequential Feedback Pipeline (Ingest -> Preprocess -> Analyze)",
            replace_existing=True,
        )
        scheduler.start()
        logger.info(
            "✓ Background scheduler started. Pipeline will run every hour."
        )
    except Exception as e:
        logger.critical(
            f"Failed to start background scheduler: {e}", exc_info=True
        )


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


@app.get("/privacy", include_in_schema=False)
def privacy_policy():
    return HTMLResponse("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Privacy Policy — FMS</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 60px auto; padding: 0 20px; color: #333; }
        h1   { color: #1a1a1a; }
        h2   { margin-top: 30px; }
    </style>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p><strong>Last updated:</strong> June 2025</p>

    <h2>What We Collect</h2>
    <p>FMS collects Facebook Page access tokens when you connect your Facebook account.
    These tokens are used solely to read comments from your Facebook Pages for feedback analysis.</p>

    <h2>How We Use It</h2>
    <p>Collected data is used only to analyze customer feedback within your organization.
    We do not sell, share, or transfer your data to any third party.</p>

    <h2>How We Store It</h2>
    <p>All tokens are encrypted at rest using industry-standard encryption (Fernet/AES-128).
    They are stored securely in our database and never exposed in plain text.</p>

    <h2>Your Rights</h2>
    <p>You can disconnect your Facebook Page at any time through the FMS dashboard,
    which will permanently delete your access token from our system.</p>

    <h2>Contact</h2>
    <p>For any privacy concerns, contact us at: <strong>aa3020942@gmail.com</strong></p>
</body>
</html>
    """)
