import { Router } from "express";
import cors from "cors";
import { pool } from "@workspace/db";

const router = Router();

const publicCors = cors({
    origin: "*",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
});

router.options("/verify", publicCors, (_req, res) => {
    res.status(204).end();
});

router.post("/verify", publicCors, async (req, res) => {
    const { app_id, app_secret, license_key } = req.body ?? {};

    if (!app_id || !app_secret || !license_key) {
        res.status(400).json({
            valid: false,
            message: "app_id, app_secret, and license_key are required",
        });
        return;
    }

    const client = await pool.connect();
    try {
        const { rows: appRows } = await client.query(
            "SELECT id, app_name, app_secret FROM applications WHERE id = $1",
            [app_id]
        );
        const app = appRows[0];
        if (!app || app.app_secret !== app_secret) {
            res.status(401).json({ valid: false, message: "Invalid app credentials" });
            return;
        }

        const { rows: licRows } = await client.query(
            `SELECT id, license_key, status, user_label, hwid, expires_at, created_at
             FROM licenses WHERE app_id = $1 AND license_key = $2`,
            [app_id, license_key]
        );
        const license = licRows[0];
        if (!license) {
            res.status(404).json({ valid: false, message: "License key not found" });
            return;
        }

        if (license.status === "banned") {
            res.status(403).json({ valid: false, message: "License key is banned" });
            return;
        }
        if (license.status === "inactive") {
            res.status(403).json({ valid: false, message: "License key is inactive" });
            return;
        }
        if (license.expires_at && new Date(license.expires_at) < new Date()) {
            res.status(403).json({ valid: false, message: "License key has expired" });
            return;
        }

        res.json({
            valid: true,
            message: "License key is valid",
            license: {
                id: license.id,
                license_key: license.license_key,
                status: license.status,
                user_label: license.user_label,
                hwid: license.hwid,
                expires_at: license.expires_at,
                created_at: license.created_at,
            },
            app: {
                id: app.id,
                app_name: app.app_name,
            },
        });
    } catch (err) {
        res.status(500).json({ valid: false, message: "Internal server error" });
    } finally {
        client.release();
    }
});

export default router;
