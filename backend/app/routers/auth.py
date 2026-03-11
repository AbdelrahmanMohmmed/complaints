from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, utils, oauth2
from ..schemas import auth

router = APIRouter(tags=['Authentication'])

@router.post('/login', response_model=auth.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    print(f"🔐 Login attempt: {user_credentials.username}")  # ← add this
    if not user or not utils.verify(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
    if not user.is_active and user.role_id != 1:  # Allow admins to log in even if inactive
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive. Contact your admin.")

    print(f"✅ Successful login for: {user_credentials.username}")  # ← and this
    access_token = oauth2.create_access_token(data={"user_id": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}