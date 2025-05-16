"""
Tests for the tags API endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.models.models import Tag, User, Chart
from app.tests.utils.users import create_test_user


@pytest.fixture
def tag(db, test_user):
    """Create a test tag"""
    tag = Tag(
        name="test-tag",
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@pytest.fixture
def chart_with_tag(db, test_user, tag):
    """Create a test chart with a tag"""
    chart = Chart(
        title="Test Chart with Tag",
        description="A test chart with a tag",
        query="SELECT * FROM test",
        natural_language_query="Show me test data",
        provider="flipside",
        data=[{"test": "data"}],
        vega_spec={"test": "spec"},
        is_public=False,
        user_id=test_user.id
    )
    db.add(chart)
    db.commit()
    
    # Associate tag with chart
    chart.tags.append(tag)
    db.commit()
    db.refresh(chart)
    
    return chart


def test_create_tag(client, superuser_token_headers):
    """Test creating a new tag"""
    response = client.post(
        f"{settings.API_V1_STR}/tags/",
        headers=superuser_token_headers,
        json={"name": "new-test-tag"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "new-test-tag"
    assert "id" in data


def test_get_tags(client, superuser_token_headers, tag):
    """Test getting all tags"""
    response = client.get(
        f"{settings.API_V1_STR}/tags/",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(t["name"] == "test-tag" for t in data)


def test_get_tag(client, superuser_token_headers, tag):
    """Test getting a specific tag"""
    response = client.get(
        f"{settings.API_V1_STR}/tags/{tag.id}",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == tag.name
    assert data["id"] == tag.id


def test_update_tag(client, superuser_token_headers, tag):
    """Test updating a tag name"""
    response = client.put(
        f"{settings.API_V1_STR}/tags/{tag.id}",
        headers=superuser_token_headers,
        json={"name": "updated-tag-name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "updated-tag-name"
    assert data["id"] == tag.id


def test_delete_tag(client, db, superuser_token_headers, tag):
    """Test deleting a tag"""
    response = client.delete(
        f"{settings.API_V1_STR}/tags/{tag.id}",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    
    # Verify it's deleted from database
    db_tag = db.query(Tag).filter(Tag.id == tag.id).first()
    assert db_tag is None


def test_filter_charts_by_tag(client, superuser_token_headers, chart_with_tag, tag):
    """Test filtering charts by tag"""
    response = client.get(
        f"{settings.API_V1_STR}/charts/?tag={tag.name}",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == "Test Chart with Tag"
    
    # Test with non-existent tag
    response = client.get(
        f"{settings.API_V1_STR}/charts/?tag=non-existent-tag",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0
