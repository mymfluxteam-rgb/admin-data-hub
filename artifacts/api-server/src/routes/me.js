import { Router } from "express";
import { supabase } from "../lib/supabase";
import { pool } from "@workspace/db";

const router = Router();

router.get("/plan", async (req, res) => {
    const userId = req.user.id;

    const { data: userData, error } = await supabase
        .from("users")
        .select("plan_id, plans(plan_name, max_applications, licensed_users)")
        .eq("id", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        res.status(500).json({ message: error.message });
        return;
    }

    const planName = userData?.["plans"]?.["plan_name"] ?? null;
    const maxApplications = userData?.["plans"]?.["max_applications"] ?? null;
    const licensedUsers = userData?.["plans"]?.["licensed_users"] ?? null;

    let currentApplications = 0;
    let currentLicenses = 0;
    try {
        const client = await pool.connect();
        try {
            const [appsRes, licensesRes] = await Promise.all([
                client.query("SELECT COUNT(*) as count FROM applications WHERE owner_id = $1", [userId]),
                client.query(
                    `SELECT COUNT(*) as count FROM licenses l
                     JOIN applications a ON l.app_id = a.id
                     WHERE a.owner_id = $1`,
                    [userId]
                ),
            ]);
            currentApplications = parseInt(appsRes.rows[0]?.count ?? "0", 10);
            currentLicenses = parseInt(licensesRes.rows[0]?.count ?? "0", 10);
        } finally {
            client.release();
        }
    } catch (_err) {
    }

    res.json({
        planName,
        maxApplications,
        licensedUsers,
        currentApplications,
        currentLicenses,
    });
});

export default router;
