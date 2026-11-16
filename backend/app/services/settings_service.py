import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user_settings import UserSettings
from app.schemas.settings import SettingsUpdate


async def get_or_create_settings(db: AsyncSession, user_id: uuid.UUID) -> UserSettings:
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == user_id))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettings(id=uuid.uuid4(), user_id=user_id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings


async def update_settings(db: AsyncSession, user_id: uuid.UUID, data: SettingsUpdate) -> UserSettings:
    settings = await get_or_create_settings(db, user_id)
    if data.theme is not None:
        settings.theme = data.theme
    if data.preferred_language is not None:
        settings.preferred_language = data.preferred_language
    await db.commit()
    await db.refresh(settings)
    return settings
