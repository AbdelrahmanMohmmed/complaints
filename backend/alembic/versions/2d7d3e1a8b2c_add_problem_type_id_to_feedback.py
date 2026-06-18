"""add problem_type_id to feedback

Revision ID: 2d7d3e1a8b2c
Revises: 14acaa779a36
Create Date: 2026-05-13 10:40:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "2d7d3e1a8b2c"
down_revision: Union[str, Sequence[str], None] = "14acaa779a36"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("feedback", sa.Column("problem_type_id", sa.Integer(), nullable=True))
    op.execute("""
        UPDATE feedback
        SET problem_type_id = CASE problem_type
            WHEN 'Delivery Issue' THEN 0
            WHEN 'Food Quality' THEN 1
            WHEN 'Hygiene' THEN 2
            WHEN 'Service Quality' THEN 3
            WHEN 'Pricing' THEN 4
            WHEN 'Order Accuracy' THEN 5
            WHEN 'Bad Atmosphere' THEN 6
            WHEN 'Menu' THEN 7
            ELSE NULL
        END
        WHERE problem_type IS NOT NULL;
        """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("feedback", "problem_type_id")
