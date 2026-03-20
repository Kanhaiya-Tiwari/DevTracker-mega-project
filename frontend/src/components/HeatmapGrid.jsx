export default function HeatmapGrid({ cells = [], weeks = 16 }) {
  const max = Math.max(1, ...cells.map((c) => c.value));
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const getColor = (val) => {
    if (!val) return "bg-white/5";
    const p = val / max;
    if (p >= 0.8) return "bg-sky-400";
    if (p >= 0.6) return "bg-sky-500/80";
    if (p >= 0.4) return "bg-sky-600/60";
    if (p >= 0.2) return "bg-sky-700/50";
    return "bg-sky-900/40";
  };
  const paddedCells = [...cells];
  while (paddedCells.length < weeks * 7) paddedCells.unshift({ value: 0, date: "" });
  const grid = [];
  for (let w = 0; w < weeks; w++) {
    grid.push(paddedCells.slice(w * 7, w * 7 + 7));
  }
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white">Activity Heatmap</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Less</span>
          {["bg-white/5", "bg-sky-900/40", "bg-sky-700/50", "bg-sky-500/80", "bg-sky-400"].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1">
          {days.map((d, i) => (
            <div key={i} className="w-3 h-3 text-xs text-slate-600 flex items-center justify-center">{d}</div>
          ))}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) => (
              <div
                key={di}
                title={cell.date ? `${cell.date}: ${cell.value}h` : ""}
                className={`w-3 h-3 rounded-sm transition-transform duration-150 hover:scale-125 cursor-pointer ${getColor(cell.value)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
