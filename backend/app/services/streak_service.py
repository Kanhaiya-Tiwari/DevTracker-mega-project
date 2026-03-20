from datetime import datetime, timedelta


def calculate_new_streak(last_log_date: datetime | None, current_streak: int) -> int:
    today = datetime.utcnow().date()
    if last_log_date is None:
        return 1

    last_date = last_log_date.date()
    if last_date == today:
        return current_streak
    if last_date == today - timedelta(days=1):
        return current_streak + 1
    return 1
