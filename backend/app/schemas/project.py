from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ProjectCreate(BaseModel):
    """Schema for project creation"""
    name: str
    description: str | None = None


class ProjectUpdate(BaseModel):
    """Schema for project update"""
    name: str | None = None
    description: str | None = None


class ProjectResponse(BaseModel):
    """Schema for project response"""
    id: UUID
    user_id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectStats(BaseModel):
    """Schema for project statistics"""
    total_runs: int
    failed_runs: int
    avg_latency_ms: float | None
    test_pass_rate: float | None
    recent_runs: int
