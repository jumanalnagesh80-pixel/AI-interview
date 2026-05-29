// Frontend API client for the FastAPI backend.
// If the backend isn't reachable or NEXT_PUBLIC_API_URL is unset,
// the UI falls back to local data + localStorage.

export const API_URL =
  (typeof window !== "undefined" && (window as any).__API_URL__) ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

const TOKEN_KEY = "aceterview:token";
const USER_KEY = "aceterview:user";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  plan: string;
  xp: number;
  streak_days: number;
  avatar_url: string | null;
  created_at: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function setStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function logout() {
  setToken(null);
  setStoredUser(null);
}

async function request<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
  if (!API_URL) throw new Error("offline");
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (init?.auth !== false) {
    const t = getToken();
    if (t) headers["authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = json?.detail || json?.error || `HTTP ${res.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return json as T;
}

export const api = {
  // auth
  register: (email: string, name: string, password: string) =>
    request<{ access_token: string; user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
      auth: false,
    }),
  login: (email: string, password: string) =>
    request<{ access_token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    }),
  me: () => request<AuthUser>("/api/auth/me"),

  // exams
  listExams: (category?: string) =>
    request<any[]>(`/api/exams${category ? `?category=${encodeURIComponent(category)}` : ""}`, { auth: false }),
  getExam: (id: string) => request<any>(`/api/exams/${id}`, { auth: false }),
  submitExam: (
    id: string,
    payload: { answers: { question_id: string; picked: number; time_taken?: number }[]; duration_sec: number },
  ) => request<any>(`/api/exams/${id}/submit`, { method: "POST", body: JSON.stringify(payload) }),

  // leaderboard
  leaderboard: (period: "all" | "week" | "month" = "all", limit = 20) =>
    request<any[]>(`/api/leaderboard?period=${period}&limit=${limit}`, { auth: false }),

  // dashboard
  dashboard: () => request<any>("/api/dashboard/stats"),

  // score & resume
  score: (payload: { question: string; answer: string; expected?: string[] }) =>
    request<any>("/api/score", { method: "POST", body: JSON.stringify(payload), auth: false }),
  resume: (text: string, target: string) =>
    request<any>("/api/resume", { method: "POST", body: JSON.stringify({ text, target }) }),

  // practice
  practiceNext: (section?: string, count = 8) => {
    const qs = new URLSearchParams();
    if (section) qs.set("section", section);
    qs.set("count", String(count));
    return request<any>(`/api/practice/next?${qs.toString()}`, { auth: false });
  },
  practiceAnswer: (payload: { question_id: string; picked: number; time_taken_ms: number }) =>
    request<any>("/api/practice/answer", { method: "POST", body: JSON.stringify(payload) }),
  practiceDaily: () => request<any>("/api/practice/daily", { auth: false }),
  bookmarksList: () => request<any[]>("/api/practice/bookmarks"),
  bookmarkAdd: (question_id: string, note = "") =>
    request<any>("/api/practice/bookmarks", {
      method: "POST",
      body: JSON.stringify({ question_id, note }),
    }),
  bookmarkRemove: (id: number) =>
    request<void>(`/api/practice/bookmarks/${id}`, { method: "DELETE" }),

  // analytics
  analytics: () => request<any>("/api/analytics/me"),
};

export function isOnline() {
  return Boolean(API_URL);
}
