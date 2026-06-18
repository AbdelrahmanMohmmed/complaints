"""add cleaned_text to feedback

Revision ID: 8fe4a32b7a97
Revises: b5e2d832d69c
Create Date: 2026-03-17 12:24:24.799135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8fe4a32b7a97'
down_revision: Union[str, Sequence[str], None] = 'b5e2d832d69c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('feedback', sa.Column('cleaned_text', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('feedback', 'cleaned_text')
