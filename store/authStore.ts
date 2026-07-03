import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

// SECURITY FIX: Removed sessionStorage completely. 
// The token now lives purely in JavaScript memory, making it immune to XSS attacks.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  clearAccessToken: () => {
    set({ accessToken: null });
  },
}));

export const getAccessToken = () => useAuthStore.getState().accessToken;

export const setAccessToken = (token: string) =>
  useAuthStore.getState().setAccessToken(token);

export const clearAccessToken = () =>
  useAuthStore.getState().clearAccessToken();