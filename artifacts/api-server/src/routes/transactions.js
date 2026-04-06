import { Router } from "express";
import { supabase } from "../lib/supabase";
const router = Router();
router.get("/", async (_req, res) => {
    const { data, error } = await supabase
        .from("transactions")
        .select("*, users(email)")
        .order("created_at", { ascending: false });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    const rows = (data ?? []).map((t) => ({
        ...t,
        user_email: t["users"]?.["email"] ?? null,
        users: undefined,
    }));
    res.json(rows);
});
export default router;
