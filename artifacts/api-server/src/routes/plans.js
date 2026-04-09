import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (_req, res) => {
    const { data, error } = await supabase
        .from("plans")
        .select("id, plan_name, max_applications, licensed_users")
        .order("max_applications", { ascending: true, nullsFirst: false });

    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});

export default router;
