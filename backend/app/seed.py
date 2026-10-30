"""Seed reference data required for the application to work.

The Alembic baseline migration seeds roles (and default domains), but the app
also creates tables with ``Base.metadata.create_all()`` when it starts. A fresh
database created that way has all tables but none of the reference rows, which
makes signup fail because it expects ``roles.role_id = 1`` to exist.

The function below is idempotent: it only inserts what is missing, so it is
safe to run on every startup and against databases that were migrated already.
"""

import logging

from sqlalchemy import func

from . import database, models

logger = logging.getLogger(__name__)

DEFAULT_ROLES = (
    (1, "Manager"),
    (2, "Customer service supervisor"),
    (3, "Website configurator"),
)

DEFAULT_DOMAINS = ("Food", "Health and Safety")


def seed_reference_data() -> None:
    """Insert default roles and domains if they are missing."""
    db = database.SessionLocal()
    try:
        changed = False

        for role_id, role_name in DEFAULT_ROLES:
            if db.get(models.Role, role_id) is None:
                db.add(models.Role(role_id=role_id, role_name=role_name))
                changed = True

        for domain_name in DEFAULT_DOMAINS:
            exists = (
                db.query(models.Domain)
                .filter(func.lower(models.Domain.domain_name) == domain_name.lower())
                .first()
            )
            if exists is None:
                db.add(models.Domain(domain_name=domain_name))
                changed = True

        if changed:
            db.commit()
            logger.info("Seeded missing reference data (roles/domains)")
    except Exception:
        db.rollback()
        logger.exception("Failed to seed reference data")
        raise
    finally:
        db.close()
