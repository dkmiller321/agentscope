from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class McpLog(Base):
    __tablename__ = "mcp_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    run_id = Column(UUID(as_uuid=True), ForeignKey("runs.id", ondelete="SET NULL"))
    tool_id = Column(UUID(as_uuid=True), ForeignKey("mcp_tools.id", ondelete="SET NULL"))
    log_type = Column(String(50), nullable=False)  # call, response, error
    request = Column(JSONB)
    response = Column(JSONB)
    error = Column(JSONB)
    latency_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="mcp_logs")
    run = relationship("Run", back_populates="mcp_logs")
    tool = relationship("McpTool", back_populates="logs")

    # Indexes
    __table_args__ = (
        Index('idx_mcp_logs_run_id', 'run_id'),
        Index('idx_mcp_logs_project_id', 'project_id'),
    )
