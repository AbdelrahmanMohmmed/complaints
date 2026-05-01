from pydantic import BaseModel, Field
from datetime import datetime


class WebFormSubmission(BaseModel):
    """Schema for web form feedback submission"""
    feedback_context: str = Field(..., min_length=10, max_length=1000, description="Customer complaint/feedback")


class WebFormResponse(BaseModel):
    """Schema for web form response"""
    message: str


class WebFormIntegrationResponse(BaseModel):
    """Schema for web form integration creation response"""
    form_url: str
    channel_name: str
    status: str
