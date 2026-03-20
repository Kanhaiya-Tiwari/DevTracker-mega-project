export function skillProgress(skill, logs = []) {
  const completed = logs.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  const target = Number(skill?.totalHours || 0);
  const remaining = Math.max(0, target - completed);
  const pct = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
  const days = Math.max(logs.length, 1);
  const dailyAvg = completed / days;
  return {
    completed,
    remaining,
    pct,
    dailyAvg,
  };
}

export function streakFromLogs(allLogs = []) {
  const uniqueDays = [...new Set(allLogs.map((l) => (l.date || "").slice(0, 10)).filter(Boolean))].sort().reverse();
  if (!uniqueDays.length) return 0;

  let cursor = new Date();
  const today = cursor.toISOString().slice(0, 10);
  if (uniqueDays[0] !== today) {
    cursor.setDate(cursor.getDate() - 1);
    const y = cursor.toISOString().slice(0, 10);
    if (uniqueDays[0] !== y) return 0;
  }

  let streak = 0;
  for (const day of uniqueDays) {
    const c = cursor.toISOString().slice(0, 10);
    if (day !== c) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function consistencyScore(logs = [], days = 14) {
  const today = new Date();
  const valid = new Set(
    logs
      .map((l) => new Date(l.date))
      .filter((d) => !Number.isNaN(d.getTime()) && (today - d) / 86400000 <= days)
      .map((d) => d.toISOString().slice(0, 10)),
  );
  return Math.round((valid.size / days) * 100);
}

export function weekSeries(logs = [], span = 7) {
  return Array.from({ length: span }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (span - i - 1));
    const key = d.toISOString().slice(0, 10);
    const total = logs.filter((l) => (l.date || "").slice(0, 10) === key).reduce((s, l) => s + Number(l.hours || 0), 0);
    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      value: Number(total.toFixed(2)),
    };
  });
}

export function monthSeries(logs = []) {
  return Array.from({ length: 4 }, (_, i) => {
    const start = new Date();
    start.setDate(start.getDate() - (28 - (i + 1) * 7));
    const end = new Date();
    end.setDate(end.getDate() - (21 - i * 7));
    const total = logs.reduce((sum, item) => {
      const d = new Date(item.date);
      if (d >= start && d < end) return sum + Number(item.hours || 0);
      return sum;
    }, 0);
    return { key: i + 1, label: `W${i + 1}`, value: Number(total.toFixed(2)) };
  });
}

export function heatmapCells(logs = [], weeks = 12) {
  const totals = logs.reduce((map, item) => {
    const k = (item.date || "").slice(0, 10);
    if (!k) return map;
    map[k] = (map[k] || 0) + Number(item.hours || 0);
    return map;
  }, {});

  const cells = [];
  for (let i = weeks * 7 - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, value: totals[key] || 0 });
  }
  return cells;
}
