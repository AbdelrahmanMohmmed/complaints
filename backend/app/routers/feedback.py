from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from .. import models, database, oauth2
from ..schemas import feedback

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.get("/", response_model=List[feedback.FeedbackOut])
def get_feedback(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user),
):
    current_user = (
        db.query(models.User).filter(models.User.user_id == current_user_id).first()
    )
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    feedbacks = (
        db.query(models.Feedback)
        .options(
            joinedload(models.Feedback.category),
            joinedload(models.Feedback.api),
        )
        .filter(models.Feedback.company_id == current_user.company_id)
        .order_by(models.Feedback.created_at.desc())
        .all()
    )

    # Map category_name from relationship
    result = []
    for fb in feedbacks:
        fb_dict = {
            "feedback_id": fb.feedback_id,
            "company_id": fb.company_id,
            "api_id": fb.api_id,
            "channel_name": fb.api.channel_name if fb.api else None,
            "category_id": fb.category_id,
            "category_name": fb.category.category_name if fb.category else None,
            "customer_name": fb.customer_name,
            "feedback_context": fb.feedback_context,
            "status": fb.status,
            "sentiment": fb.sentiment,
            "emotion": fb.emotion,
            "priority": fb.priority,
            "created_at": fb.created_at,
        }
        result.append(fb_dict)

    return result


@router.patch("/{feedback_id}/status", response_model=feedback.FeedbackOut)
def update_feedback_status(
    feedback_id: int,
    status_update: dict,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user),
):
    current_user = (
        db.query(models.User).filter(models.User.user_id == current_user_id).first()
    )

    feedback = (
        db.query(models.Feedback)
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user.company_id,
        )
        .first()
    )

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    feedback.status = status_update.get("status", feedback.status)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/{feedback_id}", response_model=feedback.FeedbackOut)
def get_feedback_by_id(
    feedback_id: int,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user),
):
    current_user = (
        db.query(models.User).filter(models.User.user_id == current_user_id).first()
    )
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    fb = (
        db.query(models.Feedback)
        .options(
            joinedload(models.Feedback.category),
            joinedload(models.Feedback.api),
        )
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user.company_id,
        )
        .first()
    )

    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return {
        "feedback_id": fb.feedback_id,
        "company_id": fb.company_id,
        "api_id": fb.api_id,
        "channel_name": fb.api.channel_name if fb.api else None,
        "category_id": fb.category_id,
        "category_name": fb.category.category_name if fb.category else None,
        "customer_name": fb.customer_name,
        "feedback_context": fb.feedback_context,
        "status": fb.status,
        "sentiment": fb.sentiment,
        "emotion": fb.emotion,
        "priority": fb.priority,
        "created_at": fb.created_at,
    }


@router.patch("/{feedback_id}/details", response_model=feedback.FeedbackOut)
def update_feedback_details(
    feedback_id: int,
    update: feedback.FeedbackDetailsUpdate,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user),
):
    current_user = (
        db.query(models.User).filter(models.User.user_id == current_user_id).first()
    )
    fb = (
        db.query(models.Feedback)
        .options(joinedload(models.Feedback.category))
        .filter(
            models.Feedback.feedback_id == feedback_id,
            models.Feedback.company_id == current_user.company_id,
        )
        .first()
    )
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if update.priority is not None:
        fb.priority = update.priority
    if update.category_id is not None:
        fb.category_id = update.category_id

    db.commit()
    db.refresh(fb)

    return {
        "feedback_id": fb.feedback_id,
        "company_id": fb.company_id,
        "api_id": fb.api_id,
        "category_id": fb.category_id,
        "category_name": fb.category.category_name if fb.category else None,
        "customer_name": fb.customer_name,
        "feedback_context": fb.feedback_context,
        "status": fb.status,
        "sentiment": fb.sentiment,
        "emotion": fb.emotion,
        "priority": fb.priority,
        "created_at": fb.created_at,
    }
