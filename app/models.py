from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Domain(Base):
    __tablename__ = "domains"

    domain_id = Column(Integer, primary_key=True, autoincrement=True)
    domain_name = Column(String, nullable=False, unique=True)

    # Relationships
    companies = relationship("Company", back_populates="domain")
    feedback_categories = relationship("FeedbackCategory", back_populates="domain")


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(100), nullable=False)
    email = Column(String(100))
    phone = Column(String)
    domain_id = Column(Integer, ForeignKey("domains.domain_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    domain = relationship("Domain", back_populates="companies")
    users = relationship("User", back_populates="company")
    apis = relationship("Api", back_populates="company")
    feedbacks = relationship("Feedback", back_populates="company")


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), nullable=False)

    # Relationships
    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    f_name = Column(String(50), nullable=False)
    l_name = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String, nullable=False)   
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="users")
    role = relationship("Role", back_populates="users")


class Api(Base):
    __tablename__ = "apis"

    api_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    api_key = Column(String, nullable=False)
    channel_name = Column(String(50), nullable=False)     
    api_base_url = Column(String)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="apis")
    feedbacks = relationship("Feedback", back_populates="api")


class FeedbackCategory(Base):
    __tablename__ = "feedback_categories"

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.domain_id"), nullable=False)
    category_name = Column(String(100), nullable=False)

    # Relationships
    domain = relationship("Domain", back_populates="feedback_categories")
    feedbacks = relationship("Feedback", back_populates="category")


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)  
    api_id = Column(Integer, ForeignKey("apis.api_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("feedback_categories.category_id"), nullable=True)
    customer_name = Column(String(100))
    feedback_context = Column(Text)
    status = Column(String(20), default="new")
    sentiment = Column(String(20), nullable=True)         
    emotion = Column(String(20), nullable=True)          
    priority = Column(String(20), nullable=True)         
    ml_processed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Relationships
    company = relationship("Company", back_populates="feedbacks")
    api = relationship("Api", back_populates="feedbacks")
    category = relationship("FeedbackCategory", back_populates="feedbacks")