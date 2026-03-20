import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "devtrackr_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }

    api.me(saved)
      .then((me) => {
        setToken(saved);
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const session = await api.login(email, password);
    const nextToken = session.access_token;
    const me = await api.me(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(me);
  }

  async function register(payload) {
    await api.register(payload);
    await login(payload.email, payload.password);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, loading, login, register, logout, setUser }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
