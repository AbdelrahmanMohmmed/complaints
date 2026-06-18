"""add language to feedback

Revision ID: c1a2b3d4e5f6
Revises: 6c7f0d1f4e2a
Create Date: 2026-06-10 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c1a2b3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "6c7f0d1f4e2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "feedback", sa.Column("language", sa.String(length=20), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("feedback", "language")
