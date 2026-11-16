import json
import uuid
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.message import ChatRequest
from app.schemas.conversation import ConversationCreate
from app.services import conversation_service, message_service
from app.ai import gemini_client

router = APIRouter()


@router.post("/stream")
async def chat_stream(
    data: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    async def event_generator():
        try:
            conversation_id = data.conversation_id

            # Create conversation if this is a new chat
            if not conversation_id:
                conv = await conversation_service.create_conversation(
                    db, current_user.id, ConversationCreate(title="New Chat")
                )
                conversation_id = conv.id
            else:
                # Verify ownership
                await conversation_service.get_conversation(db, conversation_id, current_user.id)

            # Remove last assistant message if regenerating
            if data.regenerate:
                await message_service.delete_last_assistant_message(db, conversation_id)
            else:
                # Save the user message
                await message_service.create_message(db, conversation_id, "user", data.message)

            # Signal the start, including conversation_id for new chats
            yield f"data: {json.dumps({'type': 'start', 'conversation_id': str(conversation_id)})}\n\n"

            # Fetch conversation history to build context
            history = await message_service.get_messages(db, conversation_id)
            messages = [{"role": msg.role, "content": msg.content} for msg in history]

            # Stream Gemini response
            full_response = ""
            async for chunk in gemini_client.generate_stream(messages):
                full_response += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"

            # Persist the complete assistant response
            saved_msg = await message_service.create_message(db, conversation_id, "assistant", full_response)

            # Auto-generate title on the first user message
            existing = await message_service.get_messages(db, conversation_id)
            user_messages = [m for m in existing if m.role == "user"]
            if len(user_messages) == 1:
                title = await gemini_client.generate_title(data.message)
                from app.schemas.conversation import ConversationUpdate
                await conversation_service.update_conversation(db, conversation_id, current_user.id, ConversationUpdate(title=title))

            yield f"data: {json.dumps({'type': 'done', 'message_id': str(saved_msg.id)})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
