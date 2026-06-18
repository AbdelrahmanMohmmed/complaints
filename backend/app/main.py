"""Main FastAPI application - SIMPLIFIED with single combined job."""

import asyncio
import logging
import sys
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from . import models, database
from .routers import (
    auth, company, contact, dashboard, domain,
    feedback, integration, categories, user,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .services.feedback_ingestion import ingest_feedback
from .services.combined_service import combined_service
from fastapi.responses import HTMLResponse

# ============================================================================
# Logging Configuration
# ============================================================================

logging.basicConfig(
    level=logging.INFO,  # Changed to INFO to reduce noise
    format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logging.getLogger("app.ai").setLevel(logging.INFO)
logging.getLogger("app.services").setLevel(logging.INFO)
logging.getLogger("app.preprocessing").setLevel(logging.INFO)
logging.getLogger("httpcore").setLevel(logging.WARNING)  # Reduce HTTP noise
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

if sys.platform == "win32" and hasattr(asyncio, "WindowsProactorEventLoopPolicy"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())


# ============================================================================
# Database & Application Setup
# ============================================================================

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Complaints Management System", version="1.0.0")

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
# Background Jobs - SIMPLIFIED
# ============================================================================


def run_ingestion_job():
    """Ingest feedback from all integrated sources."""
    try:
        logger.info("[Ingestion] Starting...")
        asyncio.run(ingest_feedback())
        logger.info("[Ingestion] Done.")
    except Exception as e:
        logger.error(f"[Ingestion] Error: {e}")


def run_combined_job():
    """Combined preprocess + AI analysis on unprocessed feedback."""
    try:
        logger.info("[Combined] Starting preprocess + AI...")
        combined_service()
        logger.info("[Combined] Done.")
    except Exception as e:
        logger.error(f"[Combined] Error: {e}", exc_info=True)


@app.on_event("startup")
async def startup_event() -> None:
    global scheduler
    try:
        logger.info("Starting scheduler with 2 jobs...")
        scheduler = BackgroundScheduler()

        # Ingestion every 5 minutes
        scheduler.add_job(
            run_ingestion_job,
            trigger=IntervalTrigger(minutes=5),
            id="ingestion_job",
            name="Feedback Ingestion",
            replace_existing=True,
            max_instances=2,
        )
        logger.info("  ✓ Ingestion: every 5 min")

        # Combined preprocess + AI every 2 minutes
        scheduler.add_job(
            run_combined_job,
            trigger=IntervalTrigger(minutes=2),
            id="combined_job",
            name="Preprocess + AI Analysis",
            replace_existing=True,
            max_instances=1,
            coalesce=True,  # <--- Add this to merge skipped executions into a single run
        )
        logger.info("  ✓ Combined: every 2 min (preprocess + AI together)")

        scheduler.start()
        logger.info("✓ Scheduler started.")

    except Exception as e:
        logger.critical(f"Failed to start scheduler: {e}", exc_info=True)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    global scheduler
    if scheduler and scheduler.running:
        try:
            scheduler.shutdown(wait=True)
            logger.info("Scheduler shut down")
        except Exception as e:
            logger.error(f"Error shutting down: {e}")


# ============================================================================
# Endpoints
# ============================================================================

@app.get("/", tags=["Health"])
def health_check() -> dict:
    return {"status": "healthy", "message": "Complaints Management System API"}


@app.get("/health", tags=["Health"])
def health_status() -> dict:
    return {"status": "healthy", "service": "complaints-api", "version": "1.0.0"}


@app.get("/pipeline-status", tags=["Health"])
def pipeline_status() -> dict:
    db = database.SessionLocal()
    try:
        unprocessed = db.query(models.Feedback).filter(models.Feedback.status == "unprocessed").count()
        analyzed = db.query(models.Feedback).filter(models.Feedback.status == "analyzed").count()
        total = db.query(models.Feedback).count()
        return {
            "unprocessed": unprocessed,
            "analyzed": analyzed,
            "total": total,
        }
    finally:
        db.close()


@app.post("/admin/trigger-pipeline", tags=["Admin"])
def trigger_pipeline():
    run_combined_job()
    return {"status": "pipeline triggered"}


@app.get("/privacy", include_in_schema=False)
def privacy_policy():
    return HTMLResponse("""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Privacy Policy</title></head>
<body>
    <h1>Privacy Policy</h1>
    <p>Last updated: June 2025</p>
    <h2>What We Collect</h2>
    <p>FMS collects Facebook Page access tokens...</p>
</body>
</html>
    """)