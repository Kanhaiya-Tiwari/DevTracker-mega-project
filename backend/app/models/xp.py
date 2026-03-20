from sqlalchemy import Column, Integer, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime


class XPLog(Base):
    __tablename__ = "xp_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    skill_id = Column(UUID(as_uuid=True), nullable=True)
    xp = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
