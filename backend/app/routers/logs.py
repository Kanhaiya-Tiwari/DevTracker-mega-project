from datetime import datetime, date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.log import LogCreate, LogRead
from app.models.log import Log
from app.models.xp import XPLog
from app.repositories.log_repo import (
    get_logs_for_skill,
    get_logs_for_skill_by_date,
    get_skill_log_dates,
)
from app.repositories.skill_repo import get_skill
from app.dependencies import get_db, get_current_user
from app.services.gamification import xp_for_log, level_from_xp
from app.services.streak_service import calculate_new_streak

router = APIRouter()


@router.post("/", response_model=LogRead, status_code=status.HTTP_201_CREATED)
async def add_log(entry: LogCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()

    # Calculate streak
    new_streak = calculate_new_streak(current_user.last_log_date, current_user.streak)

    # Calculate XP
    xp = xp_for_log(entry.hours, new_streak, entry.quality)

    # Create the log
    log = Log(
        user_id=current_user.id,
        skill_id=entry.skill_id,
        hours=entry.hours,
        quality=entry.quality,
        notes=entry.notes,
        xp_earned=xp,
        log_date=now,
        hour_of_day=now.hour,
    )
    db.add(log)

    # Update user stats
    current_user.xp = (current_user.xp or 0) + xp
    current_user.level = level_from_xp(current_user.xp)
    current_user.streak = new_streak
    current_user.longest_streak = max(current_user.longest_streak or 0, new_streak)
    current_user.last_log_date = now

    # Update skill completed_hours
    skill = await get_skill(db, str(entry.skill_id))
    if skill:
        skill.completed_hours = (skill.completed_hours or 0) + entry.hours
        db.add(skill)

    # Create XP audit log
    xp_log = XPLog(
        user_id=current_user.id,
        skill_id=entry.skill_id,
        xp=xp,
        reason=f"Logged {entry.hours}h ({entry.quality}) – streak {new_streak}",
    )
    db.add(xp_log)

    await db.commit()
    await db.refresh(log)
    return log


@router.get("/skill/{skill_id}", response_model=list[LogRead])
async def logs_for_skill(skill_id: str, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_logs_for_skill(db, skill_id)


@router.get("/skill/{skill_id}/dates", response_model=list[date])
async def skill_log_dates(skill_id: str, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return distinct dates on which sessions were logged for this skill."""
    return await get_skill_log_dates(db, skill_id)


@router.get("/skill/{skill_id}/by-date", response_model=list[LogRead])
async def logs_for_skill_by_date(
    skill_id: str,
    d: date = Query(..., description="Date to filter logs (YYYY-MM-DD)"),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all sessions for a skill on a specific date."""
    return await get_logs_for_skill_by_date(db, skill_id, d)
