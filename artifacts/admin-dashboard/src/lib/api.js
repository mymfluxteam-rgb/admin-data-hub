import { toast } from "sonner";
const BASE_URL = "";
function getToken() {
    return localStorage.getItem("admin_jwt");
}
async function request(method, path, body) {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token)
        headers["Authorization"] = `Bearer ${token}`;
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (res.status === 401) {
            toast.error("Unauthorized — check your JWT token");
            return null;
        }
        if (res.status === 403) {
            toast.error("Forbidden — you don't have permission for this action");
            return null;
        }
        if (res.status === 404) {
            toast.error("Resource not found");
            return null;
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            toast.error(err.message ?? `Request failed (${res.status})`);
            return null;
        }
        if (res.status === 204)
            return null;
        return (await res.json());
    }
    catch {
        toast.error(`Cannot reach backend at ${BASE_URL || "/"}`);
        return null;
    }
}
export const usersApi = {
    getAll: () => request("GET", "/api/users").then((d) => d ?? []),
    getExpiringSoon: () => request("GET", "/api/users/expiring-soon").then((d) => d ?? []),
    create: (payload) => request("POST", "/api/users", payload),
    ban: (id) => request("PUT", `/api/users/${id}/ban`),
    unban: (id) => request("PUT", `/api/users/${id}/unban`),
    activate: (id) => request("PUT", `/api/users/${id}/activate`),
    verify: (id) => request("PUT", `/api/users/${id}/verify`),
    setExpiry: (id, payload) => request("POST", `/api/users/${id}/set-expiry`, payload),
    extendExpiry: (id, days, hours) => request("POST", `/api/users/${id}/extend-expiry`, { days, hours: hours ?? 0 }),
    resetPassword: (id, newPassword) => request("POST", `/api/users/${id}/reset-password`, newPassword ? { newPassword } : {}),
    regenerateApiKey: (id) => request("POST", `/api/users/${id}/api-key/regenerate`),
    revokeApiKey: (id) => request("DELETE", `/api/users/${id}/api-key`),
    verifyApiKey: (key) => request("GET", `/api/users/verify-api-key?key=${encodeURIComponent(key)}`),
    deleteUser: (id) => request("DELETE", `/api/users/${id}`),
    changePlan: (id, plan_id) => request("PUT", `/api/users/${id}/plan`, { plan_id }),
};

export const plansApi = {
    getAll: () => request("GET", "/api/plans").then((d) => d ?? []),
    provision: () => request("POST", "/api/me/provision"),
};
export const transactionsApi = {
    getAll: () => request("GET", "/api/transactions").then((d) => d ?? []),
};
export const hwidsApi = {
    getAll: () => request("GET", "/api/hwids").then((d) => d ?? []),
    delete: (id) => request("DELETE", `/api/hwids/${id}`),
    setBlacklist: (id, blacklisted) => request("PUT", `/api/hwids/${id}/blacklist`, { blacklisted }),
    restrict: (id, hours, minutes, seconds) => request("PUT", `/api/hwids/${id}/restrict`, { hours, minutes, seconds }),
    manualBlock: (id, reason) => request("PUT", `/api/hwids/${id}/manual-block`, { reason }),
    unblock: (id) => request("PUT", `/api/hwids/${id}/unblock`),
};
export const sessionsApi = {
    getActive: () => request("GET", "/api/sessions").then((d) => d ?? []),
    getByUser: (userId) => request("GET", `/api/sessions/user/${userId}`).then((d) => d ?? []),
    forceLogout: (sessionId) => request("DELETE", `/api/sessions/${sessionId}`),
    logoutAllForUser: (userId) => request("DELETE", `/api/sessions/user/${userId}/all`),
    createOrUpdate: (payload) => request("POST", "/api/sessions", payload),
};
export const auditLogsApi = {
    getAll: () => request("GET", "/api/audit-logs").then((d) => d ?? []),
};
export const metricsApi = {
    getDashboard: () => request("GET", "/api/metrics").then((d) => d ?? {
        totalUsers: 0, activeUsers: 0, revenue: 0, apiCalls: 0,
        userGrowth: 0, activeGrowth: 0, revenueGrowth: 0, apiGrowth: 0,
    }),
    getChartData: () => request("GET", "/api/chart-data").then((d) => d ?? []),
};
export const creditsApi = {
    addCredits: async (userId, amount, description) => {
        const res = await request("PUT", `/api/users/${userId}/credits/add`, {
            amount: Math.abs(amount),
            description: description ?? "Manual credit addition",
        });
        return res !== null;
    },
    removeCredits: async (userId, amount, description) => {
        const res = await request("PUT", `/api/users/${userId}/credits/remove`, {
            amount: Math.abs(amount),
            description: description ?? "Manual credit deduction",
        });
        return res !== null;
    },
};
export const userApiKeysApi = {
    getAll: (userId) => {
        const url = userId ? `/api/user-api-keys?user_id=${encodeURIComponent(userId)}` : "/api/user-api-keys";
        return request("GET", url).then((d) => d ?? []);
    },
    generate: (appName, userId) => request("POST", "/api/user-api-keys", { app_name: appName, user_id: userId }),
    revoke: (id) => request("POST", `/api/user-api-keys/${id}/revoke`, {}),
    delete: (id) => request("DELETE", `/api/user-api-keys/${id}`),
};
export const applicationsApi = {
    getAll: () => request("GET", "/api/applications").then((d) => d ?? []),
    get: (id) => request("GET", `/api/applications/${id}`),
    create: (payload) => request("POST", "/api/applications", payload),
    update: (id, payload) => request("PUT", `/api/applications/${id}`, payload),
    rotateSecret: (id) => request("POST", `/api/applications/${id}/rotate-secret`),
    delete: async (id) => {
        const token = localStorage.getItem("admin_jwt");
        const res = await fetch(`/api/applications/${id}`, {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return res.ok || res.status === 204;
    },
};
export const licensesApi = {
    getAll: (appId) => {
        const url = appId ? `/api/licenses?app_id=${encodeURIComponent(appId)}` : "/api/licenses";
        return request("GET", url).then((d) => d ?? []);
    },
    get: (id) => request("GET", `/api/licenses/${id}`),
    create: (payload) => request("POST", "/api/licenses", payload),
    setStatus: (id, status) => request("PUT", `/api/licenses/${id}/status`, { status }),
    update: (id, payload) => request("PUT", `/api/licenses/${id}`, payload),
    delete: async (id) => {
        const token = localStorage.getItem("admin_jwt");
        const res = await fetch(`/api/licenses/${id}`, {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return res.ok || res.status === 204;
    },
};
export const planApi = {
    getMyPlan: () => request("GET", "/api/me/plan").then((d) => d ?? {
        planName: null,
        maxApplications: null,
        licensedUsers: null,
        currentApplications: 0,
        currentLicenses: 0,
    }),
};
export const authApi = {
    login: async (email, password) => {
        const res = await request("POST", "/auth/login", { email, password });
        if (res?.token)
            localStorage.setItem("admin_jwt", res.token);
        return res;
    },
    logout: () => localStorage.removeItem("admin_jwt"),
};
