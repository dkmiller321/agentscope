from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
    run_id = Column(UUID(as_uuid=True), ForeignKey("runs.id", ondelete="SET NULL"))
    status = Column(String(50), nullable=False)  # passed, failed, error, skipped
    result = Column(JSONB)
    error = Column(JSONB)
    duration_ms = Column(Integer)
    executed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    test = relationship("Test", back_populates="test_runs")
    run = relationship("Run", back_populates="test_runs")
