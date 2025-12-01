from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any, Literal


class TestCreate(BaseModel):
    """Schema for test creation"""
    name: str
    description: str | None = None
    test_type: Literal["assertion", "comparison", "custom"]
    config: dict[str, Any]
    enabled: bool = True


class TestUpdate(BaseModel):
    """Schema for test update"""
    name: str | None = None
    description: str | None = None
    test_type: Literal["assertion", "comparison", "custom"] | None = None
    config: dict[str, Any] | None = None
    enabled: bool | None = None


class TestResponse(BaseModel):
    """Schema for test response"""
    id: UUID
    project_id: UUID
    name: str
    description: str | None
    test_type: str
    config: dict[str, Any]
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
