"""User management routes - create and retrieve users.

Provides endpoints for user registration and profile retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import database, models, oauth2, utils
from ..schemas import user

router = APIRouter(prefix="/users", tags=["Users"])


# ============================================================================
# User Creation
# ============================================================================


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=user.UserOut)
def create_user(
    user_data: user.UserCreate, db: Session = Depends(database.get_db)
) -> models.User:
    """Create a new user account.

    Accepts user registration data, hashes password, and saves to database.

    Args:
        user_data: User creation schema with email, password, name, etc.
        db: Database session

    Returns:
        Created user object (UserOut schema)

    Raises:
        HTTPException: 400 if email is already registered
    """
    data = user_data.dict()
    password = data.pop("password")

    # Hash password before storage
    data["password_hash"] = utils.hash(password)

    # Create and insert user
    new_user = models.User(**data)
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    return new_user


# ============================================================================
# User Retrieval
# ============================================================================


@router.get("/me", response_model=user.UserMe)
def get_me(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user),
) -> models.User:
    """Retrieve current authenticated user's profile.

    Returns the profile information of the user making the request.

    Args:
        db: Database session
        current_user_id: Current user ID from JWT token

    Returns:
        User profile (UserMe schema)

    Raises:
        HTTPException: 404 if user not found (shouldn't happen with valid token)
    """
    user = db.query(models.User).filter(
        models.User.user_id == current_user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user