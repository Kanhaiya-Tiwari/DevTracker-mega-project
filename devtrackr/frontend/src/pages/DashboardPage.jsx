import { useMemo, useState, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import SkillCard from "../components/SkillCard";
import AIInsightCard from "../components/AIInsightCard";
import StatCard from "../components/StatCard";
import StudyTimer from "../components/StudyTimer";
import { greetingLine } from "../utils/format";
import { skillProgress } from "../utils/metrics";
import { api } from "../services/api";

const TIPS = [
  { icon: "💡", tip: "Spaced repetition beats cramming. Review yesterday's work for 5 min before starting today.", source: "Cognitive Science" },
  { icon: "⏱️", tip: "The Pomodoro Technique: 25 min focus, 5 min break. Your brain retains more in shorter bursts.", source: "Productivity Research" },
  { icon: "📈", tip: "Progress is non-linear. Days 10-20 feel like you're going backward. Push through — it's normal.", source: "Learning Psychology" },
  { icon: "🎤", tip: "Build in public. Write a tweet about what you learned today. Teaching forces clarity.", source: "The Feynman Technique" },
  { icon: "🔥", tip: "Your streak is your most valuable asset. Missing one day makes missing two 3x more likely.", source: "Habit Research" },
  { icon: "⏰", tip: "Track hours, not tasks. Hours give you objective data on your actual investment.", source: "Deliberate Practice" },
];

function AddSkillModal({ open, onClose, onCreate, loading, token }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⚡");
  const [totalHours, setTotalHours] = useState("60");
  const [dailyTarget, setDailyTarget] = useState("2");
  const [deadline, setDeadline] = useState(new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10));
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);

  async function fetchSuggestions() {
    if (!name.trim() || !token) return;
    setSugLoading(true);
    try {
      const res = await api.getSkillSuggestions(token, name, []);
      setSuggestions(res.suggestions || []);
    } catch { } finally { setSugLoading(false); }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm px-4">
      <div className="glass-card w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-white/10 slide-up">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📚</span>
          <h3 className="text-lg font-bold text-white">Add New Skill</h3>
        </div>
        <form className="grid gap-3 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onCreate({
                name,
                icon,
                total_hours: Number(totalHours),
                daily_target: Number(dailyTarget),
                deadline: new Date(deadline).toISOString(),
                difficulty: "medium",
                phases: [],
              });
              onClose();
            } catch (err) {
              alert(err?.message || "Failed to add skill");
            }
          }}
        >
          <div className="md:col-span-2 flex gap-2">
            <Input label="Skill Name" value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" placeholder="e.g. React, Python, DSA..." />
            <Input label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24" />
          </div>
          <Input label="Target Hours" type="number" min="10" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} required />
          <Input label="Daily Hours" type="number" step="0.25" min="0.25" value={dailyTarget} onChange={(e) => setDailyTarget(e.target.value)} required />
          <Input className="md:col-span-2" label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />

          {/* AI Suggestions */}
          <div className="md:col-span-2">
            <Button type="button" variant="ghost" size="sm" onClick={fetchSuggestions} disabled={sugLoading || !name.trim()}>
              {sugLoading ? "Getting AI suggestions..." : "🤖 Get AI Suggestions"}
            </Button>
            {suggestions.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <p className="text-xs text-slate-400 font-medium">Suggestions from AI:</p>
                {suggestions.map((s, i) => (
                  <button key={i} type="button"
                    onClick={() => { setName(s.name); setIcon(s.icon || "⚡"); setTotalHours(String(s.total_hours)); setDailyTarget(String(s.daily_target)); }}
                    className="w-full text-left rounded-xl border border-sky-500/20 bg-sky-500/8 p-2.5 hover:bg-sky-500/15 transition">
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-sky-300">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.total_hours}h total &bull; {s.why}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button disabled={loading}>{loading ? "Creating..." : "➕ Create Skill"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage({ skills, logsBySkill, selectedSkillId, setSelectedSkillId, summary, insight, onRefreshInsight, onAddSkill, onQuickLog, addSkillLoading, insightLoading, token }) {
  const [showModal, setShowModal] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [dailyTip, setDailyTip] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    api.getDailyTip(token, { skill_name: null, hours_completed: summary?.totalHours || 0, streak: summary?.streak || 0 })
      .then((r) => setDailyTip(r.tip))
      .catch(() => {});
  }, [token]);

  const selected = skills.find((s) => s.id === selectedSkillId) || skills[0] || null;
  const selectedProgress = useMemo(() => skillProgress(selected, selected ? logsBySkill[selected.id] || [] : []), [selected, logsBySkill]);

  const totalSkills = skills.length;
  const activeSkills = skills.filter((s) => {
    const p = skillProgress(s, logsBySkill[s.id] || []);
    return p.pct < 100;
  }).length;

  const currentTip = TIPS[tipIdx];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-900/30 via-blue-900/20 to-violet-900/15 p-5 shadow-2xl shadow-black/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-sky-500/10 to-violet-500/5 blur-3xl orb-move pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">{greetingLine(selectedProgress.pct || 0)}</h2>
              <p className="mt-1 text-sm text-slate-400">You have <strong className="text-white">{activeSkills}</strong> active skills in progress. Keep pushing!</p>
            </div>
            <Button onClick={() => setShowModal(true)} variant="primary" size="md" className="shrink-0 pulse-ring">
              ➕ Add Skill
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Skills Active" value={`${activeSkills}/${totalSkills}`} tone="purple" icon="🎯" />
          </div>
        </div>
      </section>

      {/* Daily AI Tip */}
      {(dailyTip || currentTip) && (
        <section className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/8 to-teal-600/5 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{currentTip.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-wide">{dailyTip ? "🤖 AI Coach Tip" : "Learning Tip"}</p>
                {!dailyTip && <span className="text-xs text-slate-500">&bull; {currentTip.source}</span>}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{dailyTip || currentTip.tip}</p>
            </div>
          </div>
        </section>
      )}

      {/* Study Timer */}
      <StudyTimer />

      {/* AI Insight */}
      {insight && (
        <AIInsightCard insight={insight} onRefresh={onRefreshInsight} loading={insightLoading} />
      )}

      {/* Skills Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">
            🎯 Your Skills
            <span className="ml-2 text-xs font-medium text-slate-400 bg-white/8 rounded-full px-2 py-0.5">{skills.length}</span>
          </h3>
          <p className="text-xs text-slate-500">Click a card to select</p>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/2 p-10 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-white font-semibold text-lg">No skills yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">Start your first skill and let AI guide your learning journey</p>
            <Button onClick={() => setShowModal(true)} variant="primary">
              ➕ Add Your First Skill
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                logs={logsBySkill[skill.id] || []}
                selected={skill.id === selectedSkillId}
                onSelect={setSelectedSkillId}
                onLog={(id) => onQuickLog(id, 1)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Weekly Plan from AI */}
      {insight?.weekly_plan && Array.isArray(insight.weekly_plan) && insight.weekly_plan.length > 0 && (
        <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/8 to-purple-600/5 p-5">
          <h3 className="text-sm font-bold text-violet-300 mb-3">🤖 AI Weekly Study Plan</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {insight.weekly_plan.map((day, i) => (
              <div key={i} className="rounded-xl bg-white/5 border border-white/8 p-2 text-center">
                <p className="text-xs font-bold text-slate-300">{day.day}</p>
                <p className="text-xs text-violet-300 mt-1 font-medium">{day.hours}h</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate" title={day.task}>{day.task?.split(" ").slice(0, 2).join(" ")}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Motivational Banner */}
      <section className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/8 via-rose-500/5 to-transparent p-5 text-center">
        <p className="text-2xl mb-2">💪</p>
        <p className="text-white font-bold">India's sharpest developers track every hour.</p>
        <p className="text-slate-400 text-sm mt-1">You're {summary.streak || 0} days into building something great. Don't break the chain.</p>
        <div className="mt-3 flex justify-center gap-3 flex-wrap">
          <span className="rounded-full bg-pink-500/15 border border-pink-400/20 px-3 py-1 text-xs font-semibold text-pink-300">🇮🇳 Made for India</span>
          <span className="rounded-full bg-sky-500/15 border border-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-300">🤖 AI-Powered</span>
          <span className="rounded-full bg-emerald-500/15 border border-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">🔒 100% Private</span>
        </div>
      </section>

      <AddSkillModal open={showModal} onClose={() => setShowModal(false)} onCreate={onAddSkill} loading={addSkillLoading} token={token} />
    </div>
  );
}
