from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_feedback: int
    open_count: int
    in_progress_count: int
    resolved_count: int
    closed_count: int
    high_priority_count: int
    positive_count: int
    negative_count: int
    neutral_count: int
    frustrated_count: int
    neutral_emotion_count: int
    disgusted_count: int
    satisfied_count: int
    monthly_data: list
    category_data: list
