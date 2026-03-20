const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  let body = options.body;

  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      headers,
      body,
    });
  } catch {
    throw new Error("Network error. API is unreachable.");
  }

  if (!response.ok) {
    const text = await response.text();
    let detail = "";

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.detail === "string") detail = parsed.detail;
      if (Array.isArray(parsed?.detail)) detail = parsed.detail.map((x) => x.msg).filter(Boolean).join(", ");
    } catch {
      // Keep raw text fallback.
    }

    throw new Error(detail || text || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  register(payload) {
    return request("/auth/register", { method: "POST", body: payload });
  },
  login(email, password) {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    return request("/auth/token", { method: "POST", body: formData });
  },
  me(token) {
    return request("/auth/me", { token });
  },
  getSkills(token) {
    return request("/skills/", { token });
  },
  createSkill(token, payload) {
    return request("/skills/", { method: "POST", token, body: payload });
  },
  getSkillLogs(token, skillId) {
    return request(`/logs/skill/${skillId}`, { token });
  },
  getSkillLogDates(token, skillId) {
    return request(`/logs/skill/${skillId}/dates`, { token });
  },
  getSkillLogsByDate(token, skillId, date) {
    return request(`/logs/skill/${skillId}/by-date?d=${date}`, { token });
  },
  addLog(token, payload) {
    return request("/logs/", { method: "POST", token, body: payload });
  },
  getAnalytics(token) {
    return request("/analytics/overview", { token });
  },
  getInsight(token, skillId) {
    return request(`/insights/${skillId}`, { token });
  },
  // ── Leaderboard ──────────────────────────────────────────────
  getLeaderboard(token, category = "xp") {
    return request(`/leaderboard/?category=${category}`, { token });
  },
  // ── Settings ─────────────────────────────────────────────────
  getSettings(token) {
    return request("/settings/", { token });
  },
  updateSettings(token, payload) {
    return request("/settings/", { method: "PUT", token, body: payload });
  },
  // ── AI Chat ──────────────────────────────────────────
  chat(token, payload) {
    return request("/chat/", { method: "POST", token, body: payload });
  },
  getDailyTip(token, payload) {
    return request("/chat/daily-tip", { method: "POST", token, body: payload });
  },
  getSkillSuggestions(token, query, existingSkills = []) {
    return request("/chat/skill-suggestions", {
      method: "POST",
      token,
      body: { query, existing_skills: existingSkills },
    });
  },
};
