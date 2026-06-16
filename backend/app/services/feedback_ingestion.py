"""Async feedback ingestion service — FIXED: one session per integration."""

import logging
import base64
import json
import re
import asyncio
from datetime import datetime
from typing import Optional, Dict

import httpx
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from .scrap_twitter import fetch_replies
from .. import models, utils, database
from .get_email_messages import fetch_gmail_messages

logger = logging.getLogger(__name__)

PLATFORM_URLS: Dict[str, str] = {
    "facebook": "https://graph.facebook.com",
    "twitter": "https://api.twitter.com/2",
    "gmail": "imap.gmail.com",
}

API_TIMEOUT = 10.0
MAX_RETRIES = 3


# ============================================================================
# Helpers (unchanged)
# ============================================================================

def parse_datetime(date_str: Optional[str]) -> datetime:
    if not date_str:
        return datetime.utcnow()
    try:
        if date_str.endswith('Z'):
            date_str = date_str.replace('Z', '+00:00')
        elif '+' not in date_str and '-' not in date_str[10:]:
            date_str = f"{date_str}+00:00"
        return datetime.fromisoformat(date_str)
    except (ValueError, AttributeError):
        return datetime.utcnow()


def strip_html_tags(html_text: str) -> str:
    if not html_text:
        return ""
    clean_text = re.sub(r"<[^>]+>", "", html_text)
    clean_text = clean_text.replace("&quot;", '"').replace("&amp;", "&")
    clean_text = clean_text.replace("&lt;", "<").replace("&gt;", ">")
    clean_text = clean_text.replace("&nbsp;", " ").replace("&#39;", "'").replace("&apos;", "'")
    return " ".join(clean_text.split())


def truncate_text(text: str, max_length: int = 10000) -> str:
    if len(text) > max_length:
        return text[:max_length - 3] + "..."
    return text


async def fetch_twitter_replies(
        db: AsyncSession,
        integration_id: int,
        company_id: int,
        target_username: Optional[str] = None,
) -> int:
    """Scrape Twitter/X replies using Playwright with .env credentials."""

    comments_added = 0

    try:
        # Get credentials from .env via settings
        auth_token = settings.TWITTER_AUTH_TOKEN
        ct0 = settings.TWITTER_CT0

        # Get target username from integration or use provided
        if not target_username:
            # Try to get from integration's platform_page_id
            stmt = select(models.Api).where(models.Api.api_id == integration_id)
            result = await db.execute(stmt)
            integration = result.scalar_one_or_none()
            if integration and integration.platform_page_id:
                target_username = integration.platform_page_id.strip()

        if not target_username:
            logger.warning(f"No target username for Twitter integration {integration_id}")
            return 0

        if not auth_token or not ct0:
            logger.warning(f"Missing Twitter auth cookies in .env for integration {integration_id}")
            await mark_integration_expired(db, integration_id)
            return 0

        # Run Playwright scraper in thread pool
        loop = asyncio.get_running_loop()
        replies = await loop.run_in_executor(
            None,
            lambda: asyncio.run(fetch_replies(
                target_username=target_username,
                auth_token=auth_token,
                ct0=ct0,
                max_posts=2,
                max_comments_per_post=50,
                save_to_file=False,
            ))
        )

        if not replies:
            logger.info(f"Twitter: No replies found for @{target_username}")
            return 0

        for reply in replies:
            feedback_text = reply.get("reply_text", "").strip()
            if not feedback_text:
                continue

            date_str = reply.get("date", "")
            created_at = parse_datetime(date_str) if date_str else datetime.utcnow()
            from_user = reply.get("from_user", "Twitter User")

            if await add_feedback_safe(
                    db, company_id, integration_id,
                    feedback_text, created_at, from_user
            ):
                comments_added += 1

        if comments_added > 0:
            await db.commit()

        logger.info(f"Twitter: +{comments_added} replies from @{target_username}")
        return comments_added

    except Exception as e:
        logger.error(f"Twitter scraping error for integration {integration_id}: {e}")
        await db.rollback()
        return 0

# In feedback_ingestion.py, add a sync version:
def add_feedback_safe(
    db,  # sync Session
    company_id: int,
    api_id: int,
    feedback_text: str,
    created_at: datetime,
    customer_name: Optional[str] = None,
) -> bool:
    """Sync version for sync endpoints."""
    try:
        feedback_text = truncate_text(feedback_text)
        if customer_name and len(customer_name) > 500:
            customer_name = customer_name[:497] + "..."

        existing = (
            db.query(models.Feedback)
            .filter(
                and_(
                    models.Feedback.api_id == api_id,
                    models.Feedback.feedback_context == feedback_text,
                )
            )
            .first()
        )

        if existing:
            return False

        new_feedback = models.Feedback(
            company_id=company_id,
            api_id=api_id,
            feedback_context=feedback_text,
            status="unprocessed",
            created_at=created_at,
            customer_name=customer_name or "Anonymous",
        )
        db.add(new_feedback)
        db.commit()
        return True

    except Exception as e:
        logger.error(f"DB error: {e}")
        db.rollback()
        return False

