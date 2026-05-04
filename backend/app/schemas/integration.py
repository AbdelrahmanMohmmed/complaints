from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal, Optional


class IntegrationCreate(BaseModel):
    """Schema for creating a new API integration"""

    channel_name: Literal["facebook", "twitter", "whatsapp", "gmail"]
    api_key: Optional[str] = Field(
        default=None, description="API key for token-based platforms"
    )
    gmail_username: Optional[str] = Field(
        default=None, description="Gmail username/email"
    )
    gmail_password: Optional[str] = Field(
        default=None, description="Gmail app password"
    )


class IntegrationOut(BaseModel):
    """Schema for integration response (excludes raw api_key)"""

    api_id: int
    channel_name: str
    api_base_url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class IntegrationStatusUpdate(BaseModel):
    """Schema for updating integration status"""

    status: Literal["active", "expired"]


class TwitterScrapeRequest(BaseModel):
    """Schema for scraping Twitter replies via Playwright."""

    username: str = Field(..., min_length=1, max_length=50)
    max_posts: int = Field(default=5, ge=1, le=50)
    scroll_count: int = Field(default=2, ge=0, le=20)
    scroll_delay_s: float = Field(default=2.0, ge=0.0, le=10.0)
    goto_timeout_ms: int = Field(default=6000, ge=1000, le=30000)


class TwitterScrapeReply(BaseModel):
    """Single reply scraped from Twitter/X."""

    post_url: str
    from_user: str
    reply_text: str
    date: str


class TwitterScrapeResponse(BaseModel):
    """Response for Twitter scrape request."""

    count: int
    replies: list[TwitterScrapeReply]
