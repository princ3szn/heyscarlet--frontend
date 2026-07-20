"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

interface AuthContextValue {
  ready: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { accessToken, setAccessToken, clearAccessToken } = useAuthStore();
  const [ready, setReady] = useState(false);

  // FIX: Strict Mode double-render guard. This mathematically guarantees
  // the refresh endpoint is only hit exactly once on load.
  const hasAttemptedRefresh = useRef(false);

  // On every fresh page load (or tab open), the access token is gone
  // from memory. Try a silent refresh using the httpOnly cookie so the
  // user does not have to log in again.
  useEffect(() => {
    if (hasAttemptedRefresh.current) return;
    hasAttemptedRefresh.current = true;

    authApi
      .refresh()
      .then((token) => {
        if (token) setAccessToken(token);
      })
      .catch(() => {
        // No valid cookie, leave accessToken null
      })
      .finally(() => setReady(true));
  }, [setAccessToken]);

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Even if the request fails, clear local state
    } finally {
      clearAccessToken();
      router.replace("/auth");
    }
  }

  // THE FIX: We stop the app from rendering ANY pages until the silent refresh finishes.
  // This prevents the Chat page from prematurely kicking the user out.
  if (!ready) {
    return <div style={{ height: "100vh", background: "var(--void)" }} />;
  }

  return (
    <AuthContext.Provider
      value={{
        ready,
        isAuthenticated: !!accessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
