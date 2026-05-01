from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal, Optional


class IntegrationCreate(BaseModel):
    """Schema for creating a new API integration"""
    channel_name: Literal["facebook"]
    api_key: str = Field(..., description="API key for the platform (will be encrypted)")


class FreshdeskCreate(BaseModel):
    """Schema for creating Freshdesk integration"""
    domain: str = Field(..., description="Freshdesk domain (e.g. fmstest.freshdesk.com)")
    api_key: str = Field(..., description="Freshdesk API key (will be encrypted)")


class IntegrationOut(BaseModel):
    """Schema for integration response (excludes raw api_key)"""
    api_id: int
    channel_name: str
    api_base_url: str
    platform_page_id: str | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class IntegrationStatusUpdate(BaseModel):
    """Schema for updating integration status"""
    status: Literal["active", "expired"]
