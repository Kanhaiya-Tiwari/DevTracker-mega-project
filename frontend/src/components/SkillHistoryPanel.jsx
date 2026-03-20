import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { formatDate, hours } from "../utils/format";

const QUALITY_MAP = {
  deep: { emoji: "🧠", label: "Deep Focus", color: "text-sky-300" },
  medium: { emoji: "⚡", label: "Normal", color: "text-slate-300" },
  light: { emoji: "📖", label: "Casual", color: "text-slate-400" },
  high: { emoji: "🧠", label: "High", color: "text-sky-300" },
  low: { emoji: "📖", label: "Low", color: "text-slate-400" },
};

export default function SkillHistoryPanel({ skill, token, onClose }) {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateLogs, setDateLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    if (!skill?.id || !token) return;
    setLoading(true);
    api.getSkillLogDates(token, skill.id)
      .then((d) => {
        setDates(d || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [skill?.id, token]);

  const selectDate = useCallback(
    (d) => {
      setSelectedDate(d);
      setLogLoading(true);
      api.getSkillLogsByDate(token, skill.id, d)
        .then((logs) => { setDateLogs(logs || []); setLogLoading(false); })
        .catch(() => setLogLoading(false));
    },
    [skill?.id, token],
  );

  const totalForDate = dateLogs.reduce((sum, l) => sum + (l.hours || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-sky-400/20 bg-slate-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              📅 Date-wise History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {skill.icon} {skill.name} — tap a date to see sessions
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition">
            ✕ Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <p className="text-center text-slate-400 py-10 animate-pulse">Loading dates…</p>
          ) : dates.length === 0 ? (
            <p className="text-center text-slate-400 py-10">No sessions logged yet for this skill.</p>
          ) : (
            <>
              {/* Date pills */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {dates.length} day{dates.length !== 1 ? "s" : ""} with activity
                </p>
                <div className="flex flex-wrap gap-2">
                  {dates.map((d) => (
                    <button
                      key={d}
                      onClick={() => selectDate(d)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        selectedDate === d
                          ? "border-sky-500/50 bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/10"
                          : "border-white/8 bg-white/4 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {formatDate(d)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected date details */}
              {selectedDate && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      📝 Sessions on {formatDate(selectedDate)}
                    </h3>
                    {dateLogs.length > 0 && (
                      <span className="text-xs font-bold text-sky-300 bg-sky-500/15 rounded-full px-2.5 py-0.5">
                        Total: {hours(totalForDate)}
                      </span>
                    )}
                  </div>

                  {logLoading ? (
                    <p className="text-slate-400 text-sm animate-pulse py-4 text-center">Loading sessions…</p>
                  ) : dateLogs.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No sessions on this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {dateLogs.map((log) => {
                        const q = QUALITY_MAP[log.quality] || {};
                        return (
                          <div key={log.id} className="rounded-xl border border-white/8 bg-white/4 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-bold text-sm">{hours(log.hours)}</span>
                              {log.quality && (
                                <span className={`text-xs font-medium ${q.color || "text-slate-400"}`}>
                                  {q.emoji} {q.label || log.quality}
                                </span>
                              )}
                            </div>
                            {log.notes && (
                              <p className="text-xs text-slate-400 leading-relaxed">{log.notes}</p>
                            )}
                            {log.xp_earned > 0 && (
                              <p className="text-xs text-amber-400 mt-1 font-medium">+{log.xp_earned} XP</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
