from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.insight import Insight


async def get_insights_for_skill(db: AsyncSession, user_id: str, skill_id: str) -> list[Insight]:
    res = await db.execute(
        select(Insight)
        .where(Insight.user_id == user_id, Insight.skill_id == skill_id)
        .order_by(Insight.created_at.desc())
    )
    return res.scalars().all()


async def create_insight(db: AsyncSession, insight: Insight) -> Insight:
    db.add(insight)
    await db.commit()
    await db.refresh(insight)
    return insight
