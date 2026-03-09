from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .. import models, schemas, utils, database ,oauth2

router = APIRouter(prefix="/users", tags=['Users'])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    user_data = user.dict()
    password = user_data.pop('password')
    
    user_data['password_hash'] = utils.hash(password)
    
    new_user = models.User(**user_data)
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    return new_user

@router.get("/me", response_model=schemas.UserMe)
def get_me(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user