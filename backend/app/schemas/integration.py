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
