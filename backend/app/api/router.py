from fastapi import APIRouter
from app.api import auth, conversations, chat, settings

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
router.include_router(chat.router, prefix="/chat", tags=["chat"])
router.include_router(settings.router, prefix="/settings", tags=["settings"])
