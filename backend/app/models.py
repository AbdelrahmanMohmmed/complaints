"""SQLAlchemy ORM models for the Complaints Management System.

Models are organized into three categories:
- Configuration: Domain, Role (system setup)
- Business: Company, User, Api (core entities)
- Processing: Feedback, FeedbackCategory (feedback pipeline)

"""

from sqlalchemy import (
    Column,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()


# ============================================================================
# Configuration Models (System Setup)
# ============================================================================


class Domain(Base):
    """Domain model - represents business domains/categories."""

    __tablename__ = "domains"

    domain_id = Column(Integer, primary_key=True, autoincrement=True)
    domain_name = Column(String, nullable=False, unique=True)

    # Relationships
    companies = relationship("Company", back_populates="domain")
    feedback_categories = relationship("FeedbackCategory", back_populates="domain")

    def __repr__(self):
        return f"<Domain(domain_id={self.domain_id}, name={self.domain_name})>"


class Role(Base):
    """Role model - represents user roles in the system."""

    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), nullable=False)

    # Relationships
    users = relationship("User", back_populates="role")

    def __repr__(self):
        return f"<Role(role_id={self.role_id}, name={self.role_name})>"


# ============================================================================
# Business Models (Core Entities)
# ============================================================================


class Company(Base):
    """Company model - represents organizations using the system."""

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

    def __repr__(self):
        return f"<Company(company_id={self.company_id}, name={self.company_name})>"


class User(Base):
    """User model - represents system users."""

    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    f_name = Column(String(50), nullable=False)
    l_name = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # ← new
    verification_code = Column(String(6), nullable=True)  # ← new
    verification_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="users")
    role = relationship("Role", back_populates="users")

    def __repr__(self):
        return f"<User(user_id={self.user_id}, email={self.email})>"


class Api(Base):
    """Api model - represents integrated API connections.

    Stores credentials and configuration for external feedback sources
    (Facebook, Freshdesk, Web Form, etc.).
    """

    __tablename__ = "apis"

    api_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    api_key = Column(String, nullable=False)
    channel_name = Column(String(50), nullable=False)
    api_base_url = Column(String)
    platform_page_id = Column(
        String, nullable=True
    )  # Facebook page ID or other platform-specific IDs
    status = Column(String(20), default="active")  # active, expired, disabled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="apis")
    feedbacks = relationship("Feedback", back_populates="api", passive_deletes=True)

    def __repr__(self):
        return f"<Api(api_id={self.api_id}, channel={self.channel_name}, status={self.status})>"


# ============================================================================
# Processing Models (Feedback Pipeline)
# ============================================================================


class FeedbackCategory(Base):
    """FeedbackCategory model - categorizes feedback by type."""

    __tablename__ = "feedback_categories"

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, ForeignKey("domains.domain_id"), nullable=False)
    category_name = Column(String(100), nullable=False)
    label_id = Column(Integer, nullable=True)

    # Relationships
    domain = relationship("Domain", back_populates="feedback_categories")
    feedbacks = relationship("Feedback", back_populates="category")

    def __repr__(self):
        return f"<FeedbackCategory(category_id={self.category_id}, name={self.category_name})>"


class Feedback(Base):
    """Feedback model - represents customer feedback with ML analysis results.

    Status Pipeline: unprocessed → preprocessed → analyzed

    Fields:
    - Raw: feedback_context, customer_name
    - Processed: cleaned_text (after preprocessing)
    - Analyzed: sentiment, emotion, problem_type, priority (after ML analysis)
    - Tracking: created_at, ml_processed_at (timestamps)
    """

    __tablename__ = "feedback"
    __table_args__ = (Index("idx_api_id", "api_id"),)

    # Primary Keys & Foreign Keys
    feedback_id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    api_id = Column(Integer, ForeignKey("apis.api_id"), nullable=False)
    category_id = Column(
        Integer, ForeignKey("feedback_categories.category_id"), nullable=True
    )

    # Raw Feedback Data
    customer_name = Column(String(100))
    feedback_context = Column(Text)

    # Processing Pipeline
    language = Column(String(20), nullable=True)
    cleaned_text = Column(Text, nullable=True)  # Preprocessed text
    status = Column(
        String(20), default="unprocessed"
    )  # unprocessed, preprocessed, analyzed

    # ML Analysis Results
    sentiment = Column(String(20), nullable=True)  # positive, negative, neutral
    sentiment_id = Column(Integer, nullable=True)
    emotion = Column(String(20), nullable=True)  # happy, sad, angry, etc.
    emotion_id = Column(Integer, nullable=True)
    problem_type = Column(String(50), nullable=True)  # Service Quality, Billing, etc.
    problem_type_id = Column(Integer, nullable=True)
    priority = Column(String(20), nullable=True)  # high, medium, low

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ml_processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    company = relationship("Company", back_populates="feedbacks")
    api = relationship("Api", back_populates="feedbacks")
    category = relationship("FeedbackCategory", back_populates="feedbacks")

    def __repr__(self):
        return (
            f"<Feedback(feedback_id={self.feedback_id}, status={self.status}, "
            f"sentiment={self.sentiment}, priority={self.priority})>"
        )
