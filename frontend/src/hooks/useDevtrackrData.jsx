import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { consistencyScore, skillProgress, streakFromLogs } from "../utils/metrics";

function normalizeSkill(raw) {
  return {
    id: raw.id,
    name: raw.name,
    icon: raw.icon || "⚡",
    totalHours: Number(raw.total_hours || 0),
    dailyTarget: Number(raw.daily_target || 1),
    deadline: raw.deadline,
    difficulty: raw.difficulty || "medium",
  };
}

function normalizeLog(raw) {
  return {
    id: raw.id,
    skillId: raw.skill_id,
    hours: Number(raw.hours || 0),
    quality: raw.quality || "medium",
    notes: raw.notes || "",
    date: (raw.log_date || new Date().toISOString()).slice(0, 10),
  };
}

export function useDevtrackrData(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState([]);
  const [logsBySkill, setLogsBySkill] = useState({});
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [insight, setInsight] = useState(null);

  const selectedSkill = useMemo(() => skills.find((s) => s.id === selectedSkillId) || skills[0] || null, [skills, selectedSkillId]);
  const selectedLogs = useMemo(() => (selectedSkill ? logsBySkill[selectedSkill.id] || [] : []), [selectedSkill, logsBySkill]);
  const allLogs = useMemo(() => Object.values(logsBySkill).flat(), [logsBySkill]);

  const summary = useMemo(() => {
    const totalHours = allLogs.reduce((sum, l) => sum + Number(l.hours || 0), 0);
    const streak = streakFromLogs(allLogs);
    const consistency = consistencyScore(allLogs);
    const progress = selectedSkill ? skillProgress(selectedSkill, selectedLogs) : null;
    return { totalHours, streak, consistency, progress };
  }, [allLogs, selectedSkill, selectedLogs]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const skillRows = await api.getSkills(token);
      const normalized = skillRows.map(normalizeSkill);
      setSkills(normalized);
      setSelectedSkillId((current) => current || normalized[0]?.id || "");

      const entries = await Promise.all(
        normalized.map(async (skill) => {
          const rows = await api.getSkillLogs(token, skill.id);
          return [skill.id, rows.map(normalizeLog)];
        }),
      );
      setLogsBySkill(Object.fromEntries(entries));
    } catch (e) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token || !selectedSkill) return;
    api.getInsight(token, selectedSkill.id)
      .then((res) => {
        setInsight({
          verdict: res.completion_verdict || "on_track",
          message: res.coach_message || "Keep going.",
          action: res.immediate_action || "Log at least 1 focused hour today.",
          prediction: res.top_insight || "Momentum is improving.",
          plan: res.weekly_plan || [],
        });
      })
      .catch(() => {
        setInsight((current) => current || {
          verdict: "at_risk",
          message: "No AI response yet. Stay consistent for the next 3 days.",
          action: "Log at least 1 focused hour today.",
          prediction: "Completion probability improves with daily logs.",
          plan: [],
        });
      });
  }, [token, selectedSkill]);

  async function addSkill(payload) {
    const created = await api.createSkill(token, payload);
    const nextSkill = normalizeSkill(created);
    setSkills((prev) => [nextSkill, ...prev]);
    setLogsBySkill((prev) => ({ ...prev, [nextSkill.id]: [] }));
    setSelectedSkillId(nextSkill.id);
  }

  async function addLog(payload) {
    const created = await api.addLog(token, payload);
    const normalized = normalizeLog(created);
    setLogsBySkill((prev) => ({
      ...prev,
      [normalized.skillId]: [...(prev[normalized.skillId] || []), normalized],
    }));
  }

  async function refreshInsight() {
    if (!selectedSkill) return;
    const res = await api.getInsight(token, selectedSkill.id);
    setInsight({
      verdict: res.completion_verdict || "on_track",
      message: res.coach_message || "Keep going.",
      action: res.immediate_action || "Log at least 1 focused hour today.",
      prediction: res.top_insight || "Momentum is improving.",
      plan: res.weekly_plan || [],
    });
  }

  return {
    loading,
    error,
    skills,
    logsBySkill,
    selectedSkill,
    selectedLogs,
    selectedSkillId,
    setSelectedSkillId,
    allLogs,
    summary,
    insight,
    load,
    addSkill,
    addLog,
    refreshInsight,
  };
}
