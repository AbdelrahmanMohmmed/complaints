"""Feedback ingestion service for fetching feedback from external platforms.

Runs as a scheduled task every hour via APScheduler.
Supports Facebook and Freshdesk as feedback sources.
Handles API credential validation, deduplication, and error recovery.
"""

import logging
import base64
from datetime import datetime, timedelta
from typing import Optional
import re

import httpx
from sqlalchemy import and_
from sqlalchemy.orm import Session

from .. import database, models, utils

logger = logging.getLogger(__name__)


# ============================================================================
# Configuration
# ============================================================================

# Platform API base URLs
PLATFORM_URLS = {
    "facebook": "https://graph.facebook.com",
}

# API request timeout in seconds
API_TIMEOUT = 10


# ============================================================================
# Helper Functions
# ============================================================================


def add_feedback_safe(
    db: Session,
    company_id: int,
    api_id: int,
    feedback_text: str,
    created_at: datetime,
    customer_name: Optional[str] = None,
) -> bool:
    """Safely add feedback to database with deduplication.

    Checks if feedback with same api_id + feedback_context already exists
    to prevent duplicates. Returns True if feedback was added, False if duplicate.

    Args:
        db: Database session
        company_id: Company ID
        api_id: Integration API ID
        feedback_text: Raw feedback text
        created_at: Feedback creation timestamp
        customer_name: Customer name (optional)

    Returns:
        True if feedback added, False if duplicate

    """
    try:
        # Check for duplicate feedback (same API + same text)
        existing = db.query(models.Feedback).filter(
            and_(
                models.Feedback.api_id == api_id,
                models.Feedback.feedback_context == feedback_text,
            )
        ).first()

        if existing:
            logger.debug(f"Skipped duplicate feedback from integration {api_id}")
            return False

        # Create new feedback record
        new_feedback = models.Feedback(
            company_id=company_id,
            api_id=api_id,
            feedback_context=feedback_text,
            status="unprocessed",
            created_at=created_at,
            customer_name=customer_name,
        )
        db.add(new_feedback)
        db.commit()
        logger.debug(f"Added new feedback from integration {api_id}")
        return True

    except Exception as e:
        db.rollback()
        logger.error(f"Error adding feedback: {str(e)}", exc_info=True)
        return False


def mark_integration_expired(db: Session, integration_id: int) -> None:
    """Mark integration as expired due to authentication failure.

    Args:
        db: Database session
        integration_id: API integration ID

    """
    try:
        integration = db.query(models.Api).filter(
            models.Api.api_id == integration_id
        ).first()
        if integration:
            integration.status = "expired"
            db.commit()
            logger.warning(f"Integration {integration_id} marked as expired")
    except Exception as e:
        db.rollback()
        logger.error(f"Error marking integration as expired: {str(e)}")


def strip_html_tags(html_text: str) -> str:
    """Remove HTML tags and decode HTML entities to extract plain text.
    
    Args:
        html_text: HTML text with tags
        
    Returns:
        Plain text without HTML tags
    """
    # Remove HTML tags
    clean_text = re.sub(r'<[^>]+>', '', html_text)
    # Decode common HTML entities
    clean_text = clean_text.replace('&quot;', '"')
    clean_text = clean_text.replace('&amp;', '&')
    clean_text = clean_text.replace('&lt;', '<')
    clean_text = clean_text.replace('&gt;', '>')
    clean_text = clean_text.replace('&nbsp;', ' ')
    # Remove extra whitespace
    clean_text = ' '.join(clean_text.split())
    return clean_text


# ============================================================================
# Platform-Specific Fetch Functions
# ============================================================================


