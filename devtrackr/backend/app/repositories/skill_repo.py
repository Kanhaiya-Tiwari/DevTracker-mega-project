from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.skill import Skill


async def get_skills_for_user(db: AsyncSession, user_id: str) -> list[Skill]:
    res = await db.execute(select(Skill).where(Skill.user_id == user_id).order_by(Skill.started_at.desc()))
    return res.scalars().all()


async def get_skill(db: AsyncSession, skill_id: str) -> Skill | None:
    res = await db.execute(select(Skill).where(Skill.id == skill_id))
    return res.scalar_one_or_none()


async def create_skill(db: AsyncSession, skill: Skill) -> Skill:
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill


async def update_skill(db: AsyncSession, skill: Skill) -> Skill:
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill
