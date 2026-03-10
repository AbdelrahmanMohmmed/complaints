from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .. import models, utils, database
from ..schemas import company

router = APIRouter(prefix="/companies", tags=['Companies'])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=company.CompanyOut)
def create_company(signup: company.CompanySignup, db: Session = Depends(database.get_db)):
    # 1. Check domain exists
    domain = db.query(models.Domain).filter(models.Domain.domain_id == signup.domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Domain with ID {signup.domain_id} does not exist."
        )

    # 2. Check email not already used
    existing = db.query(models.User).filter(models.User.email == signup.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        # 3. Create company
        new_company = models.Company(
            company_name=signup.company_name,
            email=signup.email,
            phone=signup.phone,
            domain_id=signup.domain_id,
        )
        db.add(new_company)
        db.flush()  # get company_id without committing yet

        # 4. Create admin user (role_id=1) linked to company
        new_user = models.User(
            company_id=new_company.company_id,
            role_id=1,  # Admin
            f_name=signup.f_name,
            l_name=signup.l_name,
            email=signup.email,
            password_hash=utils.hash(signup.password),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_company)

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Signup failed, please try again")

    return new_company


# This route may be benefit for superadmin (Us)  
@router.get("/", response_model=list[company.CompanyOut])
def get_companies(db: Session = Depends(database.get_db)):
    return db.query(models.Company).all()

