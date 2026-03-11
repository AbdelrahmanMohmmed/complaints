from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import asyncio
from . import models , database
from .routers import  user, auth , company, integration
from .services.feedback_ingestion import ingest_feedback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Global scheduler instance
scheduler = None

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user.router,prefix="/api/v1")
app.include_router(auth.router,prefix="/api/v1")
app.include_router(company.router,prefix="/api/v1")
app.include_router(integration.router,prefix="/api/v1")


def scheduled_feedback_ingestion():
    """Wrapper function to run the async feedback ingestion job."""
    try:
        asyncio.run(ingest_feedback())
    except Exception as e:
        logger.error(f"Error in scheduled feedback ingestion: {str(e)}", exc_info=True)


@app.on_event("startup")
async def startup_event():
    """Initialize and start the APScheduler on app startup."""
    global scheduler
    
    try:
        scheduler = BackgroundScheduler()
        
        # Schedule the feedback ingestion job to run every hour
        scheduler.add_job(
            scheduled_feedback_ingestion,
            trigger=IntervalTrigger(minutes = 1),
            id='feedback_ingestion_job',
            name='Feedback Ingestion Job',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Feedback ingestion scheduler started - runs every hour")
        
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}", exc_info=True)


@app.on_event("shutdown")
async def shutdown_event():
    """Gracefully shutdown the APScheduler."""
    global scheduler
    
    if scheduler and scheduler.running:
        try:
            scheduler.shutdown(wait=True)
            logger.info("Feedback ingestion scheduler shut down gracefully")
        except Exception as e:
            logger.error(f"Error shutting down scheduler: {str(e)}", exc_info=True)


@app.get("/")
def get_message():
    return {"message":"Hello CMS"}