export default function ProgressBar({ value = 0, tone = "sky", height = "h-2.5", showLabel = false, animated = true }) {
  const capped = Math.min(100, Math.max(0, value));
  const colors = {
    sky:    "from-sky-400 to-blue-500",
    green:  "from-emerald-400 to-teal-500",
    yellow: "from-amber-400 to-yellow-500",
    red:    "from-rose-400 to-pink-500",
    purple: "from-violet-400 to-purple-500",
    orange: "from-orange-400 to-amber-500",
    pink:   "from-pink-400 to-rose-500",
    // Legacy
    violet: "from-violet-400 to-purple-500",
  };
  const colorClass = colors[tone] || colors.sky;
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{capped}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-white/8 overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-gradient-to-r ${colorClass} ${animated ? "progress-animated" : ""} shadow-sm`}
          style={{ width: animated ? `${capped}%` : `${capped}%` }}
        />
      </div>
    </div>
  );
}
