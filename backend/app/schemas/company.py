from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class CompanyCreate(BaseModel):
    """Schema for creating a company"""
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
    phone: Optional[str] = None
    domain_id: int
    f_name: str
    l_name: str
    password: str
