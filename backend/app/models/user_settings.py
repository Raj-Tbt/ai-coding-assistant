import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"
    __table_args__ = (
        CheckConstraint("theme IN ('light', 'dark', 'system')", name="ck_user_settings_theme"),
        UniqueConstraint("user_id", name="uq_user_settings_user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    theme: Mapped[str] = mapped_column(String(20), nullable=False, default="system")
    preferred_language: Mapped[str] = mapped_column(String(50), nullable=False, default="python")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="settings")
