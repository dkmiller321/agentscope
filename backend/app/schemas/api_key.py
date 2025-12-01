from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ApiKeyCreate(BaseModel):
    """Schema for API key creation"""
    name: str | None = None


class ApiKeyResponse(BaseModel):
    """Schema for API key response (without full key)"""
    id: UUID
    project_id: UUID
    key_prefix: str
    name: str | None
    last_used_at: datetime | None
    created_at: datetime
    revoked_at: datetime | None

    class Config:
        from_attributes = True


class ApiKeyCreateResponse(BaseModel):
    """Schema for API key creation response (includes full key once)"""
    id: UUID
    project_id: UUID
    key: str  # Full API key - only returned once
    key_prefix: str
    name: str | None
    created_at: datetime

    class Config:
        from_attributes = True
