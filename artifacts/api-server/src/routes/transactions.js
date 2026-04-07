import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("transactions")
        .select("*, users(email)")
        .eq("user_id", userId)
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
