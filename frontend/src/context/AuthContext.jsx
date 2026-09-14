import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../api";

const AuthContext = createContext(null);
const STORAGE_KEY = "servigo.session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setAuthToken(session?.token || null);
  }, [session]);

  function saveSession(data) {
    // data = { token, user }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
  }

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    saveSession(res.data);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post("/auth/register", payload);
    saveSession(res.data);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      login,
      register,
      logout,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
