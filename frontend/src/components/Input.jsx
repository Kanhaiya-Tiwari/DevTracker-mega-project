export default function Input({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>}
      <input className="field" {...props} />
    </label>
  );
}
