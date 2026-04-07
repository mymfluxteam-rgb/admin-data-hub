import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
    const userId = req.user.id;

    const [hwidsRes, sessionsRes, transactionsRes] = await Promise.all([
        supabase.from("hwids").select("id", { count: "exact" }).eq("user_id", userId),
        supabase
            .from("device_sessions")
            .select("id", { count: "exact" })
            .in(
                "app_id",
                supabase.from("applications").select("id").eq("owner_id", userId)
            ),
        supabase.from("transactions").select("amount").eq("user_id", userId),
    ]);

    const totalUsers = hwidsRes.count ?? 0;
    const activeUsers = sessionsRes.count ?? 0;
    const revenue = (transactionsRes.data ?? []).reduce(
        (sum, t) => sum + (t["amount"] || 0),
        0
    );

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

    const [newHwidsRes, prevHwidsRes] = await Promise.all([
        supabase
            .from("hwids")
            .select("id", { count: "exact" })
            .eq("user_id", userId)
            .gte("created_at", thirtyDaysAgo),
        supabase
            .from("hwids")
            .select("id", { count: "exact" })
            .eq("user_id", userId)
            .gte("created_at", sixtyDaysAgo)
            .lt("created_at", thirtyDaysAgo),
    ]);

    const newUsers = newHwidsRes.count ?? 0;
    const prevUsers = prevHwidsRes.count ?? 0;
    const userGrowth =
        prevUsers > 0 ? Math.round(((newUsers - prevUsers) / prevUsers) * 100) : 0;

    res.json({
        totalUsers,
        activeUsers,
        revenue,
        apiCalls: 0,
        userGrowth,
        activeGrowth: 0,
        revenueGrowth: 0,
        apiGrowth: 0,
    });
});

export default router;
