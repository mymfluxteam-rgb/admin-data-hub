import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(500);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});

export default router;
