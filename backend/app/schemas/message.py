from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal
import uuid


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    conversation_id: Optional[uuid.UUID] = None
    message: str
    regenerate: bool = False
