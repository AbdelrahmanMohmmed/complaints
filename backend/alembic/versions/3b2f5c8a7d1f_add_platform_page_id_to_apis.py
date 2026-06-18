"""add platform_page_id to apis

Revision ID: 3b2f5c8a7d1f
Revises: 6c7f0d1f4e2a
Create Date: 2026-05-11 23:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "3b2f5c8a7d1f"
down_revision: Union[str, Sequence[str], None] = "6c7f0d1f4e2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "apis",
        sa.Column("platform_page_id", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("apis", "platform_page_id")
