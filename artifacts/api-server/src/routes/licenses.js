import { Router } from "express";
import { randomBytes } from "crypto";
import { pool } from "@workspace/db";
import { supabase } from "../lib/supabase";

const router = Router();

function generateLicenseKey() {
    const seg = () => randomBytes(4).toString("hex").toUpperCase();
    return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

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
    const { app_id } = req.query;
    const client = await pool.connect();
    try {
        let query, params;
        if (app_id) {
            query = `SELECT l.*, a.name AS app_name FROM licenses l
                     INNER JOIN applications a ON l.app_id = a.id
                     WHERE l.app_id = $1 AND a.owner_id = $2
                     ORDER BY l.created_at DESC`;
            params = [app_id, userId];
        } else {
            query = `SELECT l.*, a.name AS app_name FROM licenses l
                     INNER JOIN applications a ON l.app_id = a.id
                     WHERE a.owner_id = $1
                     ORDER BY l.created_at DESC`;
            params = [userId];
        }
        const { rows } = await client.query(query, params);
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
            `SELECT l.*, a.name AS app_name FROM licenses l
             INNER JOIN applications a ON l.app_id = a.id
             WHERE l.id = $1 AND a.owner_id = $2`,
            [req.params.id, userId]
        );
        if (!rows[0]) { res.status(404).json({ message: "License not found" }); return; }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.post("/", async (req, res) => {
    const userId = req.user.id;
    const { app_id, count, max_hwids } = req.body;
    if (!app_id) {
        res.status(400).json({ message: "app_id is required" });
        return;
    }

    const limits = await getUserPlanLimits(userId);
    if (limits?.licensedUsers != null) {
        const client = await pool.connect();
        try {
            const { rows: countRows } = await client.query(
                `SELECT COUNT(*) as count FROM licenses l
                 JOIN applications a ON l.app_id = a.id
                 WHERE a.owner_id = $1`,
                [userId]
            );
            const currentCount = parseInt(countRows[0]?.count ?? "0", 10);
            const batchCount = Math.min(Math.max(Number(count) || 1, 1), 100);
            if (currentCount + batchCount > limits.licensedUsers) {
                res.status(403).json({
                    message: `Plan limit reached: your plan allows a maximum of ${limits.licensedUsers} license(s). You currently have ${currentCount}.`,
                    code: "PLAN_LIMIT_REACHED",
                    limitType: "licenses",
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
        const { rows: appRows } = await client.query(
            "SELECT id FROM applications WHERE id = $1 AND owner_id = $2",
            [app_id, userId]
        );
        if (!appRows[0]) {
            res.status(404).json({ message: "Application not found or access denied" });
            return;
        }

        const batchCount = Math.min(Math.max(Number(count) || 1, 1), 100);
        const hwids = max_hwids ? parseInt(max_hwids, 10) : null;
        const results = [];

        for (let i = 0; i < batchCount; i++) {
            const key = generateLicenseKey();
            const { rows } = await client.query(
                `INSERT INTO licenses (key, app_id, status, max_hwids)
                 VALUES ($1, $2, 'active', $3) RETURNING *`,
                [key, app_id, hwids]
            );
            results.push(rows[0]);
        }

        res.status(201).json(batchCount === 1 ? results[0] : results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.put("/:id/status", async (req, res) => {
    const userId = req.user.id;
    const { status } = req.body;
    const allowed = ["active", "inactive", "banned"];
    if (!allowed.includes(status)) {
        res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
        return;
    }
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `UPDATE licenses SET status = $1
             WHERE id = $2
               AND app_id IN (SELECT id FROM applications WHERE owner_id = $3)
             RETURNING *`,
            [status, req.params.id, userId]
        );
        if (!rows[0]) { res.status(404).json({ message: "License not found" }); return; }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.put("/:id", async (req, res) => {
    const userId = req.user.id;
    const { max_hwids } = req.body;
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `UPDATE licenses SET max_hwids = $1
             WHERE id = $2
               AND app_id IN (SELECT id FROM applications WHERE owner_id = $3)
             RETURNING *`,
            [max_hwids ?? null, req.params.id, userId]
        );
        if (!rows[0]) { res.status(404).json({ message: "License not found" }); return; }
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
            `DELETE FROM licenses
             WHERE id = $1
               AND app_id IN (SELECT id FROM applications WHERE owner_id = $2)`,
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
