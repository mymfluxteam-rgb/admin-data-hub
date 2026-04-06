import { Router } from "express";
import { randomBytes } from "crypto";
import { pool } from "@workspace/db";

const router = Router();

function generateLicenseKey() {
    const seg = () => randomBytes(4).toString("hex").toUpperCase();
    return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

router.get("/", async (req, res) => {
    const { app_id } = req.query;
    const client = await pool.connect();
    try {
        let query, params;
        if (app_id) {
            query = `SELECT l.*, a.app_name FROM licenses l
                     LEFT JOIN applications a ON l.app_id = a.id
                     WHERE l.app_id = $1 ORDER BY l.created_at DESC`;
            params = [app_id];
        } else {
            query = `SELECT l.*, a.app_name FROM licenses l
                     LEFT JOIN applications a ON l.app_id = a.id
                     ORDER BY l.created_at DESC`;
            params = [];
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
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `SELECT l.*, a.app_name FROM licenses l
             LEFT JOIN applications a ON l.app_id = a.id
             WHERE l.id = $1`,
            [req.params.id]
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
    const { app_id, user_label, notes, expires_at, count } = req.body;
    if (!app_id) {
        res.status(400).json({ message: "app_id is required" });
        return;
    }
    const client = await pool.connect();
    try {
        const { rows: appRows } = await client.query(
            "SELECT id FROM applications WHERE id = $1",
            [app_id]
        );
        if (!appRows[0]) {
            res.status(404).json({ message: "Application not found" });
            return;
        }
        const batchCount = Math.min(Math.max(Number(count) || 1, 1), 100);
        const results = [];
        for (let i = 0; i < batchCount; i++) {
            const license_key = generateLicenseKey();
            const { rows } = await client.query(
                `INSERT INTO licenses (app_id, license_key, status, user_label, notes, expires_at)
                 VALUES ($1, $2, 'active', $3, $4, $5) RETURNING *`,
                [app_id, license_key, user_label ?? null, notes ?? null, expires_at ?? null]
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
    const { status } = req.body;
    const allowed = ["active", "inactive", "banned"];
    if (!allowed.includes(status)) {
        res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
        return;
    }
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            "UPDATE licenses SET status = $1 WHERE id = $2 RETURNING *",
            [status, req.params.id]
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
    const { user_label, notes, expires_at, hwid } = req.body;
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `UPDATE licenses SET user_label = $1, notes = $2, expires_at = $3, hwid = $4
             WHERE id = $5 RETURNING *`,
            [user_label ?? null, notes ?? null, expires_at ?? null, hwid ?? null, req.params.id]
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
    const client = await pool.connect();
    try {
        await client.query("DELETE FROM licenses WHERE id = $1", [req.params.id]);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

export default router;
