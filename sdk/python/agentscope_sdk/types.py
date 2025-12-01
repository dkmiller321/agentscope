"""Type definitions for AgentScope SDK."""
from typing import Any, Dict, Optional, Literal
from datetime import datetime
from dataclasses import dataclass

# Type aliases
JSONDict = Dict[str, Any]
StepType = Literal["llm_call", "tool_call", "reasoning", "other"]
RunStatus = Literal["running", "completed", "failed"]


@dataclass
class RunConfig:
    """Configuration for a run."""
    external_id: Optional[str] = None
    agent_name: str = "unknown"
    input: Optional[JSONDict] = None
    meta_data: Optional[JSONDict] = None


@dataclass
class StepConfig:
    """Configuration for a step."""
    step_type: StepType = "other"
    name: str = "step"
    input: Optional[JSONDict] = None
    output: Optional[JSONDict] = None
    meta_data: Optional[JSONDict] = None
    error: Optional[JSONDict] = None
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


@dataclass
class RunResponse:
    """Response from creating a run."""
    id: str
    project_id: str
    external_id: Optional[str]
    agent_name: str
    status: str
    started_at: datetime
    created_at: datetime
