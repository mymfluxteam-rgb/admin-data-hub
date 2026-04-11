import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
    const userId = req.user.id;

    const { data: userApps } = await supabase
        .from("applications")
        .select("id")
        .eq("owner_id", userId);

    const appIds = (userApps ?? []).map((a) => a.id);

    const [totalAppsRes, activeLicensesRes, totalLicensesRes, transactionsRes] =
        await Promise.all([
            supabase
                .from("applications")
                .select("id", { count: "exact", head: true })
                .eq("owner_id", userId),
            appIds.length > 0
                ? supabase
                      .from("licenses")
                      .select("id", { count: "exact", head: true })
                      .in("app_id", appIds)
                      .eq("status", "active")
                : Promise.resolve({ count: 0 }),
            appIds.length > 0
                ? supabase
                      .from("licenses")
                      .select("id", { count: "exact", head: true })
                      .in("app_id", appIds)
                : Promise.resolve({ count: 0 }),
            supabase.from("transactions").select("amount").eq("user_id", userId),
        ]);

    const totalApps = totalAppsRes.count ?? 0;
    const activeLicenses = activeLicensesRes.count ?? 0;
    const totalLicenses = totalLicensesRes.count ?? 0;
    const revenue = (transactionsRes.data ?? []).reduce(
        (sum, t) => sum + (t["amount"] || 0),
        0
    );

    const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const sixtyDaysAgo = new Date(
        Date.now() - 60 * 24 * 60 * 60 * 1000
    ).toISOString();

    const [newAppsRes, prevAppsRes] = await Promise.all([
        supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", userId)
            .gte("created_at", thirtyDaysAgo),
        supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", userId)
            .gte("created_at", sixtyDaysAgo)
            .lt("created_at", thirtyDaysAgo),
    ]);

    const newApps = newAppsRes.count ?? 0;
    const prevApps = prevAppsRes.count ?? 0;
    const appGrowth =
        prevApps > 0
            ? Math.round(((newApps - prevApps) / prevApps) * 100)
            : newApps > 0
            ? 100
            : 0;

    res.json({
        totalApps,
        activeLicenses,
        totalLicenses,
        revenue,
        appGrowth,
        activeGrowth: 0,
        revenueGrowth: 0,
        licenseGrowth: 0,
    });
});

export default router;
