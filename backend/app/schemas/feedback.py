from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FeedbackOut(BaseModel):
    feedback_id: int
    company_id: int
    api_id: int
    category_id: Optional[int] = None
    customer_name: Optional[str] = None
    feedback_context: Optional[str] = None
    status: Optional[str] = None
    sentiment: Optional[str] = None
    emotion: Optional[str] = None
    priority: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True