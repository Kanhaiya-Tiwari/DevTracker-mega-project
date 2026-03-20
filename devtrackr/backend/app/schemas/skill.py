from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel


class Phase(BaseModel):
    name: str
    hours: float
    topics: List[str]


class SkillBase(BaseModel):
    name: str
    icon: Optional[str] = "⚡"
    total_hours: float
    daily_target: float
    deadline: datetime
    difficulty: Optional[str] = "medium"
    phases: List[Phase] = []


class SkillCreate(SkillBase):
    pass


class SkillRead(SkillBase):
    id: UUID
    completed_hours: float
    started_at: datetime
    roadmap: Optional[Any]

    class Config:
        orm_mode = True
