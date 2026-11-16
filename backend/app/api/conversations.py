from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse
from app.schemas.message import MessageResponse
from app.services import conversation_service, message_service

router = APIRouter()


@router.get("/", response_model=list[ConversationResponse])
async def list_conversations(
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await conversation_service.get_conversations(db, current_user.id, search)


@router.post("/", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    data: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await conversation_service.create_conversation(db, current_user.id, data)


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await conversation_service.get_conversation(db, conversation_id, current_user.id)


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: uuid.UUID,
    data: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await conversation_service.update_conversation(db, conversation_id, current_user.id, data)


@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await conversation_service.delete_conversation(db, conversation_id, current_user.id)


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify ownership before returning messages
    await conversation_service.get_conversation(db, conversation_id, current_user.id)
    return await message_service.get_messages(db, conversation_id)
