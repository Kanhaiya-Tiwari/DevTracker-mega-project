from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
import httpx
import random
from app.dependencies import get_current_user
from app.config import Settings

router = APIRouter()
settings = Settings()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"


def _openrouter_headers():
    return {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "HTTP-Referer": "https://devtrackr.io",
        "X-OpenRouter-Title": "DevTrackr",
        "Content-Type": "application/json",
    }


async def _openrouter_chat(prompt: str, *, timeout: int = 60, json_mode: bool = False) -> Optional[str]:
    """Call OpenRouter and return the assistant message text, or None on failure."""
    body: dict = {
        "model": settings.openrouter_model,
        "messages": [{"role": "user", "content": prompt}],
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(OPENROUTER_URL, headers=_openrouter_headers(), json=body)
            if resp.status_code == 200:
                text = resp.json()["choices"][0]["message"]["content"].strip()
                if text and len(text) > 5:
                    return text
    except Exception:
        pass
    return None


async def _gemini_chat(prompt: str, *, timeout: int = 60, json_mode: bool = False) -> Optional[str]:
    """Call Gemini API and return the assistant message text, or None on failure."""
    url = GEMINI_URL.format(model=settings.gemini_model, api_key=settings.gemini_api_key)
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 8192,
        }
    }
    if json_mode:
        body["generationConfig"]["responseMimeType"] = "application/json"

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, json=body)
            if resp.status_code == 200:
                data = resp.json()
                # Handle Gemini API response structure
                if "candidates" in data and len(data["candidates"]) > 0:
                    candidate = data["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        parts = candidate["content"]["parts"]
                        if len(parts) > 0 and "text" in parts[0]:
                            text = parts[0]["text"].strip()
                            if text and len(text) > 5:
                                return text
    except Exception as e:
        print(f"Gemini API error: {e}")
        pass
    return None


async def _ai_chat(prompt: str, *, timeout: int = 60, json_mode: bool = False) -> Optional[str]:
    """Route to either Gemini or OpenRouter based on settings."""
    if settings.use_gemini and settings.gemini_api_key:
        result = await _gemini_chat(prompt, timeout=timeout, json_mode=json_mode)
        if result:
            return result
    # Fallback to OpenRouter
    if settings.openrouter_api_key:
        return await _openrouter_chat(prompt, timeout=timeout, json_mode=json_mode)
    return None

FALLBACK_TIPS = [
    "Break your learning into 25-minute Pomodoro sessions. Short bursts beat marathon sessions for retention and consistency.",
    "The 2-minute rule: if a study task takes less than 2 minutes, do it now. This prevents small tasks from piling up.",
    "Spaced repetition is your superpower — review yesterday's material before starting today's new content.",
    "Teach what you learn. Explain concepts out loud as if teaching a student. The gaps in your knowledge become clear instantly.",
    "Build something real with each new skill. Theory without application fades in 48 hours.",
    "Your streak is your most valuable asset. Even 20 minutes of practice counts — protect it at all costs.",
    "Study at the same time every day. Habit stacking with an existing routine removes the friction of starting.",
    "Track your wins, not just your failures. Every hour logged is progress. Celebrate the small wins.",
    "The feeling of 'I'm not making progress' is normal at day 15-30. Push through — the breakthrough is close.",
    "Focus on depth over breadth. One skill mastered deeply beats five skills at surface level every time.",
]


class ChatMessage(BaseModel):
    message: str
    skill_name: Optional[str] = None
    context: Optional[str] = None
    history: Optional[list] = None


class DailyTipRequest(BaseModel):
    skill_name: Optional[str] = None
    hours_completed: Optional[float] = 0
    streak: Optional[int] = 0


@router.post("/")
async def chat(body: ChatMessage, current_user=Depends(get_current_user)):
    """AI-powered chat for DevTrackr coaching using Gemini or OpenRouter"""
    history_text = ""
    if body.history:
        for msg in body.history[-6:]:  # Last 3 exchanges
            role = "User" if msg.get("role") == "user" else "Coach"
            history_text += f"{role}: {msg.get('text', '')}\n"

    prompt = f"""You are DevTrackr AI Coach — India's smartest skill-learning assistant.
You are coaching {current_user.name} (Level {current_user.level}, {current_user.streak} day streak).
Current skill: {body.skill_name or 'General learning'}
Context: {body.context or 'none'}

Previous conversation:
{history_text}

User: {body.message}

Give a motivating, specific, actionable response in 2-4 sentences. Be direct and inspiring like a top coach.
Coach:"""

    reply = await _ai_chat(prompt, timeout=60)
    if reply and len(reply) > 10:
        model_name = settings.gemini_model if settings.use_gemini else settings.openrouter_model
        powered_by = "gemini" if settings.use_gemini else "openrouter"
        return {"reply": reply, "model": model_name, "powered_by": powered_by}

    # Smart fallback based on message content
    msg_lower = body.message.lower()
    if any(w in msg_lower for w in ["stuck", "help", "how", "what", "explain"]):
        reply = f"For {body.skill_name or 'this skill'}: identify the exact point you're stuck on, then spend 20 minutes on just that concept. Google '[topic] explained in 5 minutes' — visual explanations break most blocks instantly."
    elif any(w in msg_lower for w in ["motivation", "tired", "quit", "give up", "hard"]):
        reply = f"Every expert was once a complete beginner. You have {current_user.streak} days of proof that you can show up. The people who win are not the smartest — they are the most consistent. Today counts."
    elif any(w in msg_lower for w in ["time", "busy", "schedule", "plan"]):
        reply = "Block 45 minutes every morning before your day starts. Morning sessions have the highest focus quality and zero interruptions. Even 3 sessions per week beats zero sessions perfectly planned."
    else:
        reply = random.choice(FALLBACK_TIPS)

    return {"reply": reply, "model": "fallback", "powered_by": "devtrackr"}


@router.post("/daily-tip")
async def daily_tip(body: DailyTipRequest, current_user=Depends(get_current_user)):
    """Get a personalized daily AI tip from Gemini or OpenRouter"""
    prompt = f"""Generate one powerful learning tip for {current_user.name}.
Skill: {body.skill_name or 'general development'}
Hours completed today: {body.hours_completed}
Current streak: {body.streak} days

Give ONE specific, actionable tip in exactly 2 sentences. Make it feel personal and motivating.
Tip:"""

    tip = await _ai_chat(prompt, timeout=60)
    if tip and len(tip) > 20:
        model_name = settings.gemini_model if settings.use_gemini else settings.openrouter_model
        return {"tip": tip, "model": model_name}

    return {"tip": random.choice(FALLBACK_TIPS), "model": "fallback"}


@router.post("/skill-suggestions")
async def skill_suggestions(
    body: dict, current_user=Depends(get_current_user)
):
    """AI-powered skill roadmap suggestions using Gemini or OpenRouter"""
    import json

    query = body.get("query", "")
    existing = body.get("existing_skills", [])

    prompt = f"""Suggest 5 learning goals for someone who wants to learn: "{query}"
They already know: {', '.join(existing) or 'nothing specified'}

Return JSON array ONLY — no explanation, just the array:
[{{"name": "Skill Name", "icon": "emoji", "total_hours": 50, "daily_target": 2, "why": "one sentence reason"}}]"""

    raw = await _ai_chat(prompt, timeout=20, json_mode=True)
    if raw:
        try:
            parsed = json.loads(raw)
            suggestions = parsed if isinstance(parsed, list) else parsed.get("suggestions", [])
            if isinstance(suggestions, list) and len(suggestions) > 0:
                model_name = settings.gemini_model if settings.use_gemini else settings.openrouter_model
                return {"suggestions": suggestions[:5], "model": model_name}
        except (json.JSONDecodeError, AttributeError):
            pass

    # Fallback suggestions
    fallback = [
        {"name": f"{query} Fundamentals", "icon": "📚", "total_hours": 40, "daily_target": 2, "why": "Build a rock-solid foundation before advancing"},
        {"name": f"{query} — Build Projects", "icon": "🚀", "total_hours": 60, "daily_target": 2, "why": "Real projects = real retention"},
        {"name": f"Advanced {query}", "icon": "⚡", "total_hours": 80, "daily_target": 3, "why": "Go beyond tutorials to expert-level mastery"},
        {"name": "System Design", "icon": "🏗️", "total_hours": 50, "daily_target": 2, "why": "Think like a senior engineer from day one"},
        {"name": "Interview Prep", "icon": "🎯", "total_hours": 30, "daily_target": 1, "why": "Convert your skills into career opportunities"},
    ]
    return {"suggestions": fallback, "model": "fallback"}
