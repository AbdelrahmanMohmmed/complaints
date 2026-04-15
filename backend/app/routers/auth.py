"""Authentication routes - login and token generation.

Provides endpoints for user login and JWT token creation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import database, models, oauth2, utils
from ..schemas import auth

router = APIRouter(tags=["Authentication"])


# ============================================================================
# Login Endpoint
# ============================================================================


@router.post("/login", response_model=auth.Token)
def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
) -> dict:
    """Authenticate user and return access token.

    Validates user email and password against database records.
    Returns JWT access token on success.

    Args:
        user_credentials: OAuth2 password form with username (email) and password
        db: Database session

    Returns:
        Token response with access_token and token_type

    Raises:
        HTTPException: 403 if credentials are invalid
    """
    # Query user by email
    user = db.query(models.User).filter(
        models.User.email == user_credentials.username
    ).first()

    # Validate credentials
    if not user or not utils.verify(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid email or password"
        )

    # Create and return JWT token
    access_token = oauth2.create_access_token(data={"user_id": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}