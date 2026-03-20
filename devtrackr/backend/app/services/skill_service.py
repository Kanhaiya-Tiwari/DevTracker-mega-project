from datetime import datetime
from typing import Optional

from app.models.skill import Skill


def is_overdue(skill: Skill) -> bool:
    return datetime.utcnow() > skill.deadline


def progress_pct(skill: Skill) -> float:
    if skill.total_hours <= 0:
        return 0.0
    return min(100.0, (skill.completed_hours / skill.total_hours) * 100)


def remaining_hours(skill: Skill) -> float:
    return max(0.0, skill.total_hours - skill.completed_hours)


def update_skill_progress(skill: Skill, hours: float) -> Skill:
    skill.completed_hours = min(skill.total_hours, skill.completed_hours + hours)
    return skill


def should_mark_complete(skill: Skill) -> bool:
    return skill.completed_hours >= skill.total_hours
