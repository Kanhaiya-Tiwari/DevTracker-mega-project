export default function StatCard({ label, value, sub, tone = "default", icon, badge }) {
  const tones = {
    default: "bg-white/5 border border-white/10",
    green:   "bg-gradient-to-br from-emerald-500/12 to-teal-600/8 border border-emerald-400/20",
    yellow:  "bg-gradient-to-br from-amber-500/12 to-yellow-600/8 border border-amber-400/20",
    red:     "bg-gradient-to-br from-rose-500/12 to-pink-600/8 border border-rose-400/20",
    sky:     "bg-gradient-to-br from-sky-500/12 to-blue-600/8 border border-sky-400/20",
    purple:  "bg-gradient-to-br from-violet-500/12 to-purple-600/8 border border-violet-400/20",
    pink:    "bg-gradient-to-br from-pink-500/12 to-rose-600/8 border border-pink-400/20",
    orange:  "bg-gradient-to-br from-orange-500/12 to-amber-600/8 border border-orange-400/20",
    violet:  "bg-gradient-to-br from-violet-500/12 to-purple-600/8 border border-violet-400/20",
  };
  const textColors = {
    default: "text-white", green: "text-emerald-300", yellow: "text-amber-300",
    red: "text-rose-300", sky: "text-sky-300", purple: "text-violet-300",
    pink: "text-pink-300", orange: "text-orange-300", violet: "text-violet-300",
  };
  return (
    <div className={`rounded-2xl p-4 shadow-lg shadow-black/20 hover:-translate-y-1 transition duration-200 relative overflow-hidden ${tones[tone] || tones.default}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {icon && <div className="text-2xl mb-2">{icon}</div>}
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${textColors[tone] || "text-white"}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        {badge && <span className="text-lg">{badge}</span>}
      </div>
    </div>
  );
}
