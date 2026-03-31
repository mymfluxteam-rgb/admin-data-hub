import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [usersRes, transactionsRes] = await Promise.all([
    supabase
      .from("users")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at"),
    supabase
      .from("transactions")
      .select("amount, type, created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at"),
  ]);

  const byDate: Record<string, { users: number; revenue: number; apiCalls: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    byDate[key] = { users: 0, revenue: 0, apiCalls: 0 };
  }

  for (const u of usersRes.data ?? []) {
    const key = (u as Record<string, string>)["created_at"].slice(0, 10);
    if (byDate[key]) byDate[key]!.users++;
  }

  for (const t of transactionsRes.data ?? []) {
    const tx = t as Record<string, unknown>;
    const key = (tx["created_at"] as string).slice(0, 10);
    if (byDate[key] && tx["type"] === "purchase") {
      byDate[key]!.revenue += (tx["amount"] as number) || 0;
    }
  }

  res.json(Object.entries(byDate).map(([date, vals]) => ({ date, ...vals })));
});

export default router;
