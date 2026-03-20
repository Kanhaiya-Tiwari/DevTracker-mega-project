export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function hours(value) {
  return `${Number(value || 0).toFixed(1)}h`;
}

export function greetingLine(percent) {
  if (percent >= 90) return "Final sprint. Finish strong.";
  if (percent >= 60) return `Keep going, you're ${percent}% done.`;
  if (percent >= 30) return `Great start. You're ${percent}% done.`;
  return "Start today. Momentum beats motivation.";
}
