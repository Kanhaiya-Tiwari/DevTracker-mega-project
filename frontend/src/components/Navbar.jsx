export default function Navbar({ user, view, setView, onLogout }) {
  const tabs = [
    { id: "dashboard",   label: "Dashboard",   emoji: "🏠" },
    { id: "skill",       label: "Skills",       emoji: "🎯" },
    { id: "analytics",   label: "Analytics",    emoji: "📊" },
    { id: "chat",        label: "AI Coach",     emoji: "🤖" },
    { id: "leaderboard", label: "Leaderboard",  emoji: "🏆" },
    { id: "settings",    label: "Settings",     emoji: "⚙️" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5 mr-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-sky-900/40">D</div>
          <span className="font-black text-white text-base tracking-tight">Dev<span className="gradient-text">Trackr</span></span>
        </div>
        <nav className="flex gap-0.5 overflow-x-auto flex-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition duration-200 whitespace-nowrap flex items-center gap-1.5 ${view === t.id ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-900/40" : "text-slate-400 hover:text-white hover:bg-white/8"}`}
            >
              <span className="text-sm leading-none">{t.emoji}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="ml-2 flex items-center gap-2 shrink-0">
          {user && (
            <>
              <span className="hidden md:flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">🔥 {user.streak || 0}d</span>
              <span className="hidden lg:flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-300">⚡ Lvl {user.level || 1}</span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow hidden md:flex">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
            </>
          )}
          <button onClick={onLogout} className="rounded-lg border border-rose-500/30 bg-rose-500/8 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/20 transition duration-200 font-medium">Logout</button>
        </div>
      </div>
    </header>
  );
}
