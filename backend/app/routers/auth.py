from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, status, HTTPException, BackgroundTasks
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, utils, oauth2
from ..schemas import auth

router = APIRouter(tags=["Authentication"])


@router.post("/login", response_model=auth.Token)
def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == user_credentials.username)
        .first()
    )
    print(f"🔐 Login attempt: {user_credentials.username}")  # ← add this
    if not user or not utils.verify(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials"
        )

    if not user.is_verified:  # ← add this
        raise HTTPException(status_code=403, detail="EMAIL_NOT_VERIFIED")
    if (
        not user.is_active and user.role_id != 1
    ):  # Allow admins to log in even if inactive
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Contact your admin.",
        )

    print(f"✅ Successful login for: {user_credentials.username}")  # ← and this
    access_token = oauth2.create_access_token(data={"user_id": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/verify-email")
def verify_email(
    payload: auth.VerifyEmailRequest, db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")
    if not user.verification_code or user.verification_code != payload.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    if (
        user.verification_expires_at
        and datetime.utcnow() > user.verification_expires_at.replace(tzinfo=None)
    ):
        raise HTTPException(status_code=400, detail="Verification code has expired")

    user.is_verified = True
    user.verification_code = None
    user.verification_expires_at = None
    db.commit()
    return {"message": "Email verified successfully"}


# Also add resend endpoint
@router.post("/resend-verification")
def resend_verification(
    payload: auth.ResendRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or user.is_verified:
        raise HTTPException(status_code=400, detail="Invalid request")

    code = utils.generate_verification_code()
    user.verification_code = code
    user.verification_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    background_tasks.add_task(
        utils.send_verification_email, payload.email, code, user.f_name
    )
    return {"message": "Verification code resent"}


@router.post("/forgot-password")
def forgot_password(
    payload: auth.ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    # Don't reveal if email exists or not (security best practice)
    if not user:
        return {"message": "If this email exists, a reset code has been sent"}

    code = utils.generate_verification_code()
    user.verification_code = code
    user.verification_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    background_tasks.add_task(utils.send_reset_email, payload.email, code, user.f_name)
    return {"message": "If this email exists, a reset code has been sent"}


@router.post("/verify-reset-code")
def verify_reset_code(
    payload: auth.VerifyResetCodeRequest, db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.verification_code or user.verification_code != payload.code:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    if (
        user.verification_expires_at
        and datetime.utcnow() > user.verification_expires_at.replace(tzinfo=None)
    ):
        raise HTTPException(status_code=400, detail="Reset code has expired")

    return {"message": "Reset code verified"}


@router.post("/reset-password")
def reset_password(
    payload: auth.ResetPasswordRequest, db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.verification_code or user.verification_code != payload.code:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    if (
        user.verification_expires_at
        and datetime.utcnow() > user.verification_expires_at.replace(tzinfo=None)
    ):
        raise HTTPException(status_code=400, detail="Reset code has expired")
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=400, detail="Password must be at least 8 characters"
        )
    if not any(c.isupper() for c in payload.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter",
        )
    if not any(c.islower() for c in payload.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter",
        )
    if not any(c.isdigit() for c in payload.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one number",
        )
    if payload.new_password.isalnum():
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one special character",
        )

    user.password_hash = utils.hash(payload.new_password)
    user.verification_code = None
    user.verification_expires_at = None
    db.commit()
    return {"message": "Password reset successfully"}
