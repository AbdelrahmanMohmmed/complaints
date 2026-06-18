from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from .. import models, database, oauth2

router = APIRouter(prefix="/categories", tags=['Categories'])

class CategoryOut(BaseModel):
    category_id: int
    category_name: str
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CategoryOut])
def get_categories(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    categories = db.query(models.FeedbackCategory).filter(
        models.FeedbackCategory.domain_id == current_user.company.domain_id
    ).all()
    return categories