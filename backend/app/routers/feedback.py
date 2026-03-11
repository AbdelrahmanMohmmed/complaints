from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, database, oauth2
from ..schemas import feedback


router = APIRouter(prefix="/feedback", tags=['Feedback'])


@router.get("/", response_model=List[feedback.FeedbackOut])
def get_feedback(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    # All roles see only their company's feedback
    feedback = db.query(models.Feedback).filter(
        models.Feedback.company_id == current_user.company_id
    ).order_by(models.Feedback.created_at.desc()).all()

    return feedback

@router.patch("/{feedback_id}/status", response_model=feedback.FeedbackOut)
def update_feedback_status(
    feedback_id: int,
    status_update: dict,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()

    feedback = db.query(models.Feedback).filter(
        models.Feedback.feedback_id == feedback_id,
        models.Feedback.company_id == current_user.company_id
    ).first()

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    feedback.status = status_update.get("status", feedback.status)
    db.commit()
    db.refresh(feedback)
    return feedback