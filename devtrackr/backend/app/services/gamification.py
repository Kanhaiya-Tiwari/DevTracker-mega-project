def xp_for_log(hours: float, streak: int, quality: str) -> int:
    base = hours * 10
    multiplier = 1.0
    if streak >= 30:
        multiplier = 3.0
    elif streak >= 14:
        multiplier = 2.0
    elif streak >= 7:
        multiplier = 1.5

    quality_bonus = {"high": 1.5, "medium": 1.0, "low": 0.7}.get(quality, 1.0)
    return int(round(base * multiplier * quality_bonus))


def level_from_xp(xp: int) -> int:
    # Simple leveling curve: level n requires n*100 XP
    return max(1, int((xp ** 0.5) // 1))
