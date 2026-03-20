from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.agent.agent import DevTrackrAgent
from app.agent.memory import AgentMemory
from app.repositories.skill_repo import get_skill

router = APIRouter()
agent = DevTrackrAgent(memory=AgentMemory())


@router.get("/{skill_id}")
async def get_insight(skill_id: str, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    skill = await get_skill(db, skill_id)
    if not skill or str(skill.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Skill not found")
    return await agent.analyze(str(current_user.id), skill_id, db)
