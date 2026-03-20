export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  const base = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none ${sizes[size] || sizes.md}`;
  const variants = {
    primary:   "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-900/40 focus:ring-sky-500 gradient-shimmer",
    secondary: "bg-white/8 border border-white/12 text-slate-200 hover:bg-white/14 hover:border-white/20 focus:ring-slate-500",
    success:   "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-900/35 focus:ring-emerald-400",
    danger:    "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-900/35 focus:ring-rose-500",
    amber:     "bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-lg shadow-amber-900/30 focus:ring-amber-400",
    purple:    "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/35 focus:ring-violet-500 gradient-shimmer",
    ghost:     "border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400/50 focus:ring-sky-500",
    outline:   "border border-white/20 text-slate-200 hover:bg-white/8 hover:text-white focus:ring-slate-500",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
