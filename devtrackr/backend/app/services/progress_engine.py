"""
Math engine: progress, probability, streaks, consistency, burnout.
Pure functions — no side effects, fully testable.
"""
from datetime import datetime, timedelta
from typing import List
import math

def completion_probability(
    completed_hours: float,
    total_hours: float,
    daily_target: float,
    deadline: datetime,
    recent_logs: List[dict],  # last 14 days
) -> int:
    """
    Combines:
      - Coverage ratio: can you physically finish in time?
      - Consistency score: are you showing up?
    Returns 5..97 (never 0 or 100 — always uncertainty)
    """
    if not recent_logs:
        return 45

    avg_hours = sum(l["hours"] for l in recent_logs) / len(recent_logs)
    consistency = sum(1 for l in recent_logs if l["hours"] >= daily_target * 0.7) / len(recent_logs)
    days_left = max(1, (deadline - datetime.utcnow()).days)
    hours_left = max(0.1, total_hours - completed_hours)
    projected = avg_hours * days_left
    coverage = min(1.0, projected / hours_left)
    raw = coverage * 0.6 + consistency * 0.4
    return max(5, min(97, round(raw * 100)))

def consistency_score(logs: List[dict], skill_id: str, window_days: int = 14) -> int:
    cutoff = datetime.utcnow() - timedelta(days=window_days)
    relevant = [l for l in logs if l["skill_id"] == skill_id and l["log_date"] >= cutoff]
    return round((len(relevant) / window_days) * 100)

def streak_multiplier(streak: int) -> float:
    if streak >= 30: return 3.0
    if streak >= 14: return 2.0
    if streak >= 7:  return 1.5
    return 1.0

def xp_for_log(hours: float, streak: int, quality: str) -> int:
    base = hours * 10
    mult = streak_multiplier(streak)
    q_bonus = {"high": 1.5, "medium": 1.0, "low": 0.7}.get(quality, 1.0)
    return round(base * mult * q_bonus)

def detect_burnout(logs: List[dict], skill_id: str) -> bool:
    recent = [l for l in logs if l["skill_id"] == skill_id][-7:]
    if len(recent) < 4:
        return False
    avg_recent = sum(l["hours"] for l in recent[-3:]) / 3
    avg_prior  = sum(l["hours"] for l in recent[:4])  / 4
    return avg_prior > 0 and (avg_recent / avg_prior) < 0.5

def detect_peak_hour(logs: List[dict]) -> int | None:
    dist: dict[int, float] = {}
    for l in logs:
        h = l.get("hour_of_day")
        if h is not None:
            dist[h] = dist.get(h, 0) + l["hours"]
    return max(dist, key=dist.get) if dist else None

def calculate_new_streak(last_log_date: datetime | None, streak: int) -> int:
    today = datetime.utcnow().date()
    if last_log_date is None:
        return 1
    last = last_log_date.date()
    if last == today:
        return streak          # already logged today
    if last == today - timedelta(days=1):
        return streak + 1      # consecutive day
    return 1                   # streak broken