async def mark_integration_expired(db: AsyncSession, integration_id: int) -> None:
    try:
        stmt = select(models.Api).where(models.Api.api_id == integration_id)
        result = await db.execute(stmt)
        integration = result.scalar_one_or_none()

        if integration and integration.status != 'expired':
            integration.status = "expired"
            await db.commit()
            logger.warning(f"Integration {integration_id} marked as expired")

    except SQLAlchemyError as e:
        logger.error(f"Error marking integration expired: {e}")
        await db.rollback()


def _parse_gmail_credentials(decrypted_payload: str) -> tuple[str, str]:
    parsed = json.loads(decrypted_payload)
    username = (parsed.get("username") or "").strip()
    password = (parsed.get("password") or "").strip()
    if not username or not password:
        raise ValueError("Missing Gmail credentials")
    return username, password


# ============================================================================
# Platform Fetchers (each gets their own db session)
# ============================================================================

async def fetch_facebook_comments(
    api_key: str,
    api_base_url: str,
    db: AsyncSession,
    integration_id: int,
    company_id: int,
    platform_page_id: Optional[str] = None,
) -> int:
    comments_added = 0
    retry_count = 0

    url = f"{api_base_url}/{platform_page_id or 'me'}/feed"
    params = {
        "fields": "comments.limit(100){message,created_time,from{name,id}}",
        "access_token": api_key,
        "limit": 50,
    }

    async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
        while retry_count < MAX_RETRIES:
            try:
                response = await client.get(url, params=params)

                if response.status_code in (401, 403):
                    await mark_integration_expired(db, integration_id)
                    return 0

                if response.status_code != 200:
                    retry_count += 1
                    await asyncio.sleep(2 ** retry_count)
                    continue

                data = response.json()
                posts = data.get("data", [])

                for post in posts:
                    for comment in post.get("comments", {}).get("data", []):
                        feedback_text = comment.get("message", "").strip()
                        if not feedback_text:
                            continue

                        created_at = parse_datetime(comment.get("created_time"))
                        from_data = comment.get("from", {}) or {}
                        customer_name = from_data.get("name", "Facebook User")
                        if len(customer_name) > 100:
                            customer_name = customer_name[:97] + "..."

                        if await add_feedback_safe(
                            db, company_id, integration_id,
                            feedback_text, created_at, customer_name
                        ):
                            comments_added += 1

                if comments_added > 0:
                    await db.commit()

                logger.info(f"Facebook: +{comments_added} comments for integration {integration_id}")
                break

            except httpx.TimeoutException:
                retry_count += 1
                if retry_count >= MAX_RETRIES:
                    break
                await asyncio.sleep(2 ** retry_count)
            except Exception as e:
                logger.error(f"Facebook error: {e}")
                await db.rollback()
                break

    return comments_added


async def fetch_freshdesk_tickets(
    api_key: str,
    api_base_url: str,
    db: AsyncSession,
    integration_id: int,
    company_id: int,
) -> int:
    tickets_added = 0
    retry_count = 0

    auth_value = base64.b64encode(f"{api_key}:X".encode()).decode()
    headers = {"Authorization": f"Basic {auth_value}"}
    url = f"{api_base_url}/api/v2/tickets"
    params = {"per_page": 100, "include": "description,requester"}

    async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
        while retry_count < MAX_RETRIES:
            try:
                response = await client.get(url, params=params, headers=headers)

                if response.status_code in (401, 403):
                    await mark_integration_expired(db, integration_id)
                    return 0

                if response.status_code != 200:
                    retry_count += 1
                    await asyncio.sleep(2 ** retry_count)
                    continue

                tickets = response.json() or []

                for ticket in tickets:
                    description = ticket.get("description_text") or ticket.get("description", "")
                    feedback_text = strip_html_tags(description).strip()
                    if not feedback_text:
                        feedback_text = (ticket.get("subject") or "").strip()
                    if not feedback_text:
                        continue

                    created_at = parse_datetime(ticket.get("created_at"))
                    requester = ticket.get("requester") or {}
                    requester_name = (
                        requester.get("name") or
                        requester.get("email") or
                        "Freshdesk Requester"
                    )

                    if await add_feedback_safe(
                        db, company_id, integration_id,
                        feedback_text, created_at, requester_name
                    ):
                        tickets_added += 1

                if tickets_added > 0:
                    await db.commit()

                logger.info(f"Freshdesk: +{tickets_added} tickets for integration {integration_id}")
                break

            except httpx.TimeoutException:
                retry_count += 1
                if retry_count >= MAX_RETRIES:
                    break
                await asyncio.sleep(2 ** retry_count)
            except Exception as e:
                logger.error(f"Freshdesk error: {e}")
                await db.rollback()
                break

    return tickets_added


