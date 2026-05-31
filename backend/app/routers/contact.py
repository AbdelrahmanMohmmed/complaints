from fastapi import APIRouter, status
from pydantic import BaseModel, EmailStr

router = APIRouter(tags=["Contact"])


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    company: str | None = None
    message: str


class ContactResponse(BaseModel):
    success: bool
    message: str


@router.post("/contact", response_model=ContactResponse, status_code=status.HTTP_200_OK)
def submit_contact_message(_: ContactRequest):
    return {
        "success": True,
        "message": "Thanks for reaching out. We received your message and will respond soon.",
    }
