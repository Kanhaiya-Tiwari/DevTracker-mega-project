import { Trophy, Target, Flame, Star, Zap, Award, Gift, TrendingUp } from "lucide-react";

export default function RewardSection({ user, summary }) {
  const xpToNextLevel = Math.ceil(Math.sqrt((user?.level || 1) + 1) * 100);
  const currentXP = user?.xp || 0;
  const progress = (currentXP / xpToNextLevel) * 100;
  const streak = summary?.streak || 0;
  const level = user?.level || 1;

  const rewards = [
    { icon: <Zap className="w-5 h-5" />, title: "Daily Login", xp: 10, description: "Log in every day", unlocked: true },
    { icon: <Target className="w-5 h-5" />, title: "Goal Complete", xp: 50, description: "Complete a daily goal", unlocked: streak > 0 },
    { icon: <Star className="w-5 h-5" />, title: "Blog Post", xp: 30, description: "Write a blog post", unlocked: false },
    { icon: <Flame className="w-5 h-5" />, title: "7-Day Streak", xp: 100, description: "7 consecutive days", unlocked: streak >= 7 },
    { icon: <Award className="w-5 h-5" />, title: "30-Day Streak", xp: 500, description: "30 consecutive days", unlocked: streak >= 30 },
    { icon: <Gift className="w-5 h-5" />, title: "First Skill", xp: 200, description: "Create your first skill", unlocked: true },
  ];

  const achievements = [
    { icon: "🎯", title: "First Steps", description: "Created your first skill", unlocked: true },
    { icon: "🔥", title: "On Fire", description: "7-day streak achieved", unlocked: streak >= 7 },
    { icon: "⚡", title: "Speed Demon", description: "Logged 10 hours in a day", unlocked: false },
    { icon: "📚", title: "Scholar", description: "Reached Level 5", unlocked: level >= 5 },
    { icon: "🏆", title: "Champion", description: "Reached Level 10", unlocked: level >= 10 },
    { icon: "💎", title: "Diamond", description: "Reached Level 20", unlocked: level >= 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress Card */}
      <div className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-900/30 via-blue-900/20 to-violet-900/15 p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1200')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Current Level</p>
                <p className="text-3xl font-black text-white">Level {level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total XP</p>
              <p className="text-2xl font-bold text-sky-400">{currentXP.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Progress to Level {level + 1}</span>
              <span className="text-sky-400 font-semibold">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">{currentXP} / {xpToNextLevel} XP to next level</p>
        </div>
      </div>

      {/* Streak Card */}
      <div className="rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-900/30 via-amber-900/20 to-red-900/15 p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Current Streak</p>
              <p className="text-2xl font-bold text-white">{streak} Days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Multiplier</p>
            <p className="text-lg font-bold text-orange-400">
              {streak >= 30 ? "3x" : streak >= 14 ? "2x" : streak >= 7 ? "1.5x" : "1x"}
            </p>
          </div>
        </div>
      </div>

      {/* XP Rewards */}
      <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-green-900/15 p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            XP Rewards
          </h3>
          <div className="grid gap-3">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  reward.unlocked
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-800/50"
                }`}
              >
                <div className={`p-2 rounded-lg ${reward.unlocked ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-500"}`}>
                  {reward.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${reward.unlocked ? "text-white" : "text-slate-400"}`}>{reward.title}</p>
                  <p className="text-xs text-slate-500">{reward.description}</p>
                </div>
                <div className={`text-right ${reward.unlocked ? "text-emerald-400" : "text-slate-600"}`}>
                  <p className="font-bold">+{reward.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-pink-900/15 p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border text-center transition-all ${
                  achievement.unlocked
                    ? "border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20"
                    : "border-slate-700 bg-slate-800/50 opacity-50"
                }`}
              >
                <p className="text-3xl mb-2">{achievement.icon}</p>
                <p className={`text-sm font-semibold ${achievement.unlocked ? "text-white" : "text-slate-500"}`}>
                  {achievement.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
