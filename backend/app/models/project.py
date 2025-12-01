from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="projects")
    api_keys = relationship("ApiKey", back_populates="project", cascade="all, delete-orphan")
    runs = relationship("Run", back_populates="project", cascade="all, delete-orphan")
    tests = relationship("Test", back_populates="project", cascade="all, delete-orphan")
    breakpoints = relationship("Breakpoint", back_populates="project", cascade="all, delete-orphan")
    mcp_tools = relationship("McpTool", back_populates="project", cascade="all, delete-orphan")
    mcp_logs = relationship("McpLog", back_populates="project", cascade="all, delete-orphan")
