"""add_conversation_and_tags_tables

Revision ID: 03403a40c876
Revises: 8b7217291b59
Create Date: 2025-05-16 20:06:46.529461

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '03403a40c876'
down_revision = '8b7217291b59'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create conversation_threads table
    op.create_table(
        'conversation_threads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('thread_id', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_activity_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('thread_id'),
        sa.UniqueConstraint('user_id', 'thread_id')
    )
    op.create_index(op.f('ix_conversation_threads_id'), 'conversation_threads', ['id'], unique=False)

    # Create conversation_messages table
    op.create_table(
        'conversation_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('thread_id', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['thread_id'], ['conversation_threads.thread_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversation_messages_id'), 'conversation_messages', ['id'], unique=False)

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_tags_id'), 'tags', ['id'], unique=False)

    # Create chart_tags table
    op.create_table(
        'chart_tags',
        sa.Column('chart_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['chart_id'], ['charts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('chart_id', 'tag_id')
    )

    # Create dashboard_tags table
    op.create_table(
        'dashboard_tags',
        sa.Column('dashboard_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['dashboard_id'], ['dashboards.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('dashboard_id', 'tag_id')
    )


def downgrade() -> None:
    # Drop tables in reverse order of creation
    op.drop_table('dashboard_tags')
    op.drop_table('chart_tags')
    op.drop_index(op.f('ix_tags_id'), table_name='tags')
    op.drop_table('tags')
    op.drop_index(op.f('ix_conversation_messages_id'), table_name='conversation_messages')
    op.drop_table('conversation_messages')
    op.drop_index(op.f('ix_conversation_threads_id'), table_name='conversation_threads')
    op.drop_table('conversation_threads')
