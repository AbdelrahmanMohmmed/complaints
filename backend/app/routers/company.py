from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(prefix="/companies", tags=['Companies'])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.CompanyOut)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(database.get_db)):
    # 1. Check if the domain exists first
    domain = db.query(models.Domain).filter(models.Domain.domain_id == company.domain_id).first()
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Domain with ID {company.domain_id} does not exist. Choose 1 (food) or 2 (health_tools)."
        )

    # 2. Create the company
    new_company = models.Company(**company.dict())
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

@router.get("/", response_model=list[schemas.CompanyOut])
def get_companies(db: Session = Depends(database.get_db)):
    return db.query(models.Company).all()