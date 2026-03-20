"""Behavior-focused heuristics used by the DevTrackr agent."""

from __future__ import annotations


class BehavioralEngine:
	def consistency(self, ctx: dict, window_days: int = 14) -> int:
		logs = ctx.get("recent_logs", [])
		if not logs:
			return 0
		return min(100, round((len(logs) / max(1, window_days)) * 100))

	def detect_burnout(self, ctx: dict) -> bool:
		logs = ctx.get("recent_logs", [])
		if len(logs) < 4:
			return False

		recent = logs[:3]
		prior = logs[3:7]
		if len(prior) < 2:
			return False

		avg_recent = sum(entry.get("hours", 0) for entry in recent) / max(1, len(recent))
		avg_prior = sum(entry.get("hours", 0) for entry in prior) / max(1, len(prior))
		return avg_prior > 0 and (avg_recent / avg_prior) < 0.5

	def classify_pattern(self, ctx: dict) -> str:
		logs = ctx.get("recent_logs", [])
		if not logs:
			return "Unstarted"

		consistency = self.consistency(ctx)
		avg_actual = ctx.get("avg_actual", 0)
		target = ctx.get("skill", {}).get("daily_target", 0)
		burnout = self.detect_burnout(ctx)

		weekend_hours = 0.0
		weekday_hours = 0.0
		weekend_sessions = 0
		weekday_sessions = 0

		for entry in logs:
			date_value = entry.get("date", "")
			try:
				weekday = date_value[:10]
				from datetime import datetime
				day_index = datetime.fromisoformat(weekday).weekday()
			except Exception:
				day_index = 0

			if day_index >= 5:
				weekend_hours += entry.get("hours", 0)
				weekend_sessions += 1
			else:
				weekday_hours += entry.get("hours", 0)
				weekday_sessions += 1

		weekend_avg = weekend_hours / max(1, weekend_sessions)
		weekday_avg = weekday_hours / max(1, weekday_sessions)

		if burnout:
			return "Burnout Risk"
		if consistency >= 75 and avg_actual >= target:
			return "Consistent Builder"
		if weekend_avg > weekday_avg * 1.5 and weekend_sessions > 0:
			return "Weekend Warrior"
		if consistency < 40:
			return "Irregular Learner"
		if target > 0 and avg_actual >= target * 1.4:
			return "Overcommitter"
		return "Slow Burn"
