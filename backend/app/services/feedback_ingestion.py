"""Feedback ingestion service for fetching feedback from social media platforms.

Runs as a scheduled task every hour via APScheduler.
Supports Facebook, Twitter/X, and WhatsApp as feedback sources.
Handles API credential validation, deduplication, and error recovery.
"""

import logging
from datetime import datetime, timedelta
<<<<<<< HEAD
import json
import imaplib
=======
from typing import Optional

>>>>>>> origin/AI_Models-Integration
import httpx
from sqlalchemy import and_
<<<<<<< HEAD
from .. import models, utils, database
from .get_email_messages import fetch_gmail_messages
=======
from sqlalchemy.orm import Session

from .. import database, models, utils
>>>>>>> origin/AI_Models-Integration

logger = logging.getLogger(__name__)


# ============================================================================
# Configuration
# ============================================================================

# Platform API base URLs
PLATFORM_URLS = {
    "facebook": "https://graph.facebook.com",
    "twitter": "https://api.twitter.com/2",
    "whatsapp": "https://graph.facebook.com/v17.0",
<<<<<<< HEAD
    "gmail": "imap.gmail.com",
=======
>>>>>>> origin/AI_Models-Integration
}

# API request timeout in seconds
API_TIMEOUT = 10


<<<<<<< HEAD
def _parse_gmail_credentials(decrypted_payload: str) -> tuple[str, str]:
    """Extract Gmail username/password from encrypted payload."""
    parsed = json.loads(decrypted_payload)
    username = (parsed.get("username") or "").strip()
    password = (parsed.get("password") or "").strip()
    if not username or not password:
        raise ValueError("Missing Gmail username or password")
    return username, password


async def fetch_facebook_comments(
    api_key: str, api_base_url: str, db: Session, integration_id: int, company_id: int
) -> int:
=======
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


# ============================================================================
# Platform-Specific Fetch Functions
# ============================================================================


async def fetch_facebook_comments(api_key: str, api_base_url: str, db: Session, 
                                  integration_id: int, company_id: int) -> int:
>>>>>>> origin/AI_Models-Integration
    """
    Fetch comments from Facebook.
    GET {api_base_url}/me/feed?fields=comments&access_token={api_key}
    """
    comments_added = 0
    try:
        url = f"{api_base_url}/me/feed"
        params = {
            "fields": "comments.limit(100){message,created_time,from{name,id}}",
            "access_token": api_key,
        }

        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            response = await client.get(url, params=params)

            # Handle authentication failures
            if response.status_code in [401, 403]:
                logger.warning(
                    f"Integration {integration_id} returned {response.status_code} - marking as expired"
                )
                mark_integration_expired(db, integration_id)
                return 0

            if response.status_code != 200:
                logger.error(
                    f"Facebook API returned {response.status_code} for integration {integration_id}"
                )
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
                        created_at = datetime.fromisoformat(
                            created_at_str.replace("Z", "+00:00")
                        )
                    except (ValueError, AttributeError):
                        created_at = datetime.utcnow()
<<<<<<< HEAD

                    # Deduplicate: check if feedback already exists
                    existing = (
                        db.query(models.Feedback)
                        .filter(
                            and_(
                                models.Feedback.api_id == integration_id,
                                models.Feedback.created_at == created_at,
                                models.Feedback.feedback_context == feedback_text,
                            )
                        )
                        .first()
                    )

                    if existing:
                        continue

                    # Create new feedback record
                    new_feedback = models.Feedback(
=======
                    
                    # Add feedback and track if it was new
                    if add_feedback_safe(
                        db,
>>>>>>> origin/AI_Models-Integration
                        company_id=company_id,
                        api_id=integration_id,
                        feedback_text=feedback_text,
                        created_at=created_at,
<<<<<<< HEAD
                        customer_name=comment.get("from", {}).get("name"),
                    )
                    db.add(new_feedback)
                    comments_added += 1

            db.commit()
            logger.info(
                f"Facebook: Added {comments_added} new comments for integration {integration_id}"
            )

=======
                        customer_name=comment.get("from", {}).get("name")
                    ):
                        comments_added += 1
            
            logger.info(f"Facebook: Added {comments_added} new comments for integration {integration_id}")
            
