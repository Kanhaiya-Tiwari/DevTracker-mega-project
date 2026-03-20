import Button from "./Button";

export default function AIInsightCard({ insight, onRefresh, loading }) {
  if (!insight) return null;
  const verdict = insight.completion_verdict || insight.verdict || "on_track";
  const tones = {
    on_track: { bg: "from-emerald-500/15 to-teal-600/10 border-emerald-400/25", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30", icon: "✅", label: "On Track" },
    at_risk:  { bg: "from-amber-500/15 to-orange-600/10 border-amber-400/25",   badge: "bg-amber-500/20 text-amber-300 border-amber-400/30",   icon: "⚠️", label: "At Risk"   },
    critical: { bg: "from-rose-500/15 to-pink-600/10 border-rose-400/25",       badge: "bg-rose-500/20 text-rose-300 border-rose-400/30",       icon: "🚨", label: "Critical"  },
  };
  const t = tones[verdict] || tones.on_track;
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${t.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <p className="text-sm font-bold text-white">AI Insight</p>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${t.badge}`}>{t.icon} {t.label}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
          {loading ? "..." : "↻ Refresh"}
        </Button>
      </div>
      {insight.coach_message && (
        <p className="text-sm text-slate-200 leading-relaxed mb-3">{insight.coach_message}</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {insight.immediate_action && (
          <div className="rounded-xl bg-white/5 p-3 border border-white/8">
            <p className="text-xs text-slate-400 font-medium mb-1">⚡ Today's Action</p>
            <p className="text-sm text-white">{insight.immediate_action}</p>
          </div>
        )}
        {insight.motivational_charge && (
          <div className="rounded-xl bg-white/5 p-3 border border-white/8">
            <p className="text-xs text-slate-400 font-medium mb-1">🔥 Fuel</p>
            <p className="text-sm font-semibold text-white">{insight.motivational_charge}</p>
          </div>
        )}
        {insight.top_insight && (
          <div className="rounded-xl bg-white/5 p-3 border border-white/8 sm:col-span-2">
            <p className="text-xs text-slate-400 font-medium mb-1">💡 Key Pattern</p>
            <p className="text-sm text-white">{insight.top_insight}</p>
          </div>
        )}
      </div>
      {Array.isArray(insight.risk_factors) && insight.risk_factors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {insight.risk_factors.map((r, i) => (
            <span key={i} className="rounded-full bg-rose-500/15 border border-rose-400/20 px-2 py-0.5 text-xs text-rose-300">
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
