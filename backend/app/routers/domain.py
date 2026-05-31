from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import database, models

router = APIRouter(prefix="/domains", tags=["Domains"])


class DomainCreate(BaseModel):
    domain_name: str


class DomainUpdate(BaseModel):
    domain_name: str


class DomainOut(BaseModel):
    domain_id: int
    domain_name: str
    company_count: int
    feedback_count: int

    class Config:
        from_attributes = True


def _serialize_domain(db: Session, domain: models.Domain) -> DomainOut:
    company_count = (
        db.query(func.count(models.Company.company_id))
        .filter(models.Company.domain_id == domain.domain_id)
        .scalar()
        or 0
    )
    feedback_count = (
        db.query(func.count(models.Feedback.feedback_id))
        .join(models.Company, models.Feedback.company_id == models.Company.company_id)
        .filter(models.Company.domain_id == domain.domain_id)
        .scalar()
        or 0
    )
    return DomainOut(
        domain_id=domain.domain_id,
        domain_name=domain.domain_name,
        company_count=company_count,
        feedback_count=feedback_count,
    )


@router.get("/", response_model=list[DomainOut])
def list_domains(db: Session = Depends(database.get_db)):
    domains = db.query(models.Domain).order_by(models.Domain.domain_name.asc()).all()
    return [_serialize_domain(db, domain) for domain in domains]


@router.post("/", response_model=DomainOut, status_code=status.HTTP_201_CREATED)
def create_domain(payload: DomainCreate, db: Session = Depends(database.get_db)):
    domain_name = payload.domain_name.strip()
    if not domain_name:
        raise HTTPException(status_code=400, detail="Domain name is required")

    existing = (
        db.query(models.Domain)
        .filter(func.lower(models.Domain.domain_name) == domain_name.lower())
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Domain already exists")

    domain = models.Domain(domain_name=domain_name)
    db.add(domain)
    db.commit()
    db.refresh(domain)
    return _serialize_domain(db, domain)


@router.patch("/{domain_id}", response_model=DomainOut)
def update_domain(
    domain_id: int,
    payload: DomainUpdate,
    db: Session = Depends(database.get_db),
):
    domain = (
        db.query(models.Domain).filter(models.Domain.domain_id == domain_id).first()
    )
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    domain_name = payload.domain_name.strip()
    if not domain_name:
        raise HTTPException(status_code=400, detail="Domain name is required")

    existing = (
        db.query(models.Domain)
        .filter(
            func.lower(models.Domain.domain_name) == domain_name.lower(),
            models.Domain.domain_id != domain_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Domain already exists")

    domain.domain_name = domain_name
    db.commit()
    db.refresh(domain)
    return _serialize_domain(db, domain)


@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_domain(domain_id: int, db: Session = Depends(database.get_db)):
    domain = (
        db.query(models.Domain).filter(models.Domain.domain_id == domain_id).first()
    )
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    has_companies = (
        db.query(models.Company).filter(models.Company.domain_id == domain_id).first()
    )
    has_categories = (
        db.query(models.FeedbackCategory)
        .filter(models.FeedbackCategory.domain_id == domain_id)
        .first()
    )
    if has_companies or has_categories:
        raise HTTPException(
            status_code=400,
            detail="Domain cannot be deleted while companies or categories still use it",
        )

    db.delete(domain)
    db.commit()
