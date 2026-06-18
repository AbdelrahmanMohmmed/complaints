"""add email verification to users

Revision ID: 479e530a9bd0
Revises: 8fe4a32b7a97
Create Date: 2026-03-17 13:00:43.158479

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '479e530a9bd0'
down_revision: Union[str, Sequence[str], None] = '8fe4a32b7a97'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('verification_code', sa.String(6), nullable=True))
    op.add_column('users', sa.Column('verification_expires_at', sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'verification_code')
    op.drop_column('users', 'verification_expires_at')
