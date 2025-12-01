from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class Run(Base):
    __tablename__ = "runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    external_id = Column(String(255))  # SDK-provided ID
    agent_name = Column(String(255))
    status = Column(String(50), default="running", nullable=False)  # running, completed, failed, paused
    input = Column(JSONB)
    output = Column(JSONB)
    meta_data = Column(JSONB)
    error = Column(JSONB)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="runs")
    steps = relationship("RunStep", back_populates="run", cascade="all, delete-orphan", order_by="RunStep.step_index")
    test_runs = relationship("TestRun", back_populates="run")
    mcp_logs = relationship("McpLog", back_populates="run")
