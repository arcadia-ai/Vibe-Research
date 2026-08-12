import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type AuthState = {
  authenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((response) => response.json())
      .then((data) => setAuthenticated(Boolean(data.authenticated)))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(() => ({
    authenticated,
    loading,
    login: async (password) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "登录失败");
      }
      setAuthenticated(true);
    },
    logout: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthenticated(false);
    },
  }), [authenticated, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const state = useContext(AuthContext);
  if (!state) throw new Error("useAuth must be used within AuthProvider");
  return state;
}
