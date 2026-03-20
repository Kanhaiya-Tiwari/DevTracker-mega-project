from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.skill import SkillCreate, SkillRead
from app.models.skill import Skill
from app.repositories.skill_repo import get_skills_for_user, get_skill, create_skill, update_skill
from app.dependencies import get_db, get_current_user

router = APIRouter()


def _to_naive_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


@router.get("/", response_model=list[SkillRead])
async def list_skills(current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_skills_for_user(db, str(current_user.id))


@router.post("/", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
async def create_new_skill(skill_in: SkillCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    skill = Skill(
        user_id=current_user.id,
        name=skill_in.name,
        icon=skill_in.icon,
        total_hours=skill_in.total_hours,
        daily_target=skill_in.daily_target,
        deadline=_to_naive_utc(skill_in.deadline),
        difficulty=skill_in.difficulty,
        phases=[p.dict() for p in skill_in.phases],
    )
    return await create_skill(db, skill)


@router.get("/{skill_id}", response_model=SkillRead)
async def get_skill_by_id(skill_id: str, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    skill = await get_skill(db, skill_id)
    if not skill or str(skill.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return skill


@router.patch("/{skill_id}", response_model=SkillRead)
async def update_skill_by_id(skill_id: str, skill_in: SkillCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    skill = await get_skill(db, skill_id)
    if not skill or str(skill.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    skill.name = skill_in.name
    skill.icon = skill_in.icon
    skill.total_hours = skill_in.total_hours
    skill.daily_target = skill_in.daily_target
    skill.deadline = _to_naive_utc(skill_in.deadline)
    skill.difficulty = skill_in.difficulty
    skill.phases = [p.dict() for p in skill_in.phases]
    return await update_skill(db, skill)
