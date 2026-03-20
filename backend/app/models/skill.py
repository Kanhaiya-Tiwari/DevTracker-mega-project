from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import enum
from datetime import datetime

class DifficultyEnum(str, enum.Enum):
    easy   = "easy"
    medium = "medium"
    hard   = "hard"

class Skill(Base):
    __tablename__ = "skills"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name            = Column(String(200), nullable=False)
    icon            = Column(String(10), default="⚡")
    total_hours     = Column(Float, nullable=False)
    completed_hours = Column(Float, default=0.0)
    daily_target    = Column(Float, nullable=False)
    deadline        = Column(DateTime, nullable=False)
    difficulty      = Column(Enum(DifficultyEnum), default=DifficultyEnum.medium)
    phases          = Column(JSON, default=list)   # [{name, hours, topics}]
    roadmap         = Column(JSON, nullable=True)  # AI-generated week plan
    started_at      = Column(DateTime, default=datetime.utcnow)
    completed_at    = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="skills")
    logs = relationship("Log", back_populates="skill", cascade="all,delete")