>>>>>>> origin/AI_Models-Integration
    except httpx.TimeoutException:
        logger.error(
            f"Facebook API timeout for integration {integration_id} - will retry next hour"
        )
    except httpx.RequestError as e:
        logger.error(
            f"Facebook API request error for integration {integration_id}: {str(e)}"
        )
    except Exception as e:
        logger.error(
            f"Error processing Facebook comments for integration {integration_id}: {str(e)}"
        )
        db.rollback()

    return comments_added


async def fetch_twitter_comments(
    api_key: str, api_base_url: str, db: Session, integration_id: int, company_id: int
) -> int:
    """
    Fetch recent mentions/tweets from Twitter/X.
    GET {api_base_url}/tweets/search/recent with Authorization: Bearer {api_key}
    """
    comments_added = 0
    try:
        # For Twitter, we fetch recent tweets/mentions
        # Using a query to get mentions (you may need to adjust based on your integration setup)
        url = f"{api_base_url}/tweets/search/recent"

        # Fetch tweets from the last hour
        start_time = (datetime.utcnow() - timedelta(hours=1)).isoformat() + "Z"

        params = {
            "query": "from:@yourcompany",  # Adjust this based on your use case
            "start_time": start_time,
            "max_results": 100,
            "tweet.fields": "created_at,author_id",
            "expansions": "author_id",
            "user.fields": "username",
        }
        headers = {"Authorization": f"Bearer {api_key}"}

        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            response = await client.get(url, params=params, headers=headers)

            # Handle authentication failures
            if response.status_code in [401, 403]:
                logger.warning(
                    f"Integration {integration_id} returned {response.status_code} - marking as expired"
                )
                mark_integration_expired(db, integration_id)
                return 0

            if response.status_code != 200:
                logger.error(
                    f"Twitter API returned {response.status_code} for integration {integration_id}"
                )
                return 0

            data = response.json()

            # Build a mapping of user IDs to usernames
            user_map = {}
            if "includes" in data and "users" in data["includes"]:
                for user in data["includes"]["users"]:
                    user_map[user["id"]] = user.get("username", "")

            # Process tweets
            for tweet in data.get("data", []):
                feedback_text = tweet.get("text", "").strip()
                if not feedback_text:
                    continue

                # Parse created_at from Twitter
                created_at_str = tweet.get("created_at")
                if not created_at_str:
                    continue

                try:
                    created_at = datetime.fromisoformat(
                        created_at_str.replace("Z", "+00:00")
                    )
                except (ValueError, AttributeError):
                    created_at = datetime.utcnow()
<<<<<<< HEAD

                # Deduplicate
                existing = (
                    db.query(models.Feedback)
                    .filter(
                        and_(
                            models.Feedback.api_id == integration_id,
                            models.Feedback.created_at == created_at,
                            models.Feedback.feedback_context == feedback_text,
                        )
                    )
                    .first()
                )

                if existing:
                    continue

                # Create new feedback record
=======
                
                # Add feedback and track if it was new
>>>>>>> origin/AI_Models-Integration
                author_name = user_map.get(tweet.get("author_id"), "")
                if add_feedback_safe(
                    db,
                    company_id=company_id,
                    api_id=integration_id,
                    feedback_text=feedback_text,
                    created_at=created_at,
<<<<<<< HEAD
                    customer_name=author_name,
                )
                db.add(new_feedback)
                comments_added += 1

            db.commit()
            logger.info(
                f"Twitter: Added {comments_added} new mentions for integration {integration_id}"
            )

=======
                    customer_name=author_name
                ):
                    comments_added += 1
            
            logger.info(f"Twitter: Added {comments_added} new mentions for integration {integration_id}")
            
>>>>>>> origin/AI_Models-Integration
    except httpx.TimeoutException:
        logger.error(
            f"Twitter API timeout for integration {integration_id} - will retry next hour"
        )
    except httpx.RequestError as e:
        logger.error(
            f"Twitter API request error for integration {integration_id}: {str(e)}"
        )
    except Exception as e:
        logger.error(
            f"Error processing Twitter mentions for integration {integration_id}: {str(e)}"
        )
        db.rollback()

    return comments_added


