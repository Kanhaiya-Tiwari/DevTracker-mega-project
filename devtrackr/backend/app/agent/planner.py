"""Weekly planning helpers for the DevTrackr agent."""

from __future__ import annotations


class SkillPlanner:
	days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

	def build_weekly_plan(self, ctx: dict, intensity: str = "balanced") -> list[dict]:
		skill = ctx.get("skill", {})
		phases = skill.get("phases") or []
		daily_target = float(skill.get("daily_target", 1) or 1)
		behavior_pattern = ctx.get("behavior_pattern", "")

		multiplier = {
			"recovery": 0.8,
			"balanced": 1.0,
			"push": 1.15,
		}.get(intensity, 1.0)

		if behavior_pattern == "Weekend Warrior":
			hours_by_day = {
				"Mon": round(daily_target * 0.7 * multiplier, 1),
				"Tue": round(daily_target * 0.8 * multiplier, 1),
				"Wed": round(daily_target * 0.8 * multiplier, 1),
				"Thu": round(daily_target * 0.9 * multiplier, 1),
				"Fri": round(daily_target * 0.8 * multiplier, 1),
				"Sat": round(daily_target * 1.5 * multiplier, 1),
				"Sun": round(daily_target * 1.5 * multiplier, 1),
			}
		else:
			hours_by_day = {day: round(daily_target * multiplier, 1) for day in self.days}

		topics = []
		for phase in phases:
			topics.extend(phase.get("topics", []))
		if not topics:
			topics = ["Core practice", "Revision", "Hands-on execution"]

		plan = []
		for index, day in enumerate(self.days):
			topic = topics[index % len(topics)]
			plan.append({
				"day": day,
				"task": topic,
				"hours": hours_by_day[day],
			})
		return plan
