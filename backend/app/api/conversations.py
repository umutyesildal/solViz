from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, get_db
from app.models.models import ConversationThread, ConversationMessage, User
from app.schemas.schemas import (
    ConversationThread as ConversationThreadSchema,
    ConversationThreadCreate,
    ConversationThreadUpdate,
    ConversationMessage as ConversationMessageSchema
)

router = APIRouter()


@router.get("/", response_model=List[ConversationThreadSchema])
def read_conversation_threads(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve conversation threads for the current user.
    """
    threads = (
        db.query(ConversationThread)
        .filter(ConversationThread.user_id == current_user.id)
        .order_by(ConversationThread.last_activity_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return threads


@router.get("/{thread_id}", response_model=ConversationThreadSchema)
def read_conversation_thread(
    *,
    db: Session = Depends(get_db),
    thread_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific conversation thread by ID.
    """
    thread = (
        db.query(ConversationThread)
        .filter(ConversationThread.thread_id == thread_id)
        .first()
    )
    
    if not thread:
        raise HTTPException(status_code=404, detail="Conversation thread not found")
    
    if thread.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return thread


@router.post("/", response_model=ConversationThreadSchema)
def create_conversation_thread(
    *,
    db: Session = Depends(get_db),
    thread_in: ConversationThreadCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new conversation thread.
    """
    # Check if this thread already exists
    existing_thread = (
        db.query(ConversationThread)
        .filter(ConversationThread.thread_id == thread_in.thread_id)
        .first()
    )
    
    if existing_thread:
        return existing_thread
    
    thread = ConversationThread(
        user_id=current_user.id,
        thread_id=thread_in.thread_id,
        title=thread_in.title or f"Conversation {thread_in.thread_id[:8]}",
    )
    
    db.add(thread)
    db.commit()
    db.refresh(thread)
    
    return thread


@router.put("/{thread_id}", response_model=ConversationThreadSchema)
def update_conversation_thread(
    *,
    db: Session = Depends(get_db),
    thread_id: str,
    thread_in: ConversationThreadUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a conversation thread.
    """
    thread = (
        db.query(ConversationThread)
        .filter(ConversationThread.thread_id == thread_id)
        .first()
    )
    
    if not thread:
        raise HTTPException(status_code=404, detail="Conversation thread not found")
    
    if thread.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update fields
    if thread_in.title is not None:
        thread.title = thread_in.title
    
    db.add(thread)
    db.commit()
    db.refresh(thread)
    
    return thread


@router.delete("/{thread_id}", response_model=ConversationThreadSchema)
def delete_conversation_thread(
    *,
    db: Session = Depends(get_db),
    thread_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a conversation thread.
    """
    thread = (
        db.query(ConversationThread)
        .filter(ConversationThread.thread_id == thread_id)
        .first()
    )
    
    if not thread:
        raise HTTPException(status_code=404, detail="Conversation thread not found")
    
    if thread.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(thread)
    db.commit()
    
    return thread


@router.get("/{thread_id}/messages", response_model=List[ConversationMessageSchema])
def read_conversation_messages(
    *,
    db: Session = Depends(get_db),
    thread_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all messages for a conversation thread.
    """
    thread = (
        db.query(ConversationThread)
        .filter(ConversationThread.thread_id == thread_id)
        .first()
    )
    
    if not thread:
        raise HTTPException(status_code=404, detail="Conversation thread not found")
    
    if thread.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    messages = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.thread_id == thread_id)
        .order_by(ConversationMessage.created_at)
        .all()
    )
    
    return messages