async def fetch_whatsapp_messages(
    api_key: str, api_base_url: str, db: Session, integration_id: int, company_id: int
) -> int:
    """
    Fetch incoming messages from WhatsApp.
    GET {api_base_url}/messages with Authorization: Bearer {api_key}
    """
    comments_added = 0
    try:
        # WhatsApp message retrieval endpoint
        url = f"{api_base_url}/me/messages"
        headers = {"Authorization": f"Bearer {api_key}"}

        params = {"limit": 100, "fields": "from,message,timestamp"}

        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            response = await client.get(url, params=params, headers=headers)

            # Handle authentication failures
            if response.status_code in [401, 403]:
                logger.warning(
                    f"Integration {integration_id} returned {response.status_code} - marking as expired"
                )
                mark_integration_expired(db, integration_id)
                return 0

            if response.status_code != 200:
                logger.error(
                    f"WhatsApp API returned {response.status_code} for integration {integration_id}"
                )
                return 0

            data = response.json()

            # Process messages
            for message in data.get("data", []):
                feedback_text = message.get("message", "").strip()
                if not feedback_text:
                    continue

                # Parse timestamp from WhatsApp
                timestamp = message.get("timestamp")
                if not timestamp:
                    created_at = datetime.utcnow()
                else:
                    try:
                        created_at = datetime.fromtimestamp(int(timestamp))
                    except (ValueError, TypeError):
                        created_at = datetime.utcnow()
<<<<<<< HEAD

                # Deduplicate
                existing = (
                    db.query(models.Feedback)
                    .filter(
                        and_(
                            models.Feedback.api_id == integration_id,
                            models.Feedback.created_at == created_at,
                            models.Feedback.feedback_context == feedback_text,
                        )
                    )
                    .first()
                )

                if existing:
                    continue

                # Create new feedback record
                new_feedback = models.Feedback(
=======
                
                # Add feedback and track if it was new
                if add_feedback_safe(
                    db,
>>>>>>> origin/AI_Models-Integration
                    company_id=company_id,
                    api_id=integration_id,
                    feedback_text=feedback_text,
                    created_at=created_at,
<<<<<<< HEAD
                    customer_name=message.get("from", {}).get("name"),
                )
                db.add(new_feedback)
                comments_added += 1

            db.commit()
            logger.info(
                f"WhatsApp: Added {comments_added} new messages for integration {integration_id}"
            )

=======
                    customer_name=message.get("from", {}).get("name")
                ):
                    comments_added += 1
            
            logger.info(f"WhatsApp: Added {comments_added} new messages for integration {integration_id}")
            
>>>>>>> origin/AI_Models-Integration
    except httpx.TimeoutException:
        logger.error(
            f"WhatsApp API timeout for integration {integration_id} - will retry next hour"
        )
    except httpx.RequestError as e:
        logger.error(
            f"WhatsApp API request error for integration {integration_id}: {str(e)}"
        )
    except Exception as e:
        logger.error(
            f"Error processing WhatsApp messages for integration {integration_id}: {str(e)}"
        )
        db.rollback()

    return comments_added


def fetch_gmail_feedback(
    gmail_username: str,
    gmail_password: str,
    db: Session,
    integration_id: int,
    company_id: int,
) -> int:
    """Fetch plain-text email messages from Gmail and save as feedback."""
    comments_added = 0
    try:
        messages = fetch_gmail_messages(
            username=gmail_username,
            password=gmail_password,
            mailbox="INBOX",
            max_messages=50,
        )

        for message in messages:
            feedback_text = (message.get("body") or "").strip()
            if not feedback_text:
                continue

            created_at = message.get("created_at") or datetime.utcnow()

            existing = (
                db.query(models.Feedback)
                .filter(
                    and_(
                        models.Feedback.api_id == integration_id,
                        models.Feedback.created_at == created_at,
                        models.Feedback.feedback_context == feedback_text,
                    )
                )
                .first()
            )
            if existing:
                continue

            sender_name = (
                message.get("from_name")
                or message.get("from_email")
                or "Unknown Sender"
            )

            new_feedback = models.Feedback(
                company_id=company_id,
                api_id=integration_id,
                feedback_context=feedback_text,
                status="unprocessed",
                created_at=created_at,
                customer_name=sender_name,
            )
            db.add(new_feedback)
            comments_added += 1

        db.commit()
        logger.info(
            "Gmail: Added %s new messages for integration %s",
            comments_added,
            integration_id,
        )
    except imaplib.IMAP4.error:
        logger.warning(
            "Gmail auth failed for integration %s - marking as expired",
            integration_id,
        )
        mark_integration_expired(db, integration_id)
        return 0
    except Exception as e:
        logger.error(
            "Error processing Gmail messages for integration %s: %s",
            integration_id,
            str(e),
        )
        db.rollback()

    return comments_added


