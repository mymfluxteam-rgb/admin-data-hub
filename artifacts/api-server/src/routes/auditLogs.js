import { Router } from "express";
import { supabase } from "../lib/supabase";
const router = Router();
router.get("/", async (_req, res) => {
    const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});
export default router;
