from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import asyncio
from . import models , database
from .routers import  user, auth , company, integration
from .services.feedback_ingestion import ingest_feedback
from .services.preprocessing import preprocess_feedback_service
from .services.ai_analysis import ai_analysis_service
from .ai import load_models

# Configure logging with better formatting
logging.basicConfig(
    level=logging.DEBUG,  # Changed from INFO to DEBUG to see all messages
    format='%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Configure specific loggers for better visibility
logging.getLogger("app.ai").setLevel(logging.DEBUG)
logging.getLogger("app.services").setLevel(logging.DEBUG)
logging.getLogger("app.preprocessing").setLevel(logging.DEBUG)

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
        # Load AI models at startup
        logger.info("Loading AI models...")
        load_models()
        logger.info("AI models loaded successfully")
        
        scheduler = BackgroundScheduler()
        
        # Schedule the feedback ingestion job to run every hour
        scheduler.add_job(
            scheduled_feedback_ingestion,
            trigger=IntervalTrigger(minutes = 1),
            id='feedback_ingestion_job',
            name='Feedback Ingestion Job',
            replace_existing=True
        )
        
        # Schedule the preprocessing job to run every hour (shortly after ingestion)
        scheduler.add_job(
            preprocess_feedback_service,
            trigger=IntervalTrigger(minutes = 1),
            id='feedback_preprocessing_job',
            name='Feedback Preprocessing Job',
            replace_existing=True
        )
        
        # Schedule the AI analysis job to run after preprocessing
        scheduler.add_job(
            ai_analysis_service,
            trigger=IntervalTrigger(minutes = 1),
            id='feedback_ai_job',
            name='Feedback AI Analysis Job',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Feedback ingestion, preprocessing, and AI analysis schedulers started")
        
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