<<<<<<< HEAD
def mark_integration_expired(db: Session, integration_id: int):
    """Mark an integration as expired due to authentication failure."""
    try:
        integration = (
            db.query(models.Api).filter(models.Api.api_id == integration_id).first()
        )
        if integration:
            integration.status = "expired"
            db.commit()
            logger.info(f"Integration {integration_id} marked as expired")
    except Exception as e:
        logger.error(f"Error marking integration {integration_id} as expired: {str(e)}")
        db.rollback()
=======
# ============================================================================
# Main Ingestion Job
# ============================================================================
>>>>>>> origin/AI_Models-Integration


async def ingest_feedback() -> None:
    """Main feedback ingestion job for all active integrations.

    Fetches feedback from Facebook, Twitter/X, and WhatsApp APIs.
    Processes each active integration and stores feedback with deduplication.
    Marks integrations as expired on authentication failure.

    Runs every hour via APScheduler.
    """
    logger.info("Starting feedback ingestion job...")
    db = database.SessionLocal()
    total_comments = 0

    try:
        # Get all active integrations
<<<<<<< HEAD
        active_integrations = (
            db.query(models.Api).filter(models.Api.status == "active").all()
        )

        logger.info(f"Found {len(active_integrations)} active integrations")

=======
        active_integrations = db.query(models.Api).filter(
            models.Api.status == "active"
        ).all()

        logger.info(f"Found {len(active_integrations)} active integrations")

        # Process each integration
>>>>>>> origin/AI_Models-Integration
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
<<<<<<< HEAD
                api_base_url = integration.api_base_url or PLATFORM_URLS.get(
                    channel_name
                )
=======
                api_base_url = integration.api_base_url or PLATFORM_URLS.get(channel_name)
>>>>>>> origin/AI_Models-Integration

                if not api_base_url:
                    logger.warning(f"No base URL for channel {channel_name}")
                    continue

                logger.info(
<<<<<<< HEAD
                    f"Processing integration {integration.api_id} ({channel_name}) for company {integration.company_id}"
                )

                # Call the appropriate platform API
=======
                    f"Processing {channel_name} integration {integration.api_id} "
                    f"for company {integration.company_id}"
                )

                # Fetch feedback from appropriate platform
>>>>>>> origin/AI_Models-Integration
                comments_added = 0
                if channel_name == "facebook":
                    comments_added = await fetch_facebook_comments(
                        decrypted_key,
                        api_base_url,
                        db,
                        integration.api_id,
                        integration.company_id,
                    )
                elif channel_name == "twitter":
                    comments_added = await fetch_twitter_comments(
                        decrypted_key,
                        api_base_url,
                        db,
                        integration.api_id,
                        integration.company_id,
                    )
                elif channel_name == "whatsapp":
                    comments_added = await fetch_whatsapp_messages(
                        decrypted_key,
                        api_base_url,
                        db,
                        integration.api_id,
                        integration.company_id,
<<<<<<< HEAD
                    )
                elif channel_name == "gmail":
                    gmail_username, gmail_password = _parse_gmail_credentials(
                        decrypted_key
                    )
                    comments_added = fetch_gmail_feedback(
                        gmail_username,
                        gmail_password,
                        db,
                        integration.api_id,
                        integration.company_id,
                    )
                else:
                    logger.warning(
                        f"Unknown channel name: {channel_name} for integration {integration.api_id}"
                    )
=======
                    )
                else:
                    logger.warning(f"Unknown channel: {channel_name} for integration {integration.api_id}")
>>>>>>> origin/AI_Models-Integration
                    continue

                total_comments += comments_added

            except Exception as e:
                logger.error(
                    f"Error processing integration {integration.api_id}: {str(e)}",
                    exc_info=True,
                )
<<<<<<< HEAD
                continue

        logger.info(
            f"Feedback ingestion job completed. Total comments added: {total_comments}"
        )
=======

        logger.info(f"Feedback ingestion job completed. Total comments added: {total_comments}")
>>>>>>> origin/AI_Models-Integration

    except Exception as e:
        logger.error(f"Fatal error in feedback ingestion job: {str(e)}", exc_info=True)
    finally:
        db.close()
