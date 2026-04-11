import { Router } from "express";
import { pool } from "@workspace/db";
import { supabase } from "../lib/supabase";

const router = Router();

async function getUserPlanLimits(userId) {
    const { data: userData } = await supabase
        .from("users")
        .select("plan_id, plans(plan_name, max_applications, licensed_users)")
        .eq("id", userId)
        .single();
    if (!userData?.plan_id) return null;
    return {
        planName: userData["plans"]?.["plan_name"] ?? null,
        maxApplications: userData["plans"]?.["max_applications"] ?? null,
        licensedUsers: userData["plans"]?.["licensed_users"] ?? null,
    };
}

router.get("/", async (req, res) => {
    const userId = req.user.id;
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            "SELECT * FROM applications WHERE owner_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.get("/:id", async (req, res) => {
    const userId = req.user.id;
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            "SELECT * FROM applications WHERE id = $1 AND owner_id = $2",
            [req.params.id, userId]
        );
        if (!rows[0]) { res.status(404).json({ message: "Application not found" }); return; }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.post("/", async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
        res.status(400).json({ message: "name is required" });
        return;
    }

    const limits = await getUserPlanLimits(userId);
    if (limits?.maxApplications != null) {
        const client = await pool.connect();
        try {
            const { rows: countRows } = await client.query(
                "SELECT COUNT(*) as count FROM applications WHERE owner_id = $1",
                [userId]
            );
            const currentCount = parseInt(countRows[0]?.count ?? "0", 10);
            if (currentCount >= limits.maxApplications) {
                res.status(403).json({
                    message: `Plan limit reached: your plan allows a maximum of ${limits.maxApplications} application(s).`,
                    code: "PLAN_LIMIT_REACHED",
                    limitType: "applications",
                    planName: limits.planName,
                });
                return;
            }
        } finally {
            client.release();
        }
    }

    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `INSERT INTO applications (name, owner_id) VALUES ($1, $2) RETURNING *`,
            [name.trim(), userId]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.put("/:id", async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
        res.status(400).json({ message: "name is required" });
        return;
    }
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            "UPDATE applications SET name = $1 WHERE id = $2 AND owner_id = $3 RETURNING *",
            [name.trim(), req.params.id, userId]
        );
        if (!rows[0]) { res.status(404).json({ message: "Application not found" }); return; }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.delete("/:id", async (req, res) => {
    const userId = req.user.id;
    const client = await pool.connect();
    try {
        await client.query(
            "DELETE FROM applications WHERE id = $1 AND owner_id = $2",
            [req.params.id, userId]
        );
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

export default router;
