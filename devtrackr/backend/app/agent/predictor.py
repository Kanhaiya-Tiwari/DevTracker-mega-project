"""Completion prediction logic for the DevTrackr agent."""

from __future__ import annotations

from datetime import datetime


class CompletionPredictor:
	def calculate(self, ctx: dict) -> int:
		skill = ctx.get("skill", {})
		recent_logs = ctx.get("recent_logs", [])

		total_hours = float(skill.get("total_hours", 0) or 0)
		completed_hours = float(skill.get("completed_hours", 0) or 0)
		daily_target = float(skill.get("daily_target", 0) or 0)
		days_left = max(1, int(ctx.get("days_to_deadline", 1) or 1))

		if total_hours <= 0:
			return 5
		if completed_hours >= total_hours:
			return 97
		if not recent_logs:
			return 45

		avg_hours = sum(log.get("hours", 0) for log in recent_logs) / max(1, len(recent_logs))
		consistency = sum(1 for log in recent_logs if log.get("hours", 0) >= daily_target * 0.7) / max(1, len(recent_logs))
		hours_left = max(0.1, total_hours - completed_hours)
		projected = avg_hours * days_left
		coverage = min(1.0, projected / hours_left)
		raw_score = (coverage * 0.6) + (consistency * 0.4)
		return max(5, min(97, round(raw_score * 100)))

	def verdict(self, probability: int) -> str:
		if probability >= 85:
			return "completed"
		if probability >= 70:
			return "on_track"
		if probability >= 40:
			return "at_risk"
		return "critical"
