from pydantic import BaseModel, Field
from datetime import datetime


class WebFormSubmission(BaseModel):
    """Schema for web form feedback submission"""

    feedback_context: str = Field(
        ..., min_length=10, max_length=1000, description="Customer complaint/feedback"
    )


class WebFormResponse(BaseModel):
    """Schema for web form response"""

    message: str


class WebFormIntegrationResponse(BaseModel):
    """Schema for web form integration creation response"""

    form_url: str
    channel_name: str
    status: str


class FeedbackOut(BaseModel):
    """Schema for feedback list/detail responses"""

    feedback_id: int
    company_id: int
    api_id: int | None
    channel_name: str | None = None
    category_id: int | None
    category_name: str | None = None
    customer_name: str | None = None
    feedback_context: str | None = None
    status: str
    sentiment: str | None = None
    emotion: str | None = None
    emotion_id: int | None = None
    problem_type: str | None = None
    problem_type_id: int | None = None
    priority: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class FeedbackStatusUpdate(BaseModel):
    status: str


class FeedbackDetailsUpdate(BaseModel):
    priority: str | None = None
    category_id: int | None = None
