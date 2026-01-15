"""Add wallet authentication

Revision ID: b2f3c4d5e6a7
Revises: 8a16a07df937
Create Date: 2026-01-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2f3c4d5e6a7'
down_revision: Union[str, Sequence[str], None] = '8a16a07df937'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to support wallet authentication.

    Note: For SQLite, we add new columns but don't modify existing column constraints.
    The application code (SQLModel) will handle nullability at the ORM level.
    """
    # Add auth_type column with default 'password' for existing users
    op.add_column('user', sa.Column('auth_type', sa.String(20), nullable=False, server_default='password'))

    # Add wallet-specific columns (nullable for password users)
    op.add_column('user', sa.Column('wallet_address', sa.String(42), nullable=True))
    op.add_column('user', sa.Column('message_version', sa.Integer(), nullable=True))

    # Add indexes
    op.create_index('ix_user_auth_type', 'user', ['auth_type'])
    op.create_index('ix_user_wallet_address', 'user', ['wallet_address'])

    # Add unique constraint on wallet_address
    op.create_unique_constraint('uq_user_wallet_address', 'user', ['wallet_address'])


def downgrade() -> None:
    """Downgrade schema to remove wallet authentication."""
    # Drop unique constraint
    op.drop_constraint('uq_user_wallet_address', 'user', type_='unique')

    # Drop indexes
    op.drop_index('ix_user_wallet_address', 'user')
    op.drop_index('ix_user_auth_type', 'user')

    # Drop wallet columns
    op.drop_column('user', 'message_version')
    op.drop_column('user', 'wallet_address')
    op.drop_column('user', 'auth_type')
