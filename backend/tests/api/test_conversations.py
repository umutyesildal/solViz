"""
Tests for the conversations API endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.models.models import ConversationThread, ConversationMessage, User
from app.tests.utils.users import create_test_user


@pytest.fixture
def conversation_thread(db, test_user):
    """Create a test conversation thread"""
    conversation_thread = ConversationThread(
        user_id=test_user.id,
        thread_id="test-thread-id-1",
        title="Test Conversation"
    )
    db.add(conversation_thread)
    db.commit()
    db.refresh(conversation_thread)
    
    # Add a couple of messages
    messages = [
        ConversationMessage(
            thread_id="test-thread-id-1",
            role="user",
            content="What was the volume on Solana yesterday?"
        ),
        ConversationMessage(
            thread_id="test-thread-id-1",
            role="assistant",
            content="Based on the data from Flipside, the Solana network had X transactions with a volume of Y SOL yesterday."
        )
    ]
    db.add_all(messages)
    db.commit()
    
    return conversation_thread


def test_get_conversations(client, superuser_token_headers, conversation_thread):
    """Test getting conversations for current user"""
    response = client.get(
        f"{settings.API_V1_STR}/conversations/",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["thread_id"] == conversation_thread.thread_id
    assert data[0]["title"] == conversation_thread.title


def test_get_conversation(client, superuser_token_headers, conversation_thread):
    """Test getting a specific conversation thread"""
    response = client.get(
        f"{settings.API_V1_STR}/conversations/{conversation_thread.thread_id}",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["thread_id"] == conversation_thread.thread_id
    assert data["title"] == conversation_thread.title


def test_update_conversation(client, superuser_token_headers, conversation_thread):
    """Test updating a conversation thread title"""
    response = client.put(
        f"{settings.API_V1_STR}/conversations/{conversation_thread.thread_id}",
        headers=superuser_token_headers,
        json={"title": "Updated Title"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["thread_id"] == conversation_thread.thread_id
    assert data["title"] == "Updated Title"


def test_delete_conversation(client, db, superuser_token_headers, conversation_thread):
    """Test deleting a conversation thread"""
    response = client.delete(
        f"{settings.API_V1_STR}/conversations/{conversation_thread.thread_id}",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    
    # Verify it's deleted from database
    db_thread = db.query(ConversationThread).filter(
        ConversationThread.thread_id == conversation_thread.thread_id
    ).first()
    assert db_thread is None
    
    # Verify messages are also deleted
    messages = db.query(ConversationMessage).filter(
        ConversationMessage.thread_id == conversation_thread.thread_id
    ).all()
    assert len(messages) == 0


def test_get_conversation_messages(client, superuser_token_headers, conversation_thread):
    """Test getting messages for a conversation thread"""
    response = client.get(
        f"{settings.API_V1_STR}/conversations/{conversation_thread.thread_id}/messages",
        headers=superuser_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Check order (should be chronological)
    assert data[0]["role"] == "user"
    assert data[1]["role"] == "assistant"
