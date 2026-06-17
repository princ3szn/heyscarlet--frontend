import { create } from "zustand";

const SESSION_KEY = "hs_token";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: typeof window !== "undefined"
    ? sessionStorage.getItem(SESSION_KEY)
    : null,

  setAccessToken: (token) => {
    sessionStorage.setItem(SESSION_KEY, token);
    set({ accessToken: token });
  },

  clearAccessToken: () => {
    sessionStorage.removeItem(SESSION_KEY);
    set({ accessToken: null });
  },
}));

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(SESSION_KEY);
  }
  return useAuthStore.getState().accessToken;
};

export const setAccessToken = (token: string) =>
  useAuthStore.getState().setAccessToken(token);

export const clearAccessToken = () =>
  useAuthStore.getState().clearAccessToken();