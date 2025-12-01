from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any, Literal


class McpToolCreate(BaseModel):
    """Schema for MCP tool creation"""
    tool_name: str
    description: str | None = None
    input_schema: dict[str, Any] | None = None
    server_name: str | None = None


class McpToolResponse(BaseModel):
    """Schema for MCP tool response"""
    id: UUID
    project_id: UUID
    tool_name: str
    description: str | None
    input_schema: dict[str, Any] | None
    server_name: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class McpLogCreate(BaseModel):
    """Schema for MCP log creation"""
    run_id: UUID | None = None
    tool_id: UUID | None = None
    log_type: Literal["call", "response", "error"]
    request: dict[str, Any] | None = None
    response: dict[str, Any] | None = None
    error: dict[str, Any] | None = None
    latency_ms: int | None = None


class McpLogResponse(BaseModel):
    """Schema for MCP log response"""
    id: UUID
    project_id: UUID
    run_id: UUID | None
    tool_id: UUID | None
    log_type: str
    request: dict[str, Any] | None
    response: dict[str, Any] | None
    error: dict[str, Any] | None
    latency_ms: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class McpStatsResponse(BaseModel):
    """Schema for MCP statistics response"""
    total_calls: int
    error_rate: float
    avg_latency_ms: float | None
    most_used_tools: list[dict[str, Any]]
