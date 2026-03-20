from sqlalchemy import Column, String, Float, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime


class Insight(Base):
    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    completion_probability = Column(Float, default=0.0)
    completion_verdict = Column(String(50), default="at_risk")
    coach_message = Column(String(1024), default="")
    behavior_pattern = Column(String(100), default="")
    immediate_action = Column(String(256), default="")
    motivational_charge = Column(String(128), default="")
    weekly_plan = Column(JSON, default=list)
    risk_factors = Column(JSON, default=list)
    burnout_detected = Column(Boolean, default=False)
    consistency_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="insights")
