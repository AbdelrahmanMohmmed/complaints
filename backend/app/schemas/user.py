from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating a new user"""
    role_id: int
    f_name: str
    l_name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Schema for user response (minimal info)"""
    user_id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class UserMe(BaseModel):
    """Schema for current user profile"""
    user_id: int
    f_name: str
    l_name: str
    email: EmailStr
    role_id: int
    company_id: int

    class Config:
        from_attributes = True
