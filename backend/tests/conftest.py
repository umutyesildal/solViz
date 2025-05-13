import os
import pytest
import asyncio
import sys
from typing import AsyncGenerator, Generator
from unittest.mock import patch, MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Mock OpenAI before importing app modules
mock_openai = MagicMock()
sys.modules['openai'] = mock_openai
mock_openai.Client.return_value = MagicMock()

from app.db.base import Base
from app.db.session import get_db
from app.main import app as application
from app.core.config import settings

# Use SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Create async engine for testing
engine = create_async_engine(
    TEST_DATABASE_URL, 
    poolclass=NullPool,
)
TestingSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a new database session for testing.
    """
    async with TestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@pytest.fixture(scope="session")
def event_loop(request) -> Generator:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def init_db() -> AsyncGenerator[None, None]:
    """Initialize the test database."""
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # Clean up - drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def db_session(init_db) -> AsyncGenerator[AsyncSession, None]:
    """
    Create a clean database session for each test function.
    """
    async with TestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()


@pytest.fixture(scope="function")
async def test_app(db_session) -> FastAPI:
    """
    Create a FastAPI test application with the test database.
    """
    # Override the database dependency
    application.dependency_overrides[get_db] = lambda: db_session
    
    return application


@pytest.fixture(scope="function")
async def client(test_app) -> AsyncGenerator[AsyncClient, None]:
    """
    Create a test client for the FastAPI application.
    """
    test_app = await test_app  # Resolve coroutine
    async with AsyncClient(app=test_app, base_url="http://test") as test_client:
        yield test_client