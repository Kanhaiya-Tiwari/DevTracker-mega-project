from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class LogCreate(BaseModel):
    skill_id: UUID
    hours: float
    quality: str
    notes: Optional[str] = None


class LogRead(BaseModel):
    id: str
    skill_id: str
    hours: float
    quality: str
    notes: Optional[str] = None
    xp_earned: int
    log_date: str
    hour_of_day: Optional[int]
    proof_of_work_required: bool = True

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=str(obj.id),
            skill_id=str(obj.skill_id),
            hours=obj.hours,
            quality=obj.quality,
            notes=obj.notes,
            xp_earned=obj.xp_earned,
            log_date=obj.log_date.isoformat() if obj.log_date else None,
            hour_of_day=obj.hour_of_day,
            proof_of_work_required=obj.proof_of_work_required
        )
