from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.repositories.log_repo import get_logs_for_user
from app.repositories.skill_repo import get_skills_for_user
from app.services.progress_engine import detect_peak_hour, consistency_score

router = APIRouter()


@router.get("/overview")
async def overview(current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    skills = await get_skills_for_user(db, str(current_user.id))
    logs = await get_logs_for_user(db, str(current_user.id))
    peak_hour = detect_peak_hour([{"hour_of_day": l.hour_of_day, "hours": l.hours} for l in logs])
    return {
        "total_skills": len(skills),
        "total_logs": len(logs),
        "peak_hour": peak_hour,
        "consistency": consistency_score([{"skill_id": l.skill_id, "log_date": l.log_date, "hours": l.hours} for l in logs], skills[0].id if skills else "", 14) if skills else 0,
    }
