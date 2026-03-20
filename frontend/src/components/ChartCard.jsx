export default function ChartCard({ title, subtitle, data = [], color = "sky" }) {
  const max = Math.max(1, ...data.map((x) => x.value));
  const gradients = {
    sky:    "from-sky-500 to-blue-600",
    green:  "from-emerald-500 to-teal-600",
    yellow: "from-amber-500 to-orange-600",
    purple: "from-violet-500 to-purple-600",
    pink:   "from-pink-500 to-rose-600",
    violet: "from-violet-500 to-purple-600",
  };
  const glows = {
    sky: "shadow-sky-900/40", green: "shadow-emerald-900/40", yellow: "shadow-amber-900/40",
    purple: "shadow-violet-900/40", pink: "shadow-pink-900/40", violet: "shadow-violet-900/40",
  };
  const grad = gradients[color] || gradients.sky;
  const glow = glows[color] || glows.sky;
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5 group">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-28 text-slate-500 text-sm">No data yet</div>
      ) : (
        <div className="mt-3 flex items-end gap-1.5 h-28">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
              <div className="w-full rounded-t-md overflow-hidden bg-white/5" style={{ height: "88px" }}>
                <div
                  className={`w-full rounded-t-md bg-gradient-to-t ${grad} shadow-sm ${glow} group-hover/bar:brightness-125 transition-all duration-300`}
                  style={{ height: `${(d.value / max) * 100}%`, marginTop: "auto" }}
                />
              </div>
              <span className="text-xs text-slate-500 truncate w-full text-center">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
