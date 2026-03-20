import Button from "./Button";
import ProgressBar from "./ProgressBar";
import { hours } from "../utils/format";
import { skillProgress } from "../utils/metrics";

export default function SkillCard({ skill, logs = [], selected, onSelect, onLog }) {
  const p = skillProgress(skill, logs);
  const tone = p.pct >= 70 ? "green" : p.pct >= 35 ? "yellow" : "red";
  const daysLeft = skill.deadline
    ? Math.max(0, Math.ceil((new Date(skill.deadline) - Date.now()) / 86400000))
    : null;

  return (
    <div
      onClick={() => onSelect?.(skill.id)}
      className={`group cursor-pointer rounded-2xl border p-4 transition duration-200 hover:-translate-y-1 ${
        selected
          ? "border-sky-500/50 bg-gradient-to-br from-sky-500/15 to-blue-600/10 shadow-xl shadow-sky-900/30"
          : "border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/7"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{skill.icon || "⚡"}</span>
          <div>
            <p className="font-semibold text-white text-sm leading-tight">{skill.name}</p>
            {daysLeft !== null && (
              <p className={`text-xs mt-0.5 ${daysLeft <= 3 ? "text-rose-400" : daysLeft <= 7 ? "text-amber-400" : "text-slate-500"}`}>
                {daysLeft === 0 ? "🔴 Due today!" : `${daysLeft}d left`}
              </p>
            )}
          </div>
        </div>
        <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
          p.pct >= 70 ? "bg-emerald-500/20 text-emerald-300" :
          p.pct >= 35 ? "bg-amber-500/20 text-amber-300" :
          "bg-rose-500/20 text-rose-300"
        }`}>{p.pct}%</span>
      </div>

      <ProgressBar value={p.pct} tone={tone} height="h-1.5" />

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">{hours(p.completed)} done</span>
        <span className="text-slate-500">{hours(p.remaining)} left</span>
      </div>

      <div className="mt-3 flex gap-1.5">
        <Button
          size="sm"
          variant={selected ? "primary" : "secondary"}
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); onSelect?.(skill.id); }}
        >
          View
        </Button>
        <Button
          size="sm"
          variant="success"
          onClick={(e) => { e.stopPropagation(); onLog?.(skill.id); }}
        >
          ⚡ Log
        </Button>
      </div>
    </div>
  );
}
