import pytest
from httpx import AsyncClient
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.models import User, Chart


@pytest.fixture
async def test_user(db_session: AsyncSession):
    """Create a test user for testing."""
    user = User(
        email="chart_test@example.com", 
        full_name="Chart Test User"
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


@pytest.fixture
async def test_chart(db_session: AsyncSession, test_user: User):
    """Create a test chart for testing."""
    chart = Chart(
        title="Test Chart",
        description="A test chart for API testing",
        query="SELECT * FROM test_table",
        natural_language_query="Show me test data",
        provider="flipside",
        data={"values": [{"x": 1, "y": 10}, {"x": 2, "y": 20}]},
        vega_spec={
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "mark": "bar",
            "encoding": {
                "x": {"field": "x", "type": "quantitative"},
                "y": {"field": "y", "type": "quantitative"}
            }
        },
        is_public=True,
        user_id=test_user.id
    )
    
    db_session.add(chart)
    await db_session.commit()
    await db_session.refresh(chart)
    
    return chart


@pytest.mark.asyncio
async def test_create_chart(
    client: AsyncClient, 
    test_app: FastAPI, 
    auth_headers: dict
):
    """Test creating a new chart."""
    # Chart data
    chart_data = {
        "title": "New Test Chart",
        "description": "A newly created test chart",
        "query": "SELECT * FROM new_test_table",
        "natural_language_query": "Show me new test data",
        "provider": "flipside",
        "data": {"values": [{"x": 1, "y": 30}, {"x": 2, "y": 40}]},
        "vega_spec": {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "mark": "line",
            "encoding": {
                "x": {"field": "x", "type": "quantitative"},
                "y": {"field": "y", "type": "quantitative"}
            }
        },
        "is_public": False
    }
    
    # Make request
    response = await client.post(
        f"{test_app.url_path_for('create_chart')}",
        json=chart_data,
        headers=auth_headers
    )
    
    # Assertions
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == chart_data["title"]
    assert data["description"] == chart_data["description"]
    assert data["query"] == chart_data["query"]
    assert data["is_public"] == chart_data["is_public"]
    assert "user_id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_get_charts(
    client: AsyncClient, 
    test_app: FastAPI, 
    auth_headers: dict, 
    test_chart: Chart
):
    """Test getting all user charts."""
    # Make request
    response = await client.get(
        f"{test_app.url_path_for('read_charts')}",
        headers=auth_headers
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    
    # Check if test_chart is in the response
    found = False
    for chart in data:
        if chart["id"] == test_chart.id:
            found = True
            assert chart["title"] == test_chart.title
            break
    
    assert found, "Test chart was not found in the response"


@pytest.mark.asyncio
async def test_get_chart(
    client: AsyncClient, 
    test_app: FastAPI, 
    auth_headers: dict, 
    test_chart: Chart
):
    """Test getting a specific chart."""
    # Make request
    response = await client.get(
        f"{test_app.url_path_for('read_chart', chart_id=test_chart.id)}",
        headers=auth_headers
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_chart.id
    assert data["title"] == test_chart.title
    assert data["description"] == test_chart.description
    assert data["query"] == test_chart.query


@pytest.mark.asyncio
async def test_update_chart(
    client: AsyncClient, 
    test_app: FastAPI, 
    auth_headers: dict, 
    test_chart: Chart
):
    """Test updating a chart."""
    # Update data
    update_data = {
        "title": "Updated Test Chart",
        "description": "An updated test chart description"
    }
    
    # Make request
    response = await client.put(
        f"{test_app.url_path_for('update_chart', chart_id=test_chart.id)}",
        json=update_data,
        headers=auth_headers
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_chart.id
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    # Other fields should remain unchanged
    assert data["query"] == test_chart.query


@pytest.mark.asyncio
async def test_delete_chart(
    client: AsyncClient, 
    test_app: FastAPI, 
    auth_headers: dict, 
    test_chart: Chart
):
    """Test deleting a chart."""
    # Make delete request
    response = await client.delete(
        f"{test_app.url_path_for('delete_chart', chart_id=test_chart.id)}",
        headers=auth_headers
    )
    
    # Assertions
    assert response.status_code == 204
    
    # Verify chart is deleted
    get_response = await client.get(
        f"{test_app.url_path_for('read_chart', chart_id=test_chart.id)}",
        headers=auth_headers
    )
    
    assert get_response.status_code == 404