"""add sentiment_id to feedback

Revision ID: d1c2e3f4a5b6
Revises: b5e2d832d69c
Create Date: 2026-05-16 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d1c2e3f4a5b6"
down_revision: Union[str, Sequence[str], None] = "b5e2d832d69c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("feedback", sa.Column("sentiment_id", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("feedback", "sentiment_id")
