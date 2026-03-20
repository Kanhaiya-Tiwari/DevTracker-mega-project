from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid, enum
from datetime import datetime

class QualityEnum(str, enum.Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

class Log(Base):
    __tablename__ = "logs"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    skill_id   = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    hours      = Column(Float, nullable=False)
    quality    = Column(Enum(QualityEnum), default=QualityEnum.medium)
    notes      = Column(String(1000), nullable=True)
    xp_earned  = Column(Integer, default=0)
    log_date   = Column(DateTime, default=datetime.utcnow, index=True)
    hour_of_day = Column(Integer, nullable=True)  # 0-23, for peak time detection

    user  = relationship("User",  back_populates="logs")
    skill = relationship("Skill", back_populates="logs")