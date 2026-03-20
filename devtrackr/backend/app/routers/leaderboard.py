from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.log import Log
from app.models.skill import Skill

router = APIRouter()


@router.get("/")
async def get_leaderboard(
    category: str = "xp",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return top 50 users sorted by category: xp | streak | consistency"""
    if category == "streak":
        order_col = desc(User.streak)
    elif category == "longest_streak":
        order_col = desc(User.longest_streak)
    else:
        order_col = desc(User.xp)

    result = await db.execute(
        select(User).where(User.is_active == True).order_by(order_col).limit(50)
    )
    users = result.scalars().all()

    # Count total logs per user for the activity column
    log_counts = {}
    lc_result = await db.execute(
        select(Log.user_id, func.count(Log.id).label("cnt")).group_by(Log.user_id)
    )
    for row in lc_result.fetchall():
        log_counts[str(row.user_id)] = row.cnt

    leaders = []
    for rank, user in enumerate(users, 1):
        leaders.append(
            {
                "rank": rank,
                "id": str(user.id),
                "name": user.name,
                "avatar_url": user.avatar_url or "",
                "location": user.location or "",
                "xp": user.xp,
                "level": user.level,
                "streak": user.streak,
                "longest_streak": user.longest_streak,
                "total_logs": log_counts.get(str(user.id), 0),
                "is_me": str(user.id) == str(current_user.id),
                "is_public": user.is_public,
            }
        )

    # Also find current user rank even if outside top 50
    my_rank = next((l["rank"] for l in leaders if l["is_me"]), None)

    return {"leaders": leaders, "total": len(leaders), "my_rank": my_rank}
