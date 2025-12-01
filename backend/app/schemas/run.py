from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any


class RunCreate(BaseModel):
    """Schema for run creation"""
    external_id: str | None = None
    agent_name: str
    input: dict[str, Any] | None = None
    meta_data: dict[str, Any] | None = None


class RunUpdate(BaseModel):
    """Schema for run update"""
    status: str | None = None
    output: dict[str, Any] | None = None
    error: dict[str, Any] | None = None
    ended_at: datetime | None = None


class RunResponse(BaseModel):
    """Schema for run response"""
    id: UUID
    project_id: UUID
    external_id: str | None
    agent_name: str
    status: str
    input: dict[str, Any] | None
    output: dict[str, Any] | None
    meta_data: dict[str, Any] | None
    error: dict[str, Any] | None
    started_at: datetime
    ended_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class RunListResponse(BaseModel):
    """Schema for run list response with step count"""
    id: UUID
    project_id: UUID
    external_id: str | None
    agent_name: str
    status: str
    started_at: datetime
    ended_at: datetime | None
    step_count: int
    duration_ms: int | None

    class Config:
        from_attributes = True


class RunTimelineResponse(BaseModel):
    """Schema for run timeline visualization data"""
    id: UUID
    agent_name: str
    status: str
    started_at: datetime
    ended_at: datetime | None
    steps: list[dict[str, Any]]
    total_duration_ms: int | None
    total_tokens: int | None
