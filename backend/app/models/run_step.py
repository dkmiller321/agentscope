from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class RunStep(Base):
    __tablename__ = "run_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False)
    step_index = Column(Integer, nullable=False)
    step_type = Column(String(50), nullable=False)  # llm_call, tool_call, retrieval, custom, error
    name = Column(String(255))
    input = Column(JSONB)
    output = Column(JSONB)
    meta_data = Column(JSONB)
    error = Column(JSONB)
    tokens_used = Column(Integer)
    latency_ms = Column(Integer)
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    run = relationship("Run", back_populates="steps")

    # Indexes
    __table_args__ = (
        Index('idx_run_steps_run_id', 'run_id'),
        Index('idx_run_steps_step_index', 'run_id', 'step_index'),
    )
