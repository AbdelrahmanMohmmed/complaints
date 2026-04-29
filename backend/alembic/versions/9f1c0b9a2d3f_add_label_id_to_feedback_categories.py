"""add label_id to feedback_categories

Revision ID: 9f1c0b9a2d3f
Revises: b5e2d832d69c
Create Date: 2026-04-29 19:45:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "9f1c0b9a2d3f"
down_revision: Union[str, Sequence[str], None] = "b5e2d832d69c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

LABELS = [
    (0, "Delivery Issue"),
    (1, "Food Quality"),
    (2, "Hygiene"),
    (3, "Service Quality"),
    (4, "Pricing"),
    (5, "Order Accuracy"),
    (6, "Bad Atmosphere"),
    (7, "Menu"),
]


def upgrade() -> None:
    op.add_column(
        "feedback_categories", sa.Column("label_id", sa.Integer(), nullable=True)
    )

    bind = op.get_bind()

    # Update existing categories with matching names
    for label_id, name in LABELS:
        bind.execute(
            sa.text("""
                UPDATE feedback_categories
                SET label_id = :label_id
                WHERE category_name = :name AND label_id IS NULL
                """),
            {"label_id": label_id, "name": name},
        )

    # Insert missing labels for each domain
    domains = bind.execute(sa.text("SELECT domain_id FROM domains")).fetchall()
    for (domain_id,) in domains:
        for label_id, name in LABELS:
            bind.execute(
                sa.text("""
                    INSERT INTO feedback_categories (domain_id, category_name, label_id)
                    SELECT :domain_id, :name, :label_id
                    WHERE NOT EXISTS (
                        SELECT 1 FROM feedback_categories
                        WHERE domain_id = :domain_id AND category_name = :name
                    )
                    """),
                {"domain_id": domain_id, "name": name, "label_id": label_id},
            )


def downgrade() -> None:
    op.drop_column("feedback_categories", "label_id")