async def fetch_facebook_comments(api_key: str, api_base_url: str, db: Session, 
                                  integration_id: int, company_id: int,
                                  platform_page_id: str = None) -> int:
    """
    Fetch comments from Facebook page.
    GET {api_base_url}/{page_id}/feed?fields=comments&access_token={api_key}
    
    If platform_page_id is provided, fetches from that specific page.
    Otherwise fetches from the authenticated user's feed (legacy behavior).
    """
    comments_added = 0
    try:
        # Use platform_page_id if available, otherwise fall back to /me/feed (legacy)
        if platform_page_id:
            url = f"{api_base_url}/{platform_page_id}/feed"
        else:
            url = f"{api_base_url}/me/feed"
            
        params = {
            "fields": "comments.limit(100){message,created_time,from{name,id}}",
            "access_token": api_key
        }
        
        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            response = await client.get(url, params=params)
            
            # Handle authentication failures
            if response.status_code in [401, 403]:
                logger.warning(f"Integration {integration_id} returned {response.status_code} - marking as expired")
                mark_integration_expired(db, integration_id)
                return 0
            
            if response.status_code != 200:
                logger.error(f"Facebook API returned {response.status_code} for integration {integration_id}")
                return 0
            
            data = response.json()
            if "data" not in data:
                return 0
            
            # Extract comments from posts
            for post in data.get("data", []):
                if "comments" not in post:
                    continue
                    
                for comment in post.get("comments", {}).get("data", []):
                    feedback_text = comment.get("message", "").strip()
                    if not feedback_text:  # Skip empty comments
                        continue
                    
                    # Parse the created_time from Facebook (ISO format)
                    created_at_str = comment.get("created_time")
                    if not created_at_str:
                        continue
                    
                    try:
                        created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                    except (ValueError, AttributeError):
                        created_at = datetime.utcnow()
                    
                    # Add feedback and track if it was new
                    if add_feedback_safe(
                        db,
                        company_id=company_id,
                        api_id=integration_id,
                        feedback_text=feedback_text,
                        created_at=created_at,
                        customer_name=comment.get("from", {}).get("name")
                    ):
                        comments_added += 1
            
            logger.info(f"Facebook: Added {comments_added} new comments for integration {integration_id}")
            
    except httpx.TimeoutException:
        logger.error(f"Facebook API timeout for integration {integration_id} - will retry next hour")
    except httpx.RequestError as e:
        logger.error(f"Facebook API request error for integration {integration_id}: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing Facebook comments for integration {integration_id}: {str(e)}")
        db.rollback()
    
    return comments_added


def get_freshdesk_headers(api_key: str) -> dict:
    """Get Freshdesk Basic Auth headers.
    
    Args:
        api_key: Freshdesk API key
        
    Returns:
        Dictionary with Authorization header
    """
    credentials = base64.b64encode(f"{api_key}:X".encode()).decode()
    return {"Authorization": f"Basic {credentials}"}


