import { useMemo, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import ProgressBar from "../components/ProgressBar";
import ChartCard from "../components/ChartCard";
import AIInsightCard from "../components/AIInsightCard";
import SkillHistoryPanel from "../components/SkillHistoryPanel";
import { formatDate, hours } from "../utils/format";
import { skillProgress, weekSeries } from "../utils/metrics";

const QUALITY_OPTS = [
  { value: "deep", label: "Deep Focus", emoji: "🧠", color: "text-sky-300" },
  { value: "medium", label: "Normal", emoji: "⚡", color: "text-slate-300" },
  { value: "light", label: "Casual", emoji: "📖", color: "text-slate-400" },
];

export default function SkillDetailPage({ skill, logs, insight, onLog, onRefreshInsight, insightLoading, token }) {
  const [hoursInput, setHoursInput] = useState("1");
  const [quality, setQuality] = useState("medium");
  const [notes, setNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const progress = useMemo(() => skillProgress(skill, logs), [skill, logs]);
  const chart = useMemo(() => weekSeries(logs), [logs]);
  const daysLeft = skill?.deadline ? Math.max(0, Math.ceil((new Date(skill.deadline) - Date.now()) / 86400000)) : null;
  const recentLogs = useMemo(() => [...(logs || [])].reverse().slice(0, 10), [logs]);
  const totalDays = logs?.length || 0;
  const bestSession = logs?.reduce((best, l) => l.hours > (best?.hours || 0) ? l : best, null);

  if (!skill) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
        <p className="text-4xl mb-3">🎯</p>
        <p className="text-white font-semibold text-lg">Select a skill to view details</p>
        <p className="text-slate-400 text-sm mt-1">Choose any skill card from the Dashboard to explore its progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-900/25 via-blue-900/15 to-violet-900/10 p-5 shadow-xl shadow-black/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-sky-500/8 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{skill.icon || "⚡"}</span>
                <div>
                  <h2 className="text-xl font-black text-white">{skill.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {daysLeft !== null && (
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${daysLeft <= 3 ? "bg-rose-500/20 text-rose-300" : daysLeft <= 7 ? "bg-amber-500/20 text-amber-300" : "bg-slate-700 text-slate-300"}`}>
                        {daysLeft === 0 ? "🔴 Due today" : `${daysLeft} days left`}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">Deadline {formatDate(skill.deadline)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 font-medium">{progress.pct}% complete</span>
                  <span className="text-slate-400">{hours(progress.remaining)} remaining</span>
                </div>
                <ProgressBar value={progress.pct} tone={progress.pct >= 70 ? "sky" : progress.pct >= 35 ? "yellow" : "red"} height="h-3" />
              </div>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-300 hover:bg-sky-500/20 transition flex items-center gap-2 shadow-lg shadow-sky-500/5"
            >
              📅 Date History
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-4 mt-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Completed</p><p className="text-lg font-bold text-sky-300 mt-0.5">{hours(progress.completed)}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Remaining</p><p className="text-lg font-bold text-amber-300 mt-0.5">{hours(progress.remaining)}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Daily Avg</p><p className="text-lg font-bold text-emerald-300 mt-0.5">{hours(progress.dailyAvg)}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Sessions</p><p className="text-lg font-bold text-violet-300 mt-0.5">{totalDays}</p></div>
          </div>
        </div>
      </section>

      {/* Log Session */}
      <section className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">⏱️ Log a Session</h3>
        <form className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onLog(skill.id, Number(hoursInput), quality, notes);
            setHoursInput("1");
            setNotes("");
          }}
        >
          <div className="flex gap-3 flex-wrap">
            <Input label="Hours" type="number" step="0.25" min="0.25" max="12" value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} className="w-28" />
            <div className="flex-1">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Session Quality</span>
                <div className="flex gap-2">
                  {QUALITY_OPTS.map((q) => (
                    <button key={q.value} type="button" onClick={() => setQuality(q.value)}
                      className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition ${quality === q.value ? "border-sky-500/50 bg-sky-500/15 text-sky-300" : "border-white/8 bg-white/4 text-slate-400 hover:bg-white/8"}`}>
                      {q.emoji} {q.label}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </div>
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you work on?" />
          <Button variant="success" type="submit">📝 Submit Session</Button>
        </form>
      </section>

      {/* Charts & History */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Daily Hours (7 days)" subtitle="Recent activity" data={chart} color="sky" />

        <section className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <h3 className="text-sm font-bold text-white mb-3">📋 Session History</h3>
          {recentLogs.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No sessions logged yet. Start your journey!</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-3 py-2.5">
                  <div>
                    <p className="text-sm text-slate-200">{formatDate(log.log_date || log.date)}</p>
                    {log.notes && <p className="text-xs text-slate-500 truncate max-w-48">{log.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-sm">{hours(log.hours)}</p>
                    {log.quality && (
                      <p className="text-xs text-slate-500">{log.quality}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* AI Insight */}
      {insight && <AIInsightCard insight={insight} onRefresh={onRefreshInsight} loading={insightLoading} />}

      {/* Skill Milestones */}
      {progress.pct > 0 && (
        <section className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/8 to-orange-500/5 p-5">
          <h3 className="text-sm font-bold text-amber-300 mb-3">🎯 Milestones</h3>
          <div className="space-y-2">
            {[25, 50, 75, 100].map((milestone) => (
              <div key={milestone} className={`flex items-center gap-3 rounded-xl p-2.5 ${progress.pct >= milestone ? "bg-emerald-500/10 border border-emerald-400/20" : "bg-white/4 border border-white/6 opacity-50"}`}>
                <span className="text-lg">{progress.pct >= milestone ? "✅" : "⏳"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{milestone}% Complete</p>
                  <p className="text-xs text-slate-400">{hours(skill.total_hours * milestone / 100)} of {hours(skill.total_hours)}</p>
                </div>
                {progress.pct >= milestone && <span className="text-xs text-emerald-300 font-bold">Achieved!</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Best Session */}
      {bestSession && (
        <section className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/8 to-blue-600/5 p-4">
          <p className="text-xs font-bold text-sky-300 mb-1">🥇 Your Best Session</p>
          <p className="text-white font-bold">{hours(bestSession.hours)} on {formatDate(bestSession.log_date || bestSession.date)}</p>
          <p className="text-slate-400 text-xs mt-0.5">Every session counts. This was your personal best — beat it!</p>
        </section>
      )}

      {/* Date History Modal */}
      {showHistory && (
        <SkillHistoryPanel skill={skill} token={token} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
