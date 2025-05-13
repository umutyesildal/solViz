import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.models import User


@pytest.fixture
async def test_user(db_session: AsyncSession):
    """Create a test user for testing."""
    user = User(
        email="query_test@example.com", 
        full_name="Query Test User"
    )
    user.set_password("password123")
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    return user


@pytest.fixture
async def auth_headers(test_user):
    """Create authorization headers with JWT token."""
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.mark.asyncio
@patch("app.services.nlp_service.process_natural_language_query")
@patch("app.services.flipside_service.execute_query")
async def test_natural_language_query_flipside(
    mock_execute_query,
    mock_process_nlq,
    client: AsyncClient,
    test_app: FastAPI,
    auth_headers: dict
):
    """Test the natural language query endpoint with Flipside provider."""
    # Mock the NLP service to return a SQL query
    mock_process_nlq.return_value = "SELECT date_trunc('day', block_time) as day, count(*) as transfers FROM solana.transactions WHERE success = true GROUP BY 1 ORDER BY 1"
    
    # Mock the Flipside service to return query results
    mock_execute_query.return_value = {
        "data": {
            "values": [
                {"day": "2024-01-01T00:00:00Z", "transfers": 1200000},
                {"day": "2024-01-02T00:00:00Z", "transfers": 1300000},
                {"day": "2024-01-03T00:00:00Z", "transfers": 1250000},
            ]
        },
        "sql_query": "SELECT date_trunc('day', block_time) as day, count(*) as transfers FROM solana.transactions WHERE success = true GROUP BY 1 ORDER BY 1",
        "vega_spec": {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "mark": "line",
            "encoding": {
                "x": {"field": "day", "type": "temporal"},
                "y": {"field": "transfers", "type": "quantitative"}
            }
        }
    }
    
    # Query data
    query_data = {
        "natural_language_query": "Show me daily Solana transaction counts for the past 3 days",
        "provider": "flipside"
    }
    
    # Make request
    response = await client.post(
        f"{test_app.url_path_for('natural_language_query')}",
        json=query_data,
        headers=auth_headers
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "sql_query" in data
    assert "vega_spec" in data
    
    # Check that the services were called correctly
    mock_process_nlq.assert_called_once_with(query_data["natural_language_query"])
    mock_execute_query.assert_called_once()


@pytest.mark.asyncio
@patch("app.services.nlp_service.process_natural_language_query")
@patch("app.services.helius_service.execute_query")
async def test_natural_language_query_helius(
    mock_execute_query,
    mock_process_nlq,
    client: AsyncClient,
    test_app: FastAPI,
    auth_headers: dict
):
    """Test the natural language query endpoint with Helius provider."""
    # Mock the NLP service to return a query
    mock_process_nlq.return_value = "Get SPL token transfers for the last 24 hours"
    
    # Mock the Helius service to return query results
    mock_execute_query.return_value = {
        "data": {
            "values": [
                {"token": "SOL", "count": 50000, "volume": 1500000},
                {"token": "USDC", "count": 30000, "volume": 2500000},
                {"token": "BONK", "count": 20000, "volume": 100000}
            ]
        },
        "query": "Get SPL token transfers for the last 24 hours",
        "vega_spec": {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "mark": "bar",
            "encoding": {
                "x": {"field": "token", "type": "nominal"},
                "y": {"field": "count", "type": "quantitative"}
            }
        }
    }
    
    # Query data
    query_data = {
        "natural_language_query": "Show me token transfer volume in the last 24 hours",
        "provider": "helius"
    }
    
    # Make request
    response = await client.post(
        f"{test_app.url_path_for('natural_language_query')}",
        json=query_data,
        headers=auth_headers
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "query" in data or "sql_query" in data  # Either key may be used
    assert "vega_spec" in data
    
    # Check that the services were called correctly
    mock_process_nlq.assert_called_once_with(query_data["natural_language_query"])
    mock_execute_query.assert_called_once()


@pytest.mark.asyncio
async def test_natural_language_query_invalid_provider(
    client: AsyncClient,
    test_app: FastAPI,
    auth_headers: dict
):
    """Test the natural language query endpoint with an invalid provider."""
    # Query data with invalid provider
    query_data = {
        "natural_language_query": "Show me token transfers",
        "provider": "invalid_provider"
    }
    
    # Make request
    response = await client.post(
        f"{test_app.url_path_for('natural_language_query')}",
        json=query_data,
        headers=auth_headers
    )
    
    # Assertions
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data