from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String(255), nullable=False)
    key_prefix = Column(String(12), nullable=False)  # First 8 chars for display
    name = Column(String(255))
    last_used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime)

    # Relationships
    project = relationship("Project", back_populates="api_keys")
