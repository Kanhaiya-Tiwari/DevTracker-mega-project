import { useEffect, useState } from "react";
import { api } from "../services/api";

const CATEGORIES = [
  { id: "xp",             label: "XP Champions",     emoji: "⚡", color: "sky" },
  { id: "streak",         label: "Streak Warriors",  emoji: "🔥", color: "amber" },
  { id: "longest_streak", label: "All-Time Legends",  emoji: "🏆", color: "violet" },
];

function PodiumCard({ leader, position }) {
  if (!leader) return <div className="flex-1" />;
  const configs = {
    1: { height: "h-32", badge: "rank-gold", label: "🥇", size: "w-16 h-16", ring: "ring-2 ring-amber-400" },
    2: { height: "h-24", badge: "rank-silver", label: "🥈", size: "w-13 h-13", ring: "ring-2 ring-slate-400" },
    3: { height: "h-20", badge: "rank-bronze", label: "🥉", size: "w-12 h-12", ring: "ring-2 ring-orange-500" },
  };
  const c = configs[position] || configs[3];
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${position === 1 ? "order-first md:order-2" : position === 2 ? "order-2 md:order-1" : "order-3"}`}>
      <div className={`${c.size} rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-lg font-black text-white ${c.ring} shadow-xl`}>
        {(leader.name || "?").charAt(0).toUpperCase()}
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white truncate max-w-24">{leader.name}</p>
        <p className="text-xs text-slate-400">Lvl {leader.level}</p>
        {leader.location && <p className="text-xs text-slate-500">📍 {leader.location}</p>}
      </div>
      <div className={`${c.height} w-full rounded-t-2xl flex flex-col items-center justify-start pt-3 shadow-xl ${c.badge}`}>
        <span className="text-xl">{c.label}</span>
        <span className="text-xs font-black mt-1">#1</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage({ token }) {
  const [category, setCategory] = useState("xp");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.getLeaderboard(token, category)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, category]);

  const leaders = data?.leaders || [];
  const myRank = data?.my_rank;
  const top3 = leaders.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">🏆 Leaderboard</h2>
            <p className="text-sm text-slate-400 mt-1">Compete with the best developers in India</p>
          </div>
          {myRank && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Your rank</p>
              <p className="text-3xl font-black text-amber-400">#{myRank}</p>
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition duration-200 flex items-center gap-1.5 ${category === cat.id ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-900/30" : "bg-white/8 border border-white/10 text-slate-300 hover:bg-white/15"}`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 gap-3">
          <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
          <span className="text-slate-400 text-sm">Loading rankings...</span>
        </div>
      ) : leaders.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-white font-semibold">No Rankings Yet</p>
          <p className="text-slate-400 text-sm mt-1">Be the first to make your mark. Log your hours now!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <h3 className="text-sm font-bold text-slate-300 mb-4 text-center uppercase tracking-wider">Top 3 Champions</h3>
              <div className="flex gap-3 items-end justify-center max-w-sm mx-auto">
                <PodiumCard leader={top3[1]} position={2} />
                <PodiumCard leader={top3[0]} position={1} />
                <PodiumCard leader={top3[2]} position={3} />
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Full Rankings</p>
              <span className="text-xs text-slate-500">{leaders.length} participants</span>
            </div>
            <div className="divide-y divide-white/5">
              {leaders.map((leader) => (
                <div key={leader.id}
                  className={`flex items-center gap-4 px-5 py-3.5 transition duration-150 ${leader.is_me ? "bg-sky-500/10 border-l-2 border-sky-500" : "hover:bg-white/4"}`}
                >
                  {/* Rank badge */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${leader.rank === 1 ? "rank-gold" : leader.rank === 2 ? "rank-silver" : leader.rank === 3 ? "rank-bronze" : "bg-white/8 text-slate-300"}`}>
                    {leader.rank <= 3 ? ["🥇", "🥈", "🥉"][leader.rank - 1] : `#${leader.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {(leader.name || "?").charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold truncate ${leader.is_me ? "text-sky-300" : "text-white"}`}>
                        {leader.name} {leader.is_me && <span className="text-xs text-sky-400">(You)</span>}
                      </p>
                    </div>
                    {leader.location && <p className="text-xs text-slate-500">📍 {leader.location}</p>}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-amber-400 font-bold">🔥 {leader.streak}</p>
                      <p className="text-xs text-slate-500">streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-sky-400 font-bold">⚡ {leader.xp.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">XP</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="text-xs text-violet-400 font-bold">Lvl {leader.level}</p>
                      <p className="text-xs text-slate-500">level</p>
                    </div>
                    <div className="text-center hidden lg:block">
                      <p className="text-xs text-emerald-400 font-bold">{leader.total_logs}</p>
                      <p className="text-xs text-slate-500">logs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational card */}
          <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/8 to-blue-600/5 p-5">
            <p className="text-sm font-bold text-sky-300 mb-1">💡 Pro Tip</p>
            <p className="text-slate-300 text-sm">The top learners on DevTrackr average <strong className="text-white">2.5 hours/day</strong> of focused practice. Consistency beats intensity — log every day, even for 30 minutes.</p>
          </div>
        </>
      )}
    </div>
  );
}
