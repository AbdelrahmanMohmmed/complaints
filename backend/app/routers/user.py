from typing import List
from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .. import models, utils, database, oauth2 ,schemas
from ..schemas import user
from ..schemas import user as schemas

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

@router.get("/", response_model=List[schemas.UserOut])
def get_users(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not current_user or current_user.role_id != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can view users")
    
    users = db.query(models.User).filter(models.User.company_id == current_user.company_id).all()
    return users

@router.patch("/{user_id}/status", response_model=schemas.UserOut)
def toggle_user_status(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not current_user or current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Only admins can update users")

    user = db.query(models.User).filter(
        models.User.user_id == user_id,
        models.User.company_id == current_user.company_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

@router.put("/me", response_model=schemas.UserOut)
def update_me(
    user_data: schemas.UserProfileUpdate,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.f_name = user_data.f_name
    user.l_name = user_data.l_name
    user.email = user_data.email
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already in use")
    return user

@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_data: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not current_user or current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Only admins can update users")

    user = db.query(models.User).filter(
        models.User.user_id == user_id,
        models.User.company_id == current_user.company_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.role_id == 1:
        raise HTTPException(status_code=403, detail="Cannot assign admin role here")

    user.f_name = user_data.f_name
    user.l_name = user_data.l_name
    user.email = user_data.email
    user.role_id = user_data.role_id
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    current_user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not current_user or current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Only admins can delete users")

    user = db.query(models.User).filter(
        models.User.user_id == user_id,
        models.User.company_id == current_user.company_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    

@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    pwd_data: schemas.UserPasswordUpdate,
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(oauth2.get_current_user)
):
    user = db.query(models.User).filter(models.User.user_id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not utils.verify(pwd_data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = utils.hash(pwd_data.new_password)
    db.commit()