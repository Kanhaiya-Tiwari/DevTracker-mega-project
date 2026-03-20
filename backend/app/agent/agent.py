"""
AI Agent Orchestrator.
Input: structured UserContext dict
Output: structured AgentResponse dict

The agent is NOT a chatbot. It processes data and makes decisions.
Uses OpenRouter API for LLM inference.
Maintains short-term memory (recent logs) + long-term memory (DB insights).
"""
import json
import httpx
from app.agent.memory import AgentMemory
from app.agent.planner import SkillPlanner
from app.agent.coach import SkillCoach
from app.agent.predictor import CompletionPredictor
from app.agent.behavioral import BehavioralEngine
from app.config import Settings
import logging

logger = logging.getLogger(__name__)
settings = Settings()

class DevTrackrAgent:
    def __init__(self, memory: AgentMemory):
        self.memory = memory
        self.planner   = SkillPlanner()
        self.coach     = SkillCoach()
        self.predictor = CompletionPredictor()
        self.behavioral = BehavioralEngine()

    async def analyze(self, user_id: str, skill_id: str, db) -> dict:
        # 1. Load memory
        ctx = await self.memory.build_context(user_id, skill_id, db)

        # 2. Math layer (deterministic, no LLM needed)
        math_output = {
            "completion_probability": self.predictor.calculate(ctx),
            "burnout_detected":       self.behavioral.detect_burnout(ctx),
            "consistency_score":      self.behavioral.consistency(ctx),
            "behavior_pattern":       self.behavioral.classify_pattern(ctx),
        }

        # 3. LLM layer (reasoning on top of math)
        llm_output = await self._llm_reason(ctx, math_output)

        # 4. Save to long-term memory
        await self.memory.save_insight(user_id, skill_id, {**math_output, **llm_output}, db)

        return {**math_output, **llm_output}

    async def _llm_reason(self, ctx: dict, math: dict) -> dict:
        prompt = f"""You are DevTrackr's AI Coach. Analyze this learner and return JSON ONLY.

USER DATA:
{json.dumps(ctx, indent=2, default=str)}

MATH ENGINE OUTPUT:
{json.dumps(math, indent=2)}

Return this JSON structure:
{{
  "coach_message": "2-3 sentence honest assessment",
  "completion_verdict": "on_track|at_risk|critical",
  "immediate_action": "one specific action for today",
  "motivational_charge": "punchy max 10 word push",
  "weekly_plan": [{{"day": "Mon", "task": "...", "hours": 2}},...for all 7 days],
  "risk_factors": ["factor1"],
  "top_insight": "key pattern detected"
}}"""

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.openrouter_api_key}",
                        "HTTP-Referer": "https://devtrackr.io",
                        "X-OpenRouter-Title": "DevTrackr",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.openrouter_model,
                        "messages": [{"role": "user", "content": prompt}],
                        "response_format": {"type": "json_object"},
                    },
                )
                raw = resp.json()["choices"][0]["message"]["content"].strip()
                return json.loads(raw)
        except Exception as e:
            logger.warning(f"LLM call failed, using rule-based fallback: {e}")
            return self._rule_based_fallback(ctx, math)

    def _rule_based_fallback(self, ctx: dict, math: dict) -> dict:
        prob = math["completion_probability"]
        verdict = "on_track" if prob >= 70 else "at_risk" if prob >= 40 else "critical"
        hours_left = ctx["skill"]["total_hours"] - ctx["skill"]["completed_hours"]
        days_left = max(1, ctx.get("days_to_deadline", 1))
        daily_needed = round(hours_left / days_left, 1)
        return {
            "coach_message": f"You need {daily_needed}h/day to finish on time. "
                             f"{'Your consistency is the biggest risk.' if math['consistency_score'] < 50 else 'Keep the momentum.'}",
            "completion_verdict": verdict,
            "immediate_action": f"Log at least {ctx['skill']['daily_target']}h today without distractions.",
            "motivational_charge": "Consistency compounds. Execute.",
            "weekly_plan": [{"day": d, "task": "Core practice", "hours": ctx["skill"]["daily_target"]}
                            for d in ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]],
            "risk_factors": ["Burnout risk"] if math["burnout_detected"] else ["Inconsistent schedule"],
            "top_insight": math["behavior_pattern"],
        }