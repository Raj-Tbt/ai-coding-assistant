import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.models.user_settings import UserSettings
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse


async def register_user(db: AsyncSession, data: RegisterRequest) -> AuthResponse:
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)

    # Create default settings for the user
    settings_obj = UserSettings(id=uuid.uuid4(), user_id=user.id)
    db.add(settings_obj)

    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


async def authenticate_user(db: AsyncSession, data: LoginRequest) -> AuthResponse:
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    return result.scalar_one_or_none()
