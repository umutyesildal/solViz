from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    api_credentials = relationship("APICredential", back_populates="user")
    charts = relationship("Chart", back_populates="user")
    dashboards = relationship("Dashboard", back_populates="user")
    conversation_threads = relationship("ConversationThread", back_populates="user")


class APICredential(Base):
    __tablename__ = "api_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String, nullable=False)  # "flipside", "helius", "bitquery", "dune"
    api_key = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="api_credentials")


class Chart(Base):
    __tablename__ = "charts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    query = Column(Text, nullable=False)
    natural_language_query = Column(Text, nullable=False)
    provider = Column(String, nullable=False)  # "flipside", "helius", "bitquery", "dune"
    data = Column(JSON, nullable=False)  # Store chart data in JSON format
    vega_spec = Column(JSON, nullable=False)  # Store Vega-Lite specification
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # New fields for analytics and performance tracking
    last_refreshed_at = Column(DateTime(timezone=True))  # When data was last updated
    execution_time_ms = Column(Integer)  # Query execution time in milliseconds
    view_count = Column(Integer, default=0)  # How many times this chart was viewed

    user = relationship("User", back_populates="charts")
    dashboard_charts = relationship("DashboardChart", back_populates="chart")
    tags = relationship("Tag", secondary="chart_tags", back_populates="charts")


class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    layout = Column(JSON, nullable=True)  # Store layout configuration
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="dashboards")
    dashboard_charts = relationship("DashboardChart", back_populates="dashboard")
    tags = relationship("Tag", secondary="dashboard_tags", back_populates="dashboards")


class DashboardChart(Base):
    __tablename__ = "dashboard_charts"

    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id"))
    chart_id = Column(Integer, ForeignKey("charts.id"))
    position_x = Column(Integer, nullable=False, default=0)
    position_y = Column(Integer, nullable=False, default=0)
    width = Column(Integer, nullable=False, default=4)
    height = Column(Integer, nullable=False, default=4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dashboard = relationship("Dashboard", back_populates="dashboard_charts")
    chart = relationship("Chart", back_populates="dashboard_charts")


# Define Tag and association tables for tagging charts and dashboards
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    
    # Relationships
    charts = relationship("Chart", secondary="chart_tags", back_populates="tags")
    dashboards = relationship("Dashboard", secondary="dashboard_tags", back_populates="tags")


# Association table for Chart-Tag many-to-many relationship
chart_tags = Table(
    "chart_tags",
    Base.metadata,
    Column("chart_id", Integer, ForeignKey("charts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)


# Association table for Dashboard-Tag many-to-many relationship
dashboard_tags = Table(
    "dashboard_tags",
    Base.metadata,
    Column("dashboard_id", Integer, ForeignKey("dashboards.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)


# Conversation models for storing chat history
class ConversationThread(Base):
    __tablename__ = "conversation_threads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    thread_id = Column(String(255), nullable=False, unique=True)  # External thread ID from Assistant API
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversation_threads")
    messages = relationship("ConversationMessage", back_populates="thread", cascade="all, delete-orphan")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(String(255), ForeignKey("conversation_threads.thread_id"))
    role = Column(String(50), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    thread = relationship("ConversationThread", back_populates="messages")
