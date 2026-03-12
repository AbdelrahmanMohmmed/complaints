"""add on delete set null to feedback api_id

Revision ID: b5e2d832d69c
Revises: a0d76060f94b
Create Date: 2026-03-13 01:13:06.244520

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5e2d832d69c'
down_revision: Union[str, Sequence[str], None] = 'a0d76060f94b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_constraint('feedback_api_id_fkey', 'feedback', type_='foreignkey')
    op.create_foreign_key(
        'feedback_api_id_fkey', 'feedback', 'apis',
        ['api_id'], ['api_id'],
        ondelete='SET NULL'
    )

def downgrade():
    op.drop_constraint('feedback_api_id_fkey', 'feedback', type_='foreignkey')
    op.create_foreign_key(
        'feedback_api_id_fkey', 'feedback', 'apis',
        ['api_id'], ['api_id']
    )
