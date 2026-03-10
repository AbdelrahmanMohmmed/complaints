"""
Schemas package - Centralized Pydantic schemas for API request/response validation

Import from this package to use schemas across the application:
    from app.schemas import UserCreate, UserOut, CompanySignup, Token, IntegrationCreate
"""

# User schemas
from .user import UserCreate, UserOut, UserMe

# Company schemas
from .company import CompanyCreate, CompanyOut, CompanySignup

# Auth schemas
from .auth import Token, TokenData

# Integration schemas
from .integration import IntegrationCreate, IntegrationOut, IntegrationStatusUpdate

__all__ = [
    # User
    "UserCreate",
    "UserOut",
    "UserMe",
    # Company
    "CompanyCreate",
    "CompanyOut",
    "CompanySignup",
    # Auth
    "Token",
    "TokenData",
]
