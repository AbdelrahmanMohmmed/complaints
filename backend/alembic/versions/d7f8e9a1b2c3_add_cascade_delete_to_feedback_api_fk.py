"""add cascade delete to feedback api fk

Revision ID: d7f8e9a1b2c3
Revises: 6c7f0d1f4e2a
Create Date: 2026-06-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d7f8e9a1b2c3"
down_revision: Union[str, Sequence[str], None] = "6c7f0d1f4e2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("feedback_api_id_fkey", "feedback", type_="foreignkey")
    op.create_foreign_key(
        "feedback_api_id_fkey",
        "feedback",
        "apis",
        ["api_id"],
        ["api_id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("feedback_api_id_fkey", "feedback", type_="foreignkey")
    op.create_foreign_key(
        "feedback_api_id_fkey",
        "feedback",
        "apis",
        ["api_id"],
        ["api_id"],
    )
