from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email          = Column(String(255), unique=True, nullable=False, index=True)
    name           = Column(String(100), nullable=False)
    hashed_pw      = Column(String(255), nullable=False)
    xp             = Column(Integer, default=0)
    level          = Column(Integer, default=1)
    streak         = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_log_date  = Column(DateTime, nullable=True)
    is_active      = Column(Boolean, default=True)
    # Profile fields
    bio            = Column(String(500), nullable=True, default="")
    location       = Column(String(100), nullable=True, default="")
    github_url     = Column(String(255), nullable=True, default="")
    avatar_url     = Column(String(500), nullable=True, default="")
    is_public      = Column(Boolean, default=True)
    created_at     = Column(DateTime, default=datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skills   = relationship("Skill",   back_populates="user", cascade="all,delete")
    logs     = relationship("Log",     back_populates="user", cascade="all,delete")
    insights = relationship("Insight", back_populates="user", cascade="all,delete")