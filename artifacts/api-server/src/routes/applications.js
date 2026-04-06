import { Router } from "express";
import { randomBytes } from "crypto";
import { pool } from "@workspace/db";

const router = Router();

function generateSecret() {
    return randomBytes(32).toString("hex");
}

router.get("/", async (_req, res) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            "SELECT * FROM applications ORDER BY created_at DESC"
        );
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
            "SELECT * FROM applications WHERE id = $1",
            [req.params.id]
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
    const { app_name, owner_id } = req.body;
    if (!app_name || !app_name.trim()) {
        res.status(400).json({ message: "app_name is required" });
        return;
    }
    const app_secret = generateSecret();
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `INSERT INTO applications (app_name, app_secret, owner_id)
             VALUES ($1, $2, $3) RETURNING *`,
            [app_name.trim(), app_secret, owner_id ?? null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.put("/:id", async (req, res) => {
    const { app_name } = req.body;
    if (!app_name || !app_name.trim()) {
        res.status(400).json({ message: "app_name is required" });
        return;
    }
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            "UPDATE applications SET app_name = $1 WHERE id = $2 RETURNING *",
            [app_name.trim(), req.params.id]
        );
        if (!rows[0]) { res.status(404).json({ message: "Application not found" }); return; }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

router.post("/:id/rotate-secret", async (req, res) => {
    const app_secret = generateSecret();
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            "UPDATE applications SET app_secret = $1 WHERE id = $2 RETURNING *",
            [app_secret, req.params.id]
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
    const client = await pool.connect();
    try {
        await client.query("DELETE FROM applications WHERE id = $1", [req.params.id]);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

export default router;
