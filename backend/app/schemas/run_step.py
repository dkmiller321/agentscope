from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any, Literal


class RunStepCreate(BaseModel):
    """Schema for run step creation"""
    step_type: Literal["llm_call", "tool_call", "retrieval", "custom", "error"]
    name: str
    input: dict[str, Any] | None = None
    output: dict[str, Any] | None = None
    meta_data: dict[str, Any] | None = None
    error: dict[str, Any] | None = None
    tokens_used: int | None = None
    latency_ms: int | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None


class RunStepResponse(BaseModel):
    """Schema for run step response"""
    id: UUID
    run_id: UUID
    step_index: int
    step_type: str
    name: str
    input: dict[str, Any] | None
    output: dict[str, Any] | None
    meta_data: dict[str, Any] | None
    error: dict[str, Any] | None
    tokens_used: int | None
    latency_ms: int | None
    started_at: datetime | None
    ended_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
