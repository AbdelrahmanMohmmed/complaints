from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from pydantic import BaseModel as PydanticBase


class FeedbackOut(BaseModel):
    feedback_id: int
    company_id: int
    api_id: Optional[int] = None  # ← change from int to Optional[int]
    channel_name: Optional[str] = None
    category_id: Optional[int] = None
    customer_name: Optional[str] = None
    category_name: Optional[str] = None  # ← add this
    feedback_context: Optional[str] = None
    status: Optional[str] = None
    sentiment: Optional[str] = None
    emotion: Optional[str] = None
    priority: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FeedbackDetailsUpdate(PydanticBase):
    priority: Optional[str] = None
    category_id: Optional[int] = None
