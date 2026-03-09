from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    company_id: int
    role_id: int
    f_name: str
    l_name: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    user_id: int
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

class UserMe(BaseModel):
    user_id: int
    f_name: str
    l_name: str
    email: EmailStr
    role_id: int
    company_id: int

    class Config:
        from_attributes = True
        
class CompanyCreate(BaseModel):
    company_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    domain_id: int # This must match a domain_id from the SQL above

class CompanyOut(BaseModel):
    company_id: int
    company_name: str
    domain_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CompanySignup(BaseModel):
    company_name: str
    email: EmailStr
    phone: Optional[str] = None
    domain_id: int
    f_name: str
    l_name: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None