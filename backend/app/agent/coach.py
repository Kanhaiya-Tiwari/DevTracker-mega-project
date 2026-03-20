"""Rule-based coaching messages for the DevTrackr agent."""

from __future__ import annotations

from app.agent.planner import SkillPlanner
from app.agent.predictor import CompletionPredictor


class SkillCoach:
	def __init__(self) -> None:
		self.planner = SkillPlanner()
		self.predictor = CompletionPredictor()

	def build_response(self, ctx: dict, math_output: dict) -> dict:
		probability = int(math_output.get("completion_probability", 0))
		verdict = self.predictor.verdict(probability)
		skill = ctx.get("skill", {})
		days_left = max(1, int(ctx.get("days_to_deadline", 1) or 1))
		hours_left = max(0.0, float(skill.get("total_hours", 0) or 0) - float(skill.get("completed_hours", 0) or 0))
		daily_needed = round(hours_left / days_left, 1)
		pattern = math_output.get("behavior_pattern", "Irregular Learner")
		burnout = bool(math_output.get("burnout_detected", False))
		consistency = int(math_output.get("consistency_score", 0))

		if burnout:
			immediate_action = "Reduce intensity today and log one focused recovery session."
			charge = "Recover smart. Then execute."
			intensity = "recovery"
		elif verdict == "critical":
			immediate_action = f"Protect {max(daily_needed, skill.get('daily_target', 1))}h today and eliminate distractions."
			charge = "Urgency now beats regret later."
			intensity = "push"
		elif verdict == "at_risk":
			immediate_action = f"Hit at least {max(daily_needed, skill.get('daily_target', 1))}h today and maintain it for 3 days."
			charge = "Stability first. Momentum next."
			intensity = "balanced"
		else:
			immediate_action = f"Repeat your current pace with {skill.get('daily_target', 1)}h of deep work today."
			charge = "Stay sharp. Finish strong."
			intensity = "balanced"

		weekly_plan = self.planner.build_weekly_plan({**ctx, "behavior_pattern": pattern}, intensity=intensity)
		risk_factors = []
		if consistency < 50:
			risk_factors.append("Low consistency")
		if burnout:
			risk_factors.append("Burnout risk")
		if daily_needed > float(skill.get("daily_target", 1) or 1):
			risk_factors.append("Required daily pace exceeds target")
		if not risk_factors:
			risk_factors.append("Maintain current momentum")

		coach_message = (
			f"You have {hours_left:.1f}h left and {days_left} days remaining, which means {daily_needed}h/day is required. "
			f"Your current pattern is {pattern.lower()} with a consistency score of {consistency}%."
		)

		return {
			"coach_message": coach_message,
			"completion_verdict": verdict,
			"immediate_action": immediate_action,
			"motivational_charge": charge,
			"weekly_plan": weekly_plan,
			"risk_factors": risk_factors,
			"top_insight": pattern,
		}
