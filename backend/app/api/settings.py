from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services.settings_service import get_or_create_settings, update_settings

router = APIRouter()


@router.get("/", response_model=SettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_or_create_settings(db, current_user.id)


@router.patch("/", response_model=SettingsResponse)
async def patch_settings(
    data: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_settings(db, current_user.id, data)
