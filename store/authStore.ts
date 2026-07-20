import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hs_token");
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getInitialToken(),

  setAccessToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hs_token", token);
    }
    set({ accessToken: token });
  },

  clearAccessToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hs_token");
    }
    set({ accessToken: null });
  },
}));

export const getAccessToken = () => useAuthStore.getState().accessToken;

export const setAccessToken = (token: string) =>
  useAuthStore.getState().setAccessToken(token);

export const clearAccessToken = () =>
  useAuthStore.getState().clearAccessToken();