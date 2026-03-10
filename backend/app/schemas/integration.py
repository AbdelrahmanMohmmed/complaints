from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal


class IntegrationCreate(BaseModel):
    """Schema for creating a new API integration"""
    channel_name: Literal["facebook", "twitter", "whatsapp"]
    api_key: str = Field(..., description="API key for the platform (will be encrypted)")


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
