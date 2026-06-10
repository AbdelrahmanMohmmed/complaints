"""Main FastAPI application with async background processing."""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ['ABSL_MIN_LOG_LEVEL'] = '1'

import logging

logging.getLogger('absl').setLevel(logging.WARNING)

from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import database, models
from .routers import auth, company, contact, dashboard, domain, feedback, integration, user
from .services.feedback_ingestion import ingest_feedback_async
from .services.preprocessing import run_preprocessing_async
from .services.ai_analysis import run_ai_analysis_async

# ============================================================================
# Logging
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Suppress noisy ML libraries
logging.getLogger('tensorflow').setLevel(logging.ERROR)
logging.getLogger('absl').setLevel(logging.WARNING)
logging.getLogger('jax').setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# ============================================================================
# Scheduler
# ============================================================================

scheduler = AsyncIOScheduler()

# ============================================================================
# Background Jobs (Async)
# ============================================================================

async def feedback_ingestion_job():
    """No session passed — ingestion manages its own."""
    try:
        await ingest_feedback_async()  # No db argument!
    except Exception as e:
        logger.error(f"Ingestion failed: {e}", exc_info=True)

async def preprocessing_job():
    """Clean and normalize text."""
    async with database.AsyncSessionLocal() as db:
        try:
            count = await run_preprocessing_async(db)
            if count > 0:
                logger.info(f"Preprocessed {count} records")
        except Exception as e:
            logger.error(f"Preprocessing failed: {e}", exc_info=True)

async def ai_analysis_job():
    """Run ML predictions."""
    async with database.AsyncSessionLocal() as db:
        try:
            count = await run_ai_analysis_async(db)
            if count > 0:
                logger.info(f"AI analyzed {count} records")
        except Exception as e:
            logger.error(f"AI analysis failed: {e}", exc_info=True)

# ============================================================================
# Lifespan
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    try:
        # Create tables if not exists (sync, one-time)
        models.Base.metadata.create_all(bind=database.engine)

        scheduler.add_job(
            feedback_ingestion_job,
            trigger=IntervalTrigger(minutes=1),
            id="ingestion",
            replace_existing=True,
            max_instances=1,
            misfire_grace_time=30,
        )
        scheduler.add_job(
            preprocessing_job,
            trigger=IntervalTrigger(seconds=10),
            id="preprocessing",
            replace_existing=True,
            max_instances=1,
            misfire_grace_time=30,
        )
        scheduler.add_job(
            ai_analysis_job,
            trigger=IntervalTrigger(seconds=15),  # Slightly slower than preprocessing
            id="ai_analysis",
            replace_existing=True,
            max_instances=1,
            misfire_grace_time=30,
        )

        scheduler.start()
        logger.info("Async scheduler started - API ready for concurrent users")

    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

    yield

    # Shutdown
    if scheduler.running:
        scheduler.shutdown(wait=True)
        logger.info("Scheduler shut down")

# ============================================================================
# FastAPI App
# ============================================================================

app = FastAPI(
    title="Complaints Management System",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from fastapi.responses import HTMLResponse
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
    <p>For any privacy concerns, contact us at: <strong>wovidoe23@gmail.com</strong></p>
</body>
</html>
    """)
# Routers
app.include_router(user.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(company.router, prefix="/api/v1")
app.include_router(integration.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(domain.router, prefix="/api/v1")
app.include_router(contact.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

# ============================================================================
# Health Checks (Always Fast!)
# ============================================================================

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "healthy",
        "service": "complaints-api",
        "version": "2.0.0",
        "scheduler": "running" if scheduler.running else "stopped",
    }

@app.get("/health", tags=["Health"])
async def health():
    jobs = scheduler.get_jobs()
    return {
        "status": "healthy",
        "scheduler_running": scheduler.running,
        "active_jobs": len(jobs),
        "job_names": [j.name for j in jobs],
    }