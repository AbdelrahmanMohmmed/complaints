"""drop feedback categories and text label columns

Revision ID: c3e4f5a6b7c8
Revises: 3b2f5c8a7d1f, 5a1c4f2b7d9e, d1c2e3f4a5b6
Create Date: 2026-06-03 00:00:00.000000
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "c3e4f5a6b7c8"
down_revision = ("3b2f5c8a7d1f", "5a1c4f2b7d9e", "d1c2e3f4a5b6")
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE feedback DROP COLUMN IF EXISTS category_id CASCADE")
    op.execute("ALTER TABLE feedback DROP COLUMN IF EXISTS sentiment CASCADE")
    op.execute("ALTER TABLE feedback DROP COLUMN IF EXISTS emotion CASCADE")
    op.execute("ALTER TABLE feedback DROP COLUMN IF EXISTS problem_type CASCADE")
    op.execute("DROP TABLE IF EXISTS feedback_categories CASCADE")


def downgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS feedback_categories (
            category_id SERIAL PRIMARY KEY,
            domain_id INTEGER NOT NULL,
            category_name VARCHAR(100) NOT NULL,
            label_id INTEGER
        )
        """)
    op.execute("""
        ALTER TABLE feedback
        ADD COLUMN IF NOT EXISTS category_id INTEGER,
        ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20),
        ADD COLUMN IF NOT EXISTS emotion VARCHAR(20),
        ADD COLUMN IF NOT EXISTS problem_type VARCHAR(50)
        """)
