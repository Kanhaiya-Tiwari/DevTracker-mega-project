from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: UUID
    xp: int
    level: int
    streak: int
    longest_streak: int
    last_log_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        orm_mode = True
