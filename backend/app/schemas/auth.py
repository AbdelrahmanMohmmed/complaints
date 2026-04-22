from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """Schema for JWT token response"""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token payload data"""

    id: Optional[str] = None


class VerifyEmailRequest(BaseModel):
    email: str
    code: str


class ResendRequest(BaseModel):
    email: str


class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyResetCodeRequest(BaseModel):
    email: str
    code: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str
