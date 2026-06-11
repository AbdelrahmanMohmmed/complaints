import logging

from fastapi import APIRouter, status, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta, timezone
from .. import models, utils, database
from ..schemas import company

router = APIRouter(prefix="/companies", tags=["Companies"])
logger = logging.getLogger(__name__)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=company.CompanyOut)
def create_company(
    signup: company.CompanySignup,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    domain = db.query(models.Domain).filter(models.Domain.domain_id == signup.domain_id).first()
    if not domain:
        raise HTTPException(status_code=400, detail=f"Domain with ID {signup.domain_id} does not exist.")

    existing = db.query(models.User).filter(models.User.email == signup.email).first()
    if existing:
        if not existing.is_verified:
            # Resend code instead of blocking
            code = utils.set_verification_code(existing,db)
            try:
                utils.send_verification_email(signup.email, code, existing.f_name)
            except Exception as e:
                logger.error(
                    "Failed to send verification email for existing unverified user %s: %s",
                    signup.email,
                    str(e),
                    exc_info=True,
                )
            raise HTTPException(
                status_code=400,
                detail="EMAIL_NOT_VERIFIED"  # frontend will redirect to verify page
            )
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        new_company = models.Company(
            company_name=signup.company_name,
            email=signup.email,
            phone=signup.phone,
            domain_id=signup.domain_id,
        )
        db.add(new_company)
        db.flush()

        code = utils.generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

        new_user = models.User(
            company_id=new_company.company_id,
            role_id=1,
            f_name=signup.f_name,
            l_name=signup.l_name,
            email=signup.email,
            password_hash=utils.hash_password(signup.password),
            is_verified=False,
            verification_code=code,
            verification_expires_at=expires_at,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_company)

        # Send email in background so signup doesn't wait
        background_tasks.add_task(
            utils.send_verification_email,
            to_email=signup.email,
            code=code,
            name=signup.f_name,
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signup failed, please try again"
        )

    return new_company


@router.get("/", response_model=list[company.CompanyOut])
def get_companies(db: Session = Depends(database.get_db)):
    return db.query(models.Company).all()
