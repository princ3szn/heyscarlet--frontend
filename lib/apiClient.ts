import { getAccessToken, setAccessToken, clearAccessToken } from "@/store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export interface TokenResponse {
  access_token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  onboarding_complete: boolean;
}

export interface ConversationResponse {
  id: string;
  title: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface UserMemory {
  id: string;
  user_id: string;
  key: string;
  value: string;
  source: string;
  status: "active" | "latent" | "user_reopened";
  sensitivity_flag: boolean;
  sessions_since_surfaced: number;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Core fetch wrapper
// ----------------------------------------------------------------

/**
 * One flag guards against concurrent refresh attempts.
 * If two requests 401 at the same moment, only one refresh call
 * goes out; the second waits for the same promise to resolve.
 */
let refreshPromise: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        clearAccessToken();
        return null;
      }

      const data: TokenResponse = await res.json();
      setAccessToken(data.access_token);
      return data.access_token;
    } catch {
      clearAccessToken();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Wraps fetch with:
 * 1. Automatic Authorization header injection
 * 2. credentials: "include" on every request (sends the cookie)
 * 3. One silent refresh attempt on 401, then retry
 * 4. Redirect to /auth if refresh also fails
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const makeRequest = (token: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

  let res = await makeRequest(getAccessToken());

  // FIX: Added !path.includes("/login") so it doesn't refresh the page on bad passwords
  if (res.status === 401 && !path.includes("/login")) {
    const newToken = await silentRefresh();

    if (!newToken) {
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
      throw new Error("Session expired. Please sign in again.");
    }

    res = await makeRequest(newToken);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ----------------------------------------------------------------
// Auth endpoints
// ----------------------------------------------------------------
export const authApi = {
  register: (payload: {
    email: string;
    password: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }) =>
    apiFetch<TokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiFetch<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: () => silentRefresh(),

  logout: () =>
    apiFetch<void>("/api/v1/auth/logout", { method: "POST" }),

  me: () => apiFetch<UserResponse>("/api/v1/auth/me"),

  completeOnboarding: () =>
    apiFetch<UserResponse>("/api/v1/auth/me/onboarding", { method: "PATCH" }),

  forgotPassword: (email: string) => 
    apiFetch<unknown>("/api/v1/auth/forgot_password", { 
      method: "POST", 
      body: JSON.stringify({ email }) 
    }),
    
  resetPassword: (token: string, new_password: string) => 
    apiFetch<unknown>("/api/v1/auth/reset_password", { 
      method: "POST", 
      body: JSON.stringify({ token, new_password }) 
    }),

  changePassword: (payload: { old_password: string; new_password: string }) =>
    apiFetch<void>("/api/v1/auth/change_password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ----------------------------------------------------------------
// Chat endpoints
// ----------------------------------------------------------------
export const chatApi = {
  listConversations: () =>
    apiFetch<ConversationResponse[]>("/api/v1/chat/conversations"),

  createConversation: (payload?: { title?: string }) =>
    apiFetch<ConversationResponse>("/api/v1/chat/conversations", {
      method: "POST",
      body: JSON.stringify({ title: payload?.title ?? null }),
    }),

  getMessages: (conversationId: string) =>
    apiFetch<MessageResponse[]>(`/api/v1/chat/conversations/${conversationId}/messages`),

  archiveConversation: (conversationId: string) =>
    apiFetch<ConversationResponse>(`/api/v1/chat/conversations/${conversationId}/archive`, {
      method: "PATCH",
    }),

  /**
   * Streaming chat — returns a raw Response so the caller can
   * consume the ReadableStream directly.
   *
   * Unlike apiFetch, this can't just re-run makeRequest internally
   * on 401 and return parsed JSON — the caller needs the raw
   * Response/body stream. So we do the same refresh-and-retry dance,
   * but still hand back a Response at the end.
   */
  stream: async (payload: { message: string; conversation_id?: string }) => {
    const makeStreamRequest = (token: string | null) =>
      fetch(`${BASE_URL}/api/v1/chat/stream`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

    let token = getAccessToken();

    // If there's no token in memory at all (e.g. very first load edge case),
    // try to get one before we even attempt the request.
    if (!token) {
      token = await silentRefresh();
    }

    let res = await makeStreamRequest(token);

    // Access token expired mid-session (15 min expiry). Refresh once
    // off the httpOnly cookie and retry the stream request transparently.
    if (res.status === 401) {
      const newToken = await silentRefresh();

      if (!newToken) {
        // Refresh token itself is gone/invalid — genuinely logged out.
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
        throw new Error("Session expired. Please sign in again.");
      }

      res = await makeStreamRequest(newToken);
    }

    return res;
  },
};

// ----------------------------------------------------------------
// Memory endpoints
// ----------------------------------------------------------------
export const memoryApi = {
  getMemories: () => 
    apiFetch<UserMemory[]>("/api/v1/memory"),

  saveMemory: (payload: { key: string; value: string; source?: string; sensitivity_flag?: boolean }) =>
    apiFetch<UserMemory>("/api/v1/memory", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};