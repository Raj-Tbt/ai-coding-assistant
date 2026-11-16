import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from fastapi import HTTPException, status
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse


async def create_conversation(db: AsyncSession, user_id: uuid.UUID, data: ConversationCreate) -> Conversation:
    conv = Conversation(id=uuid.uuid4(), user_id=user_id, title=data.title or "New Chat")
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv


async def get_conversations(db: AsyncSession, user_id: uuid.UUID, search: str | None = None) -> list[Conversation]:
    query = select(Conversation).where(Conversation.user_id == user_id).order_by(desc(Conversation.updated_at))
    if search:
        query = query.where(Conversation.title.ilike(f"%{search}%"))
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_conversation(db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID) -> Conversation:
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conv


async def update_conversation(db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID, data: ConversationUpdate) -> Conversation:
    conv = await get_conversation(db, conversation_id, user_id)
    conv.title = data.title
    await db.commit()
    await db.refresh(conv)
    return conv


async def delete_conversation(db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID) -> None:
    conv = await get_conversation(db, conversation_id, user_id)
    await db.delete(conv)
    await db.commit()
