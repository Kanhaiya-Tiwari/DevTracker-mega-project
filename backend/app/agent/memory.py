"""
Agent Memory System.
Short-term: last 14 logs (in-context)
Long-term:  persisted insights in DB (queried at analysis time)
"""
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.log import Log
from app.models.skill import Skill
from app.models.user import User
from app.models.insight import Insight

class AgentMemory:
    async def build_context(self, user_id: str, skill_id: str, db: AsyncSession) -> dict:
        # Load user
        user = (await db.execute(select(User).where(User.id == user_id))).scalar_one()
        # Load skill
        skill = (await db.execute(select(Skill).where(Skill.id == skill_id))).scalar_one()
        # Short-term: last 14 logs
        cutoff = datetime.utcnow() - timedelta(days=14)
        logs_q = await db.execute(
            select(Log).where(Log.skill_id == skill_id, Log.log_date >= cutoff).order_by(Log.log_date.desc())
        )
        recent_logs = [{"hours": l.hours, "quality": l.quality, "date": l.log_date.isoformat(), "hour": l.hour_of_day} for l in logs_q.scalars()]
        # Long-term: last 5 insights
        ins_q = await db.execute(
            select(Insight).where(Insight.user_id == user_id, Insight.skill_id == skill_id).order_by(Insight.created_at.desc()).limit(5)
        )
        past_insights = [{"verdict": i.completion_verdict, "date": i.created_at.isoformat()} for i in ins_q.scalars()]

        avg_hours = sum(l["hours"] for l in recent_logs) / max(1, len(recent_logs))
        days_left = max(0, (skill.deadline - datetime.utcnow()).days)

        return {
            "user":            {"name": user.name, "streak": user.streak, "xp": user.xp, "level": user.level},
            "skill":           {"name": skill.name, "total_hours": skill.total_hours, "completed_hours": skill.completed_hours, "daily_target": skill.daily_target, "phases": skill.phases},
            "recent_logs":     recent_logs,
            "past_insights":   past_insights,
            "avg_actual":      round(avg_hours, 2),
            "days_to_deadline": days_left,
        }

    async def save_insight(self, user_id: str, skill_id: str, data: dict, db: AsyncSession):
        insight = Insight(
            user_id=user_id, skill_id=skill_id,
            completion_probability=data.get("completion_probability", 50),
            completion_verdict=data.get("completion_verdict", "at_risk"),
            coach_message=data.get("coach_message", ""),
            behavior_pattern=data.get("behavior_pattern", ""),
            immediate_action=data.get("immediate_action", ""),
            motivational_charge=data.get("motivational_charge", ""),
            weekly_plan=data.get("weekly_plan", []),
            risk_factors=data.get("risk_factors", []),
            burnout_detected=data.get("burnout_detected", False),
            consistency_score=data.get("consistency_score", 0),
        )
        db.add(insight)
        await db.commit()