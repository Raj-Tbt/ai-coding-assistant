import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.message import Message


async def create_message(db: AsyncSession, conversation_id: uuid.UUID, role: str, content: str) -> Message:
    msg = Message(id=uuid.uuid4(), conversation_id=conversation_id, role=role, content=content)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_messages(db: AsyncSession, conversation_id: uuid.UUID) -> list[Message]:
    result = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)
    )
    return list(result.scalars().all())


async def delete_last_assistant_message(db: AsyncSession, conversation_id: uuid.UUID) -> None:
    """Remove the most recent assistant message, used when regenerating a response."""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id, Message.role == "assistant")
        .order_by(desc(Message.created_at))
        .limit(1)
    )
    msg = result.scalar_one_or_none()
    if msg:
        await db.delete(msg)
        await db.commit()
