import pytest
from httpx import AsyncClient
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.models import User
from app.schemas.schemas import UserCreate, Token


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, test_app: FastAPI, db_session: AsyncSession):
    """Test user registration endpoint."""
    # Test data
    user_data = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    
    # Make request
    response = await client.post(
        f"{test_app.url_path_for('register_user')}",
        json=user_data
    )
    
    # Assertions
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == user_data["email"]
    assert data["full_name"] == user_data["full_name"]
    assert "password" not in data  # Password should not be returned


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, test_app: FastAPI, db_session: AsyncSession):
    """Test user login endpoint."""
    # Create a test user first
    user_create = UserCreate(
        email="login_test@example.com",
        password="password123",
        full_name="Login Test User"
    )
    
    # Create the user in the database
    user = User(
        email=user_create.email,
        full_name=user_create.full_name
    )
    user.set_password(user_create.password)
    
    db_session.add(user)
    await db_session.commit()
    
    # Login data
    login_data = {
        "username": user_create.email,  # API uses username field for email
        "password": user_create.password
    }
    
    # Make login request
    response = await client.post(
        f"{test_app.url_path_for('login_for_access_token')}",
        data=login_data,  # Note: login uses form data, not JSON
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Assertions
    assert response.status_code == 200
    token = response.json()
    assert "access_token" in token
    assert token["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_with_invalid_credentials(client: AsyncClient, test_app: FastAPI):
    """Test login with invalid credentials."""
    # Invalid login data
    login_data = {
        "username": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    
    # Make login request
    response = await client.post(
        f"{test_app.url_path_for('login_for_access_token')}",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Assertions
    assert response.status_code == 401
    assert "detail" in response.json()
    assert response.json()["detail"] == "Incorrect email or password"


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, test_app: FastAPI, db_session: AsyncSession):
    """Test getting current user with valid token."""
    # Create a test user
    user = User(
        email="current_user@example.com",
        full_name="Current User Test"
    )
    user.set_password("password123")
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    # Create a token for the user
    access_token = create_access_token(data={"sub": user.email})
    
    # Make request with token
    response = await client.get(
        f"{test_app.url_path_for('get_current_user')}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    # Assertions
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == user.email
    assert user_data["full_name"] == user.full_name
    assert "id" in user_data
    assert "password" not in user_data