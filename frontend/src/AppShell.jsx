import { useMemo, useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import SkillDetailPage from "./pages/SkillDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AIChatPage from "./pages/AIChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SettingsPage from "./pages/SettingsPage";
import BlogPage from "./pages/BlogPage";
import RewardSection from "./components/RewardSection";
import { useAuth } from "./hooks/useAuth";
import { useDevtrackrData } from "./hooks/useDevtrackrData";
import { NotificationProvider } from "./contexts/NotificationContext";

function AppContent() {
  const { token, user, loading: authLoading, login, register, logout } = useAuth();
  const [authView, setAuthView] = useState("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("devtrackr_theme") || "light";
    }
    return "light";
  });
  const [addSkillBusy, setAddSkillBusy] = useState(false);
  const [insightBusy, setInsightBusy] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    document.documentElement.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("devtrackr_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const {
    loading,
    error,
    skills,
    logsBySkill,
    selectedSkill,
    selectedLogs,
    selectedSkillId,
    setSelectedSkillId,
    allLogs,
    summary,
    insight,
    addSkill,
    addLog,
    refreshInsight,
  } = useDevtrackrData(token);

  async function onLogin(form) {
    setAuthBusy(true);
    setAuthError("");
    try {
      await login(form.email, form.password);
    } catch (e) {
      setAuthError(e.message || "Login failed");
    } finally {
      setAuthBusy(false);
    }
  }

  async function onRegister(form) {
    setAuthBusy(true);
    setAuthError("");
    try {
      await register(form);
    } catch (e) {
      setAuthError(e.message || "Registration failed");
    } finally {
      setAuthBusy(false);
    }
  }

  async function onAddSkill(payload) {
    setAddSkillBusy(true);
    try {
      await addSkill(payload);
    } finally {
      setAddSkillBusy(false);
    }
  }

  async function onQuickLog(skillId, amount = 1) {
    return await addLog({
      skill_id: skillId,
      hours: Number(amount),
      quality: "medium",
      notes: "Quick log",
    });
  }

  async function onRefreshInsight() {
    setInsightBusy(true);
    try {
      await refreshInsight();
    } finally {
      setInsightBusy(false);
    }
  }

  const content = useMemo(() => {
    if (view === "dashboard") {
      return (
        <DashboardPage
          skills={skills}
          logsBySkill={logsBySkill}
          selectedSkillId={selectedSkillId}
          setSelectedSkillId={setSelectedSkillId}
          summary={summary}
          insight={insight}
          onRefreshInsight={onRefreshInsight}
          onAddSkill={onAddSkill}
          addSkillLoading={addSkillBusy}
          insightLoading={insightBusy}
          token={token}
        />
      );
    }

    if (view === "skill") {
      return (
        <SkillDetailPage
          skill={selectedSkill}
          logs={selectedLogs}
          insight={insight}
          onLog={onQuickLog}
          onRefreshInsight={onRefreshInsight}
          insightLoading={insightBusy}
          token={token}
        />
      );
    }

    if (view === "analytics") {
      return <AnalyticsPage logs={allLogs} />;
    }

    if (view === "chat") {
      return <AIChatPage skill={selectedSkill} insight={insight} token={token} />;
    }

    if (view === "leaderboard") {
      return <LeaderboardPage token={token} />;
    }

    if (view === "settings") {
      return <SettingsPage token={token} user={user} onUserUpdate={() => {}} />;
    }

    if (view === "blog") {
      return <BlogPage token={token} user={user} />;
    }

    if (view === "rewards") {
      return <RewardSection user={user} summary={summary} />;
    }

    return <AIChatPage skill={selectedSkill} insight={insight} token={token} />;
  }, [
    view,
    skills,
    logsBySkill,
    selectedSkillId,
    setSelectedSkillId,
    summary,
    insight,
    addSkillBusy,
    insightBusy,
    selectedSkill,
    selectedLogs,
    allLogs,
    user,
    token,
  ]);

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-300">Loading...</div>;
  }

  if (!user) {
    if (authView === "login") {
      return (
        <LoginPage
          onSubmit={onLogin}
          onSwitch={() => setAuthView("register")}
          loading={authBusy}
          error={authError}
        />
      );
    }

    return (
      <RegisterPage
        onSubmit={onRegister}
        onSwitch={() => setAuthView("login")}
        loading={authBusy}
        error={authError}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-page text-primary">
      {theme === "dark" && (
        <>
          <div className="float-soft absolute -top-20 left-0 h-96 w-96 rounded-full bg-sky-500/8 blur-3xl" />
          <div className="float-soft absolute top-1/2 right-0 h-80 w-80 rounded-full bg-pink-500/6 blur-3xl" />
          <div className="float-soft absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-violet-500/6 blur-3xl" />
        </>
      )}
      <Navbar user={user} view={view} setView={setView} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />
      <div className="relative mx-auto flex max-w-7xl gap-4 px-4 py-4">
        <Sidebar view={view} setView={setView} user={user} />
        <main className="min-w-0 flex-1 space-y-4">
          {loading ? <div className="rounded-xl border border-slate-200/20 bg-surface-strong p-4 text-primary">Loading workspace...</div> : null}
          {error ? <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-800">{error}</div> : null}
          {content}
        </main>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
