import { toast } from "sonner";

const BASE_URL = "";

function getToken(): string | null {
  return localStorage.getItem("admin_jwt");
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) { toast.error("Unauthorized — check your JWT token"); return null; }
    if (res.status === 403) { toast.error("Forbidden — you don't have permission for this action"); return null; }
    if (res.status === 404) { toast.error("Resource not found"); return null; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error((err as { message?: string }).message ?? `Request failed (${res.status})`);
      return null;
    }
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch {
    toast.error(`Cannot reach backend at ${BASE_URL || "/"}`);
    return null;
  }
}

export interface User {
  id: string;
  email: string;
  username: string;
  status: "active" | "banned" | "suspended" | "expired";
  verified: boolean;
  credits: number;
  role: string;
  created_at: string;
  account_expiry?: string | null;
  public_api_key?: string | null;
  last_login?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "refund" | "bonus" | "deduction" | "transfer";
  description: string;
  created_at: string;
  users?: { email: string };
}

export interface HWID {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  blacklisted: boolean;
  last_seen: string;
  user_email?: string;
  users?: { email: string };
  browser?: string | null;
  os?: string | null;
  device_type?: string | null;
  restriction_type?: "time_limit" | "manual_block" | null;
  restriction_end_time?: string | null;
}

export interface DeviceSession {
  id: string;
  user_id: string;
  device_id: string;
  browser?: string | null;
  os?: string | null;
  device_type?: string | null;
  login_time: string;
  last_activity: string;
  status: "active" | "expired";
  users?: { email: string; username: string };
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface Metrics {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  apiCalls: number;
  userGrowth: number;
  activeGrowth: number;
  revenueGrowth: number;
  apiGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  users: number;
  revenue: number;
  apiCalls: number;
}

export const usersApi = {
  getAll: () => request<User[]>("GET", "/api/users").then((d) => d ?? []),

  getExpiringSoon: () => request<User[]>("GET", "/api/users/expiring-soon").then((d) => d ?? []),

  create: (payload: { username: string; email: string; role?: string }) =>
    request<User>("POST", "/api/users", payload),

  ban: (id: string) => request<User>("PUT", `/api/users/${id}/ban`),
  unban: (id: string) => request<User>("PUT", `/api/users/${id}/unban`),
  verify: (id: string) => request<User>("PUT", `/api/users/${id}/verify`),

  setExpiry: (id: string, payload: {
    years?: number; months?: number; days?: number;
    hours?: number; minutes?: number; seconds?: number; manualDate?: string;
  }) => request<User>("POST", `/api/users/${id}/set-expiry`, payload),

  extendExpiry: (id: string, days: number, hours?: number) =>
    request<User>("POST", `/api/users/${id}/extend-expiry`, { days, hours: hours ?? 0 }),

  resetPassword: (id: string, newPassword?: string) =>
    request<{ id: string; username: string; email: string; temporaryPassword: string }>(
      "POST", `/api/users/${id}/reset-password`, newPassword ? { newPassword } : {}
    ),

  regenerateApiKey: (id: string) => request<User>("POST", `/api/users/${id}/api-key/regenerate`),
  revokeApiKey: (id: string) => request<User>("DELETE", `/api/users/${id}/api-key`),

  verifyApiKey: (key: string) =>
    request<{ valid: boolean; user: User }>("GET", `/api/users/verify-api-key?key=${encodeURIComponent(key)}`),

  deleteUser: (id: string) => request<null>("DELETE", `/api/users/${id}`),
};

export const transactionsApi = {
  getAll: () => request<Transaction[]>("GET", "/api/transactions").then((d) => d ?? []),
};

export const hwidsApi = {
  getAll: () => request<HWID[]>("GET", "/api/hwids").then((d) => d ?? []),
  delete: (id: string) => request<null>("DELETE", `/api/hwids/${id}`),
  setBlacklist: (id: string, blacklisted: boolean) =>
    request<HWID>("PUT", `/api/hwids/${id}/blacklist`, { blacklisted }),
  restrict: (id: string, hours: number, minutes: number, seconds: number) =>
    request<HWID>("PUT", `/api/hwids/${id}/restrict`, { hours, minutes, seconds }),
  manualBlock: (id: string, reason?: string) =>
    request<HWID>("PUT", `/api/hwids/${id}/manual-block`, { reason }),
  unblock: (id: string) => request<HWID>("PUT", `/api/hwids/${id}/unblock`),
};

export const sessionsApi = {
  getActive: () => request<DeviceSession[]>("GET", "/api/sessions").then((d) => d ?? []),
  getByUser: (userId: string) =>
    request<DeviceSession[]>("GET", `/api/sessions/user/${userId}`).then((d) => d ?? []),
  forceLogout: (sessionId: string) => request<DeviceSession>("DELETE", `/api/sessions/${sessionId}`),
  logoutAllForUser: (userId: string) =>
    request<{ message: string }>("DELETE", `/api/sessions/user/${userId}/all`),
  createOrUpdate: (payload: {
    user_id: string; device_id: string; browser?: string; os?: string; device_type?: string;
  }) => request<DeviceSession>("POST", "/api/sessions", payload),
};

export const auditLogsApi = {
  getAll: () => request<AuditLog[]>("GET", "/api/audit-logs").then((d) => d ?? []),
};

export const metricsApi = {
  getDashboard: () =>
    request<Metrics>("GET", "/api/metrics").then(
      (d) => d ?? {
        totalUsers: 0, activeUsers: 0, revenue: 0, apiCalls: 0,
        userGrowth: 0, activeGrowth: 0, revenueGrowth: 0, apiGrowth: 0,
      }
    ),
  getChartData: () =>
    request<ChartDataPoint[]>("GET", "/api/chart-data").then((d) => d ?? []),
};

export const creditsApi = {
  addCredits: async (userId: string, amount: number, description?: string): Promise<boolean> => {
    const res = await request("PUT", `/api/users/${userId}/credits/add`, {
      amount: Math.abs(amount),
      description: description ?? "Manual credit addition",
    });
    return res !== null;
  },
  removeCredits: async (userId: string, amount: number, description?: string): Promise<boolean> => {
    const res = await request("PUT", `/api/users/${userId}/credits/remove`, {
      amount: Math.abs(amount),
      description: description ?? "Manual credit deduction",
    });
    return res !== null;
  },
};

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User } | null> => {
    const res = await request<{ token: string; user: User }>("POST", "/auth/login", { email, password });
    if (res?.token) localStorage.setItem("admin_jwt", res.token);
    return res;
  },
  logout: () => localStorage.removeItem("admin_jwt"),
};
