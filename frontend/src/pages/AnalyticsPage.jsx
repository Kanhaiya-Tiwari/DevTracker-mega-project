import ChartCard from "../components/ChartCard";
import HeatmapGrid from "../components/HeatmapGrid";
import StatCard from "../components/StatCard";
import { consistencyScore, heatmapCells, monthSeries, weekSeries, streakFromLogs } from "../utils/metrics";
import { hours } from "../utils/format";

const ACHIEVEMENTS = [
  { id: "first_log",     label: "First Step",    desc: "Logged your first hour",      icon: "🎁", condition: (l) => l.length > 0 },
  { id: "week_streak",   label: "Week Warrior",  desc: "7-day streak achieved",       icon: "🔥", condition: (_, s) => s >= 7 },
  { id: "10h",           label: "10 Hour Club",  desc: "Total 10 hours logged",       icon: "🏅", condition: (l) => l.reduce((s,x) => s + (x.hours||0), 0) >= 10 },
  { id: "50h",           label: "50 Hour Legend",desc: "Total 50 hours logged",       icon: "🥇", condition: (l) => l.reduce((s,x) => s + (x.hours||0), 0) >= 50 },
  { id: "consistent",    label: "Consistency King", desc: "70%+ consistency score",  icon: "📊", condition: (l) => consistencyScore(l) >= 70 },
  { id: "month_streak",  label: "Month Master",  desc: "30-day streak achieved",     icon: "🏆", condition: (_, s) => s >= 30 },
];

export default function AnalyticsPage({ logs }) {
  const weekly = weekSeries(logs);
  const monthly = monthSeries(logs);
  const heatmap = heatmapCells(logs);
  const score = consistencyScore(logs);
  const streak = streakFromLogs(logs);
  const totalHours = logs.reduce((s, l) => s + (l.hours || 0), 0);
  const weeklyHours = weekly.reduce((s, x) => s + x.value, 0);
  const monthlyHours = monthly.reduce((s, x) => s + x.value, 0);
  const avgPerDay = logs.length > 0 ? (totalHours / Math.max(1, Math.ceil((Date.now() - new Date(logs[logs.length - 1]?.log_date || Date.now())) / 86400000))) : 0;
  const bestDay = weekly.reduce((best, d) => d.value > (best?.value || 0) ? d : best, null);

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => {
    try { return a.condition(logs, streak); } catch { return false; }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-900/25 via-blue-900/15 to-transparent p-5">
        <h2 className="text-2xl font-black text-white">📊 Analytics</h2>
        <p className="text-sm text-slate-400 mt-1">Deep insights into your learning patterns and progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Consistency Score" value={`${score}%`} tone={score >= 70 ? "green" : score >= 40 ? "yellow" : "red"} icon="📈" sub={score >= 70 ? "Excellent!" : score >= 40 ? "Keep going" : "Needs work"} />
        <StatCard label="Current Streak" value={`${streak} days`} tone="amber" icon="🔥" />
        <StatCard label="Weekly Hours" value={`${weeklyHours.toFixed(1)}h`} tone="sky" icon="📅" />
        <StatCard label="Monthly Hours" value={`${monthlyHours.toFixed(1)}h`} tone="violet" icon="🗓️" />
        <StatCard label="Total Hours" value={hours(totalHours)} tone="green" icon="⏳" />
        <StatCard label="Best Day This Week" value={bestDay ? `${bestDay.value.toFixed(1)}h` : "—"} tone="pink" icon="🏆" sub={bestDay?.label} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="This Week" subtitle="Daily hours for last 7 days" data={weekly} color="sky" />
        <ChartCard title="This Month" subtitle="Weekly totals for last 4 weeks" data={monthly} color="green" />
      </div>

      {/* Heatmap */}
      <HeatmapGrid cells={heatmap} weeks={16} />

      {/* Achievements */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
        <h3 className="text-sm font-bold text-white mb-4">🏅 Achievements <span className="text-xs text-slate-400 font-normal ml-1">{unlockedAchievements.length}/{ACHIEVEMENTS.length} unlocked</span></h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedAchievements.some((u) => u.id === a.id);
            return (
              <div key={a.id} className={`rounded-xl p-3 border transition duration-200 ${unlocked ? "border-amber-400/25 bg-gradient-to-br from-amber-500/12 to-yellow-600/8" : "border-white/6 bg-white/3 opacity-40"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{a.icon}</span>
                  {!unlocked && <span className="text-xs text-slate-500">🔒</span>}
                </div>
                <p className={`text-xs font-bold ${unlocked ? "text-amber-300" : "text-slate-400"}`}>{a.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Velocity */}
      <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/8 to-purple-600/5 p-5">
        <h3 className="text-sm font-bold text-violet-300 mb-3">🧠 Learning Velocity</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
            <p className="text-2xl font-black text-white">{totalHours.toFixed(0)}h</p>
            <p className="text-xs text-slate-400 mt-1">Total invested</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
            <p className="text-2xl font-black text-sky-300">{avgPerDay > 0 ? avgPerDay.toFixed(1) : "—"}h</p>
            <p className="text-xs text-slate-400 mt-1">Daily average</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
            <p className={`text-2xl font-black ${score >= 70 ? "text-emerald-300" : score >= 40 ? "text-amber-300" : "text-rose-300"}`}>{score}%</p>
            <p className="text-xs text-slate-400 mt-1">Consistency rate</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {score >= 70 ? "Excellent consistency! You're in the top tier of DevTrackr learners." :
           score >= 40 ? "Good progress! Aim for 70%+ consistency to unlock compounding growth." :
           "Focus on showing up daily. Even 30 min counts toward your streak and consistency score."}
        </p>
      </div>
    </div>
  );
}
