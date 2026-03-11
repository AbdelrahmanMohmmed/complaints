from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .. import models, utils, database, oauth2 ,schemas
from ..schemas import user

router = APIRouter(prefix="/users", tags=['Users'])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def create_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)  # ← require login
):
    # Check role
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not current_user or current_user.role_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create users"
        )
    # ← ADD THIS: prevent creating another admin via this endpoint
    if user_data.role_id == 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create admin users here. Admin is created only during company signup."
        )
    data = user_data.dict()
    password = data.pop('password')
    data['password_hash'] = utils.hash(password)
    data['company_id'] = current_user.company_id 

    new_user = models.User(**data)
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    return new_user

@router.get("/me", response_model=user.UserMe)
def get_me(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user