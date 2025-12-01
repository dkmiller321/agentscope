from sqlalchemy import Column, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class McpTool(Base):
    __tablename__ = "mcp_tools"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    tool_name = Column(String(255), nullable=False)
    description = Column(Text)
    input_schema = Column(JSONB)
    server_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="mcp_tools")
    logs = relationship("McpLog", back_populates="tool")

    # Unique constraint
    __table_args__ = (
        UniqueConstraint('project_id', 'tool_name', name='uq_project_tool'),
    )
