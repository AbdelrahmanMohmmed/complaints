"""allow null feedback api_id on delete

Revision ID: 0f1e2d3c4b5a
Revises: c3e4f5a6b7c8
Create Date: 2026-06-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0f1e2d3c4b5a"
down_revision = "c3e4f5a6b7c8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("feedback_api_id_fkey", "feedback", type_="foreignkey")
    op.alter_column(
        "feedback",
        "api_id",
        existing_type=sa.Integer(),
        nullable=True,
    )
    op.create_foreign_key(
        "feedback_api_id_fkey",
        "feedback",
        "apis",
        ["api_id"],
        ["api_id"],
        ondelete="SET NULL",
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
    op.alter_column(
        "feedback",
        "api_id",
        existing_type=sa.Integer(),
        nullable=False,
    )
