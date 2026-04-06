import { Router } from "express";
import { supabase } from "../lib/supabase";
const router = Router();
router.get("/", async (_req, res) => {
    const [usersRes, transactionsRes, apiCallsRes] = await Promise.all([
        supabase.from("users").select("id, status, created_at", { count: "exact" }),
        supabase.from("transactions").select("amount, type"),
        supabase.from("api_calls").select("id", { count: "exact" }),
    ]);
    const users = usersRes.data ?? [];
    const totalUsers = usersRes.count ?? users.length;
    const activeUsers = users.filter((u) => u["status"] === "active").length;
    const revenue = (transactionsRes.data ?? [])
        .filter((t) => t["type"] === "purchase")
        .reduce((sum, t) => sum + (t["amount"] || 0), 0);
    const apiCalls = apiCallsRes.count ?? 0;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const [newUsersRes, prevUsersRes] = await Promise.all([
        supabase.from("users").select("id", { count: "exact" }).gte("created_at", thirtyDaysAgo),
        supabase
            .from("users")
            .select("id", { count: "exact" })
            .gte("created_at", sixtyDaysAgo)
            .lt("created_at", thirtyDaysAgo),
    ]);
    const newUsers = newUsersRes.count ?? 0;
    const prevUsers = prevUsersRes.count ?? 0;
    const userGrowth = prevUsers > 0 ? Math.round(((newUsers - prevUsers) / prevUsers) * 100) : 0;
    res.json({
        totalUsers,
        activeUsers,
        revenue,
        apiCalls,
        userGrowth,
        activeGrowth: 0,
        revenueGrowth: 0,
        apiGrowth: 0,
    });
});
export default router;
