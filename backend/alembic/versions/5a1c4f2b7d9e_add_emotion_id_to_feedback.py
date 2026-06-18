"""add emotion_id to feedback

Revision ID: 5a1c4f2b7d9e
Revises: 2d7d3e1a8b2c
Create Date: 2026-05-13 11:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "5a1c4f2b7d9e"
down_revision: Union[str, Sequence[str], None] = "2d7d3e1a8b2c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("feedback", sa.Column("emotion_id", sa.Integer(), nullable=True))
    op.execute("""
        UPDATE feedback
        SET emotion_id = CASE emotion
            WHEN 'frustrated' THEN 0
            WHEN 'neutral' THEN 1
            WHEN 'disgusted' THEN 2
            WHEN 'satisfied' THEN 3
            ELSE NULL
        END
        WHERE emotion IS NOT NULL;
        """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("feedback", "emotion_id")
