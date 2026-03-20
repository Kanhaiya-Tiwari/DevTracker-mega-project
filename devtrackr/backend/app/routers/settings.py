from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter()


class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    github_url: Optional[str] = None
    avatar_url: Optional[str] = None
    is_public: Optional[bool] = None


@router.get("/")
async def get_settings(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "bio": current_user.bio or "",
        "location": current_user.location or "",
        "github_url": current_user.github_url or "",
        "avatar_url": current_user.avatar_url or "",
        "is_public": current_user.is_public if current_user.is_public is not None else True,
        "xp": current_user.xp,
        "level": current_user.level,
        "streak": current_user.streak,
        "longest_streak": current_user.longest_streak,
        "created_at": str(current_user.created_at),
    }


@router.put("/")
async def update_settings(
    body: SettingsUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for key, val in body.model_dump(exclude_none=True).items():
        setattr(current_user, key, val)
    await db.commit()
    await db.refresh(current_user)
    return {"success": True, "message": "Settings updated successfully"}
