from datetime import datetime
from typing import Any, List
from uuid import UUID

from pydantic import BaseModel


class InsightRead(BaseModel):
    id: UUID
    completion_probability: float
    completion_verdict: str
    coach_message: str
    behavior_pattern: str
    immediate_action: str
    motivational_charge: str
    weekly_plan: List[Any]
    risk_factors: List[str]
    created_at: datetime

    class Config:
        orm_mode = True