async def fetch_gmail_feedback(
    decrypted_key: str,
    db: AsyncSession,
    integration_id: int,
    company_id: int,
) -> int:
    messages_added = 0

    try:
        username, password = _parse_gmail_credentials(decrypted_key)

        # IMAP is blocking — run in thread pool
        loop = asyncio.get_running_loop()
        messages = await loop.run_in_executor(
            None,
            fetch_gmail_messages,
            username, password, "INBOX", 50
        )

        for message in messages:
            feedback_text = strip_html_tags(message.get("body", "").strip())
            if not feedback_text:
                continue

            created_at = message.get("created_at") or datetime.utcnow()
            sender_name = (
                message.get("from_name") or
                message.get("from_email") or
                "Unknown Sender"
            )

            if await add_feedback_safe(
                db, company_id, integration_id,
                feedback_text, created_at, sender_name
            ):
                messages_added += 1

        if messages_added > 0:
            await db.commit()

        logger.info(f"Gmail: +{messages_added} messages for integration {integration_id}")

    except ValueError:
        await mark_integration_expired(db, integration_id)
    except Exception as e:
        logger.error(f"Gmail error: {e}")
        await db.rollback()

    return messages_added


# ============================================================================
# FIXED: Each integration gets its own DB session
# ============================================================================

async def process_single_integration(integration: models.Api) -> int:
    """Process one integration with its own isolated database session."""
    # NEW SESSION per integration — no concurrency conflicts
    async with database.AsyncSessionLocal() as db:
        try:
            decrypted_key = utils.decrypt_api_key(integration.api_key)
        except Exception as e:
            logger.error(f"Failed to decrypt API key for integration {integration.api_id}: {e}")
            return 0

        channel_name = integration.channel_name.lower()
        api_base_url = integration.api_base_url or PLATFORM_URLS.get(channel_name)

        if not api_base_url:
            logger.warning(f"No base URL for channel {channel_name}")
            return 0

        logger.info(f"Processing integration {integration.api_id} ({channel_name})")

        comments_added = 0

        if channel_name == "facebook":
            comments_added = await fetch_facebook_comments(
                decrypted_key, api_base_url, db,
                integration.api_id, integration.company_id,
                integration.platform_page_id,
            )
        elif channel_name == "freshdesk":
            comments_added = await fetch_freshdesk_tickets(
                decrypted_key, api_base_url, db,
                integration.api_id, integration.company_id,
            )
        elif channel_name == "gmail":
            comments_added = await fetch_gmail_feedback(
                decrypted_key, db,
                integration.api_id, integration.company_id,
            )
        elif channel_name == "twitter":
            comments_added = await fetch_twitter_replies(
                db,
                integration.api_id,
                integration.company_id,
                target_username=integration.platform_page_id,
            )
        else:
            logger.warning(f"Unknown channel: {channel_name}")
            comments_added = 0

        # Session commits/rollbacks happen inside fetchers, but ensure close
        return comments_added


async def ingest_feedback_async() -> int:
    """Main entry point — fetches integrations list, then processes each with own session."""
    total_comments = 0
    processed = 0
    failed = 0

    # Get integrations list with a temporary session
    async with database.AsyncSessionLocal() as db:
        try:
            stmt = select(models.Api).where(models.Api.status == "active")
            result = await db.execute(stmt)
            active_integrations = result.scalars().all()
            # Detach from session so objects can be used after session closes
            integrations = list(active_integrations)
        except Exception as e:
            logger.error(f"Failed to fetch integrations: {e}")
            return 0

    logger.info(f"Found {len(integrations)} active integrations")

    # Process with semaphore to limit HTTP concurrency (not DB concurrency)
    semaphore = asyncio.Semaphore(3)  # Max 3 concurrent HTTP requests

    async def bounded_process(integration):
        nonlocal total_comments, processed, failed
        async with semaphore:
            try:
                count = await process_single_integration(integration)
                total_comments += count
                processed += 1
            except Exception as e:
                logger.error(f"Integration {integration.api_id} failed: {e}")
                failed += 1

    tasks = [bounded_process(i) for i in integrations]
    await asyncio.gather(*tasks, return_exceptions=True)

    logger.info(
        f"Ingestion complete — Total: {total_comments}, "
        f"Processed: {processed}, Failed: {failed}"
    )
    return total_comments


# ============================================================================
# APScheduler Wrapper
# ============================================================================

async def ingest_feedback() -> None:
    """Wrapper for APScheduler — no session argument needed."""
    try:
        total = await ingest_feedback_async()
        logger.info(f"Ingestion service completed: {total} items")
    except Exception as e:
        logger.error(f"Fatal error in ingestion service: {e}", exc_info=True)