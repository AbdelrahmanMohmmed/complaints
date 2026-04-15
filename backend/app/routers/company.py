"""Company management routes - registration and listing.

Provides endpoints for company signup and retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import database, models, utils
from ..schemas import company

router = APIRouter(prefix="/companies", tags=["Companies"])


# ============================================================================
# Company Creation (Signup)
# ============================================================================


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=company.CompanyOut)
def create_company(
    signup: company.CompanySignup, db: Session = Depends(database.get_db)
) -> models.Company:
    """Register a new company with admin user.

    Creates a company and its admin user account in a single transaction.
    Validates that the domain exists and email is unique.

    Args:
        signup: Company signup schema
        db: Database session

    Returns:
        Created company object (CompanyOut schema)

    Raises:
        HTTPException: 400 if domain not found or email already registered
        HTTPException: 400 if signup transaction fails
    """
    # Validate domain exists
    domain = db.query(models.Domain).filter(
        models.Domain.domain_id == signup.domain_id
    ).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Domain with ID {signup.domain_id} does not exist."
        )

    # Check email uniqueness
    existing = db.query(models.User).filter(
        models.User.email == signup.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    try:
        # Create company
        new_company = models.Company(
            company_name=signup.company_name,
            email=signup.email,
            phone=signup.phone,
            domain_id=signup.domain_id,
        )
        db.add(new_company)
        db.flush()  # Get company_id without committing

        # Create admin user (role_id=1)
        new_user = models.User(
            company_id=new_company.company_id,
            role_id=1,  # Admin role
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signup failed, please try again"
        )

    return new_company


# ============================================================================
# Company Retrieval
# ============================================================================


@router.get("/", response_model=list[company.CompanyOut])
def get_companies(db: Session = Depends(database.get_db)) -> list[models.Company]:
    """List all companies.

    Note: This endpoint is intended for superadmin/system admin use.
    Consider adding RBAC in production.

    Args:
        db: Database session

    Returns:
        List of all company objects (CompanyOut schema)
    """
    return db.query(models.Company).all()

