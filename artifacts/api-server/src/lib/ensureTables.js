import { pool } from "@workspace/db";

export async function ensureLicensingTables() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                app_name TEXT NOT NULL,
                app_secret TEXT NOT NULL,
                owner_id UUID,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS licenses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                app_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
                license_key TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL DEFAULT 'active',
                user_label TEXT,
                notes TEXT,
                hwid TEXT,
                expires_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
    } finally {
        client.release();
    }
}