async def fetch_freshdesk_tickets(api_key: str, api_base_url: str, db: Session,
                                  integration_id: int, company_id: int) -> int:
    """
    Fetch open tickets from Freshdesk and save description + created_at to database.
    
    GET {api_base_url}/api/v2/tickets?status=2&limit=100
    Headers: Authorization: Basic {base64(api_key:X)}
    """
    tickets_added = 0
    try:
        headers = get_freshdesk_headers(api_key)
        url = f"{api_base_url}/api/v2/tickets"
        
        # Fetch tickets with description and created_at fields
        params = {
            "per_page": 100,
            "include": "description",
        }
        
        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            response = await client.get(url, headers=headers, params=params)
            
            # Handle authentication failures
            if response.status_code in [401, 403]:
                logger.warning(f"Integration {integration_id} returned {response.status_code} - marking as expired")
                mark_integration_expired(db, integration_id)
                return 0
            
            if response.status_code != 200:
                logger.error(f"Freshdesk API returned {response.status_code} for integration {integration_id}")
                logger.error(f"Response body: {response.text}")
                return 0
            
            data = response.json()
            
            # Freshdesk returns tickets as a list directly or wrapped in "results"
            if isinstance(data, list):
                tickets = data
            else:
                tickets = data.get("results", [])
            
            if not tickets:
                logger.info(f"Freshdesk: No tickets for integration {integration_id}")
                return 0
            
            logger.info(f"Freshdesk: Found {len(tickets)} tickets for integration {integration_id}")
            
            # Process each ticket
            for ticket in tickets:
                try:
                    # Extract only description and created_at
                    description = ticket.get("description", "").strip()
                    
                    # Strip HTML tags from description
                    description = strip_html_tags(description)
                    
                    created_at_str = ticket.get("created_at")
                    
                    # Skip if description is empty
                    if not description:
                        continue
                    
                    # Parse created_at timestamp
                    if not created_at_str:
                        created_at = datetime.utcnow()
                    else:
                        try:
                            created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                        except (ValueError, AttributeError):
                            created_at = datetime.utcnow()
                    
                    # Add feedback with deduplication using existing safe function
                    if add_feedback_safe(
                        db,
                        company_id=company_id,
                        api_id=integration_id,
                        feedback_text=description,
                        created_at=created_at,
                    ):
                        tickets_added += 1
                    
                except Exception as e:
                    logger.error(f"Error processing ticket: {str(e)}")
                    continue
            
            logger.info(f"Freshdesk: Added {tickets_added} new tickets for integration {integration_id}")
            
    except httpx.TimeoutException:
        logger.error(f"Freshdesk API timeout for integration {integration_id} - will retry next hour")
    except httpx.RequestError as e:
        logger.error(f"Freshdesk API request error for integration {integration_id}: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing Freshdesk tickets for integration {integration_id}: {str(e)}", exc_info=True)
        db.rollback()
    
    return tickets_added


# ============================================================================
# Main Ingestion Job
# ============================================================================


async def ingest_feedback() -> None:
    """Main feedback ingestion job for all active integrations.

    Fetches feedback from Facebook and Freshdesk APIs.
    Processes each active integration and stores feedback with deduplication.
    Marks integrations as expired on authentication failure.

    Runs every hour via APScheduler.
    """
    logger.info("Starting feedback ingestion job...")
    db = database.SessionLocal()
    total_comments = 0

    try:
        # Get all active integrations
        active_integrations = db.query(models.Api).filter(
            models.Api.status == "active"
        ).all()

        logger.info(f"Found {len(active_integrations)} active integrations")

        # Process each integration
        for integration in active_integrations:
            try:
                # Decrypt API key
                try:
                    decrypted_key = utils.decrypt_api_key(integration.api_key)
                except Exception as e:
                    logger.error(
                        f"Failed to decrypt API key for integration {integration.api_id}: {str(e)}"
                    )
                    continue

                channel_name = integration.channel_name.lower()
                api_base_url = integration.api_base_url or PLATFORM_URLS.get(channel_name)

                if not api_base_url:
                    logger.warning(f"No base URL for channel {channel_name}")
                    continue

                logger.info(
                    f"Processing {channel_name} integration {integration.api_id} "
                    f"for company {integration.company_id}"
                )

                # Fetch feedback from appropriate platform
                comments_added = 0
                if channel_name == "facebook":
                    comments_added = await fetch_facebook_comments(
                        decrypted_key,
                        api_base_url,
                        db,
                        integration.api_id,
                        integration.company_id,
                        integration.platform_page_id,
                    )
                elif channel_name == "freshdesk":
                    comments_added = await fetch_freshdesk_tickets(
                        decrypted_key,
                        api_base_url,
                        db,
                        integration.api_id,
                        integration.company_id,
                    )
                else:
                    logger.warning(f"Unknown channel: {channel_name} for integration {integration.api_id}")
                    continue

                total_comments += comments_added

            except Exception as e:
                logger.error(
                    f"Error processing integration {integration.api_id}: {str(e)}",
                    exc_info=True,
                )

        logger.info(f"Feedback ingestion job completed. Total comments added: {total_comments}")

    except Exception as e:
        logger.error(f"Fatal error in feedback ingestion job: {str(e)}", exc_info=True)
    finally:
        db.close()
