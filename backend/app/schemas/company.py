from typing import Optional
from pydantic import BaseModel, EmailStr ,field_validator
from datetime import datetime
import re

class CompanyCreate(BaseModel):
    company_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    domain_id: int

class CompanyOut(BaseModel):
    """Schema for company response"""
    company_id: int
    company_name: str
    domain_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CompanySignup(BaseModel):
    """Schema for company signup (creates company + admin user)"""
    company_name: str
    email: EmailStr
    phone: str
    domain_id: int
    f_name: str
    l_name: str
    password: str
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-\[\]/\\]', v):
            raise ValueError('Password must contain at least one special character')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        # Remove spaces and dashes for validation
        cleaned = re.sub(r'[\s\-()]', '', v)
        if not re.match(r'^\+?[0-9]{7,15}$', cleaned):
            raise ValueError('Invalid phone number. Must be 7-15 digits, optionally starting with +')
        return v
