"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

interface AuthContextValue {
  ready: boolean; // true once boot refresh has resolved
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { accessToken, setAccessToken, clearAccessToken } = useAuthStore();
  const [ready, setReady] = useState(false);

  // On every fresh page load (or tab open), the access token is gone
  // from memory. Try a silent refresh using the httpOnly cookie so the
  // user does not have to log in again.
  useEffect(() => {
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
