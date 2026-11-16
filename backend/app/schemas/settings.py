from pydantic import BaseModel
from typing import Optional, Literal


class SettingsResponse(BaseModel):
    theme: Literal["light", "dark", "system"]
    preferred_language: str

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    theme: Optional[Literal["light", "dark", "system"]] = None
    preferred_language: Optional[str] = None
