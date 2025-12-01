from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any, Literal


class TestRunCreate(BaseModel):
    """Schema for test run creation"""
    test_id: UUID
    run_id: UUID | None = None
    status: Literal["passed", "failed", "error", "skipped"]
    result: dict[str, Any] | None = None
    error: dict[str, Any] | None = None
    duration_ms: int | None = None


class TestRunResponse(BaseModel):
    """Schema for test run response"""
    id: UUID
    test_id: UUID
    run_id: UUID | None
    status: str
    result: dict[str, Any] | None
    error: dict[str, Any] | None
    duration_ms: int | None
    executed_at: datetime

    class Config:
        from_attributes = True
