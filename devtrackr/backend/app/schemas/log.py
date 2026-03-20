from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class LogCreate(BaseModel):
    skill_id: UUID
    hours: float
    quality: str
    notes: Optional[str] = None


class LogRead(LogCreate):
    id: UUID
    xp_earned: int
    log_date: datetime
    hour_of_day: Optional[int]

    class Config:
        orm_mode = True
