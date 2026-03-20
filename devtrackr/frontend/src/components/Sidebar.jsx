export default function Sidebar({ view, setView, user }) {
  const navGroups = [
    {
      label: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "🏠", desc: "Overview & stats" },
        { id: "skill", label: "Skills", icon: "🎯", desc: "Track your learning" },
        { id: "analytics", label: "Analytics", icon: "📊", desc: "Deep insights" },
      ],
    },
    {
      label: "AI & Community",
      items: [
        { id: "chat", label: "AI Coach", icon: "🤖", desc: "Ollama-powered" },
        { id: "leaderboard", label: "Leaderboard", icon: "🏆", desc: "Top performers" },
      ],
    },
    {
      label: "Account",
      items: [
        { id: "settings", label: "Settings", icon: "⚙️", desc: "Profile & prefs" },
      ],
    },
  ];

  return (
    <aside className="hidden md:block md:w-64 shrink-0">
      <div className="glass-card sticky top-4 rounded-2xl p-3 shadow-xl shadow-black/30 space-y-4">
        {/* User mini-card */}
        {user && (
          <div className="px-3 py-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-600/5 border border-sky-500/15">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-sky-300">Level {user.level || 1} • {user.xp || 0} XP</p>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <div className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
                <p className="text-xs text-amber-400 font-bold">🔥 {user.streak || 0}</p>
                <p className="text-xs text-slate-500">streak</p>
              </div>
              <div className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
                <p className="text-xs text-emerald-400 font-bold">⚡ {user.xp || 0}</p>
                <p className="text-xs text-slate-500">XP</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition duration-200 group ${
                    view === item.id
                      ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-900/30"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-xs leading-tight">{item.label}</p>
                    <p className={`text-xs truncate ${view === item.id ? "text-sky-200" : "text-slate-500"}`}>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
