from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating a new user"""
    role_id: int
    f_name: str
    l_name: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    f_name: str
    l_name: str
    email: EmailStr
    role_id: int

class UserOut(BaseModel):
    user_id: int
    f_name: str
    l_name: str
    email: EmailStr
    role_id: int
    is_active: bool
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

