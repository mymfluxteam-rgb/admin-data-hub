import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [hwidsRes, transactionsRes] = await Promise.all([
        supabase
            .from("hwids")
            .select("created_at")
            .eq("user_id", userId)
            .gte("created_at", thirtyDaysAgo)
            .order("created_at"),
        supabase
            .from("transactions")
            .select("amount, created_at")
            .eq("user_id", userId)
            .gte("created_at", thirtyDaysAgo)
            .order("created_at"),
    ]);

    const byDate = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        byDate[key] = { users: 0, revenue: 0, apiCalls: 0 };
    }

    for (const u of hwidsRes.data ?? []) {
        const key = u["created_at"].slice(0, 10);
        if (byDate[key]) byDate[key].users++;
    }

    for (const t of transactionsRes.data ?? []) {
        const key = t["created_at"].slice(0, 10);
        if (byDate[key]) byDate[key].revenue += t["amount"] || 0;
    }

    res.json(Object.entries(byDate).map(([date, vals]) => ({ date, ...vals })));
});

export default router;
