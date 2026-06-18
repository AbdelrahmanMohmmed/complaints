"""merge heads

Revision ID: 6c7f0d1f4e2a
Revises: 14acaa779a36, 9f1c0b9a2d3f
Create Date: 2026-04-29 19:52:00.000000

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6c7f0d1f4e2a"
down_revision: Union[str, Sequence[str], None] = ("14acaa779a36", "9f1c0b9a2d3f")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
