from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, cast, Date, func

from app.models.log import Log


async def create_log(db: AsyncSession, log: Log) -> Log:
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_logs_for_skill(db: AsyncSession, skill_id: str) -> list[Log]:
    res = await db.execute(select(Log).where(Log.skill_id == skill_id).order_by(Log.log_date.desc()))
    return res.scalars().all()


async def get_logs_for_user(db: AsyncSession, user_id: str) -> list[Log]:
    res = await db.execute(select(Log).where(Log.user_id == user_id).order_by(Log.log_date.desc()))
    return res.scalars().all()


async def get_logs_for_skill_by_date(db: AsyncSession, skill_id: str, target_date: date) -> list[Log]:
    res = await db.execute(
        select(Log)
        .where(Log.skill_id == skill_id, cast(Log.log_date, Date) == target_date)
        .order_by(Log.log_date.desc())
    )
    return res.scalars().all()


async def get_skill_log_dates(db: AsyncSession, skill_id: str) -> list[date]:
    res = await db.execute(
        select(cast(Log.log_date, Date).label("d"))
        .where(Log.skill_id == skill_id)
        .group_by("d")
        .order_by(func.max(Log.log_date).desc())
    )
    return [row[0] for row in res.all()]
