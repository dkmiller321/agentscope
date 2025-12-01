from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any, Literal


class BreakpointCreate(BaseModel):
    """Schema for breakpoint creation"""
    name: str | None = None
    condition_type: Literal["step_type", "step_name", "custom"]
    condition_value: dict[str, Any]
    enabled: bool = True


class BreakpointUpdate(BaseModel):
    """Schema for breakpoint update"""
    name: str | None = None
    condition_type: Literal["step_type", "step_name", "custom"] | None = None
    condition_value: dict[str, Any] | None = None
    enabled: bool | None = None


class BreakpointResponse(BaseModel):
    """Schema for breakpoint response"""
    id: UUID
    project_id: UUID
    name: str | None
    condition_type: str
    condition_value: dict[str, Any]
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
