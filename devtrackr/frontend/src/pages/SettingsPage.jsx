import { useState, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { api } from "../services/api";

const LEVEL_TITLES = ["Newcomer", "Apprentice", "Developer", "Builder", "Engineer", "Architect", "Master", "Expert", "Legend", "Guru", "Grandmaster"];

function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || "Developer";
}

function getXPProgress(xp, level) {
  const base = 100;
  const required = base * Math.pow(1.5, level - 1);
  const prevRequired = level > 1 ? base * Math.pow(1.5, level - 2) : 0;
  const progress = ((xp - prevRequired) / (required - prevRequired)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export default function SettingsPage({ token, user, onUserUpdate }) {
  const [form, setForm] = useState({ name: "", bio: "", location: "", github_url: "", avatar_url: "", is_public: true });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!token) return;
    api.getSettings(token).then((s) => {
      setSettings(s);
      setForm({
        name: s.name || "",
        bio: s.bio || "",
        location: s.location || "",
        github_url: s.github_url || "",
        avatar_url: s.avatar_url || "",
        is_public: s.is_public !== false,
      });
    }).catch(() => {});
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateSettings(token, form);
      setSaved(true);
      onUserUpdate?.({ ...user, name: form.name });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const lvl = settings?.level || user?.level || 1;
  const xp = settings?.xp || user?.xp || 0;
  const xpPct = getXPProgress(xp, lvl);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-violet-700 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-sky-900/40">
              {(form.name || user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-black text-black shadow">{lvl}</div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">{form.name || "Your Name"}</h2>
            <p className="text-sm text-sky-300 font-medium">{getLevelTitle(lvl)} &bull; Level {lvl}</p>
            {settings?.created_at && (
              <p className="text-xs text-slate-500 mt-0.5">Member since {new Date(settings.created_at).getFullYear()}</p>
            )}
          </div>
        </div>

        {/* XP Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>⚡ {xp.toLocaleString()} XP</span>
            <span>Level {lvl} → {lvl + 1}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-500 progress-animated" style={{width: `${xpPct}%`}} />
          </div>
          <p className="text-xs text-slate-500 mt-1">{xpPct}% to Level {lvl + 1}</p>
        </div>

        {/* Achievement badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(settings?.streak || user?.streak || 0) >= 7 && <span className="rounded-full bg-amber-500/15 border border-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300">🔥 Week Warrior</span>}
          {(settings?.streak || user?.streak || 0) >= 30 && <span className="rounded-full bg-orange-500/15 border border-orange-400/20 px-3 py-1 text-xs font-semibold text-orange-300">🏆 Month Master</span>}
          {(settings?.longest_streak || user?.longest_streak || 0) >= 14 && <span className="rounded-full bg-violet-500/15 border border-violet-400/20 px-3 py-1 text-xs font-semibold text-violet-300">💪 Iron Will</span>}
          {lvl >= 5 && <span className="rounded-full bg-sky-500/15 border border-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-300">⭐ Rising Star</span>}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4">✏️ Edit Profile</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Display Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mumbai, India" />
          </div>
          <div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Bio</span>
              <textarea
                className="field resize-none"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell the community about your learning journey..."
              />
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="GitHub URL" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/username" />
            <Input label="Avatar URL" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
            <input
              id="public"
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
              className="w-4 h-4 rounded accent-sky-500"
            />
            <label htmlFor="public" className="text-sm text-slate-300 cursor-pointer">
              <span className="font-medium text-white">Public Profile</span> — appear on the Leaderboard
            </label>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
            </Button>
            {saved && <span className="text-emerald-400 text-sm font-medium">Profile updated successfully!</span>}
          </div>
        </form>
      </div>

      {/* Stats Panel */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4">📊 Your Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total XP", value: (xp || 0).toLocaleString(), icon: "⚡", tone: "sky" },
            { label: "Level", value: lvl, icon: "🏅", tone: "violet" },
            { label: "Current Streak", value: `${settings?.streak || user?.streak || 0}d`, icon: "🔥", tone: "amber" },
            { label: "Longest Streak", value: `${settings?.longest_streak || user?.longest_streak || 0}d`, icon: "🏆", tone: "orange" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 border border-white/8 p-3">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-lg font-black text-white">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About DevTrackr */}
      <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/8 to-blue-600/5 p-6">
        <h3 className="text-base font-bold text-white mb-3">🤖 About DevTrackr AI</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          DevTrackr uses <strong className="text-sky-300">OpenRouter AI</strong> for intelligent coaching. Fast, reliable, and powered by top LLMs.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { icon: "🧠", title: "Smart Analysis", desc: "AI analyses your learning patterns" },
            { icon: "📈", title: "Progress Tracking", desc: "Math-backed completion probability" },
            { icon: "🏆", title: "Leaderboard", desc: "Compete with Indian developers" },
            { icon: "⚡", title: "Cloud AI", desc: "Powered by OpenRouter — fast & reliable" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3">
              <span className="text-lg">{f.icon}</span>
              <div>
                <p className="text-xs font-semibold text-white">{f.title}</p>
                <p className="text-xs text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">DevTrackr v2.0 &bull; Built for India's developer community</p>
      </div>
    </div>
  );
}
