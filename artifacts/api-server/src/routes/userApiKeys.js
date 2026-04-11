import { Router } from "express";
import { randomBytes } from "crypto";
import { supabase } from "../lib/supabase";

const router = Router();

function generatePublicKey() {
    return `mym_live_${randomBytes(20).toString("hex")}`;
}

function generateAppSecret() {
    return `mym_secret_${randomBytes(32).toString("hex")}`;
}

// GET /api/user-api-keys — list keys belonging to the authenticated user
router.get("/", async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("user_api_keys")
        .select("id, user_id, app_name, public_key, is_active, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    if (error) {
        if (error.code === "42P01") {
            res.status(503).json({
                message: "Table 'user_api_keys' does not exist. Please run the database migration first.",
                migration_required: true,
            });
            return;
        }
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});

// POST /api/user-api-keys — generate a new key pair for the authenticated user
router.post("/", async (req, res) => {
    const userId = req.user.id;
    const { app_name } = req.body;
    if (!app_name || app_name.trim().length === 0) {
        res.status(400).json({ message: "app_name is required" });
        return;
    }
    const public_key = generatePublicKey();
    const app_secret = generateAppSecret();
    const { data, error } = await supabase
        .from("user_api_keys")
        .insert({
            user_id: userId,
            app_name: app_name.trim(),
            public_key,
            app_secret,
            is_active: true,
        })
        .select("id, user_id, app_name, public_key, app_secret, is_active, created_at")
        .single();
    if (error) {
        if (error.code === "42P01") {
            res.status(503).json({
                message: "Table 'user_api_keys' does not exist. Please run the database migration first.",
                migration_required: true,
            });
            return;
        }
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user_api_key.create",
        actor: req.user.email,
        target: data["id"],
        details: `Generated API key for app "${app_name}"`,
        user_id: userId,
    }).then(() => {});
    res.status(201).json(data);
});

// POST /api/user-api-keys/:id/revoke — revoke a key (must belong to the authenticated user)
router.post("/:id/revoke", async (req, res) => {
    const userId = req.user.id;
    const { data: existing, error: fetchErr } = await supabase
        .from("user_api_keys")
        .select("id, app_name, user_id, is_active")
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .single();
    if (fetchErr || !existing) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    if (!existing["is_active"]) {
        res.status(400).json({ message: "Key is already revoked" });
        return;
    }
    const { data, error } = await supabase
        .from("user_api_keys")
        .update({ is_active: false })
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .select("id, user_id, app_name, public_key, is_active, created_at")
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user_api_key.revoke",
        actor: req.user.email,
        target: req.params["id"],
        details: `Revoked API key for app "${existing["app_name"]}"`,
        user_id: userId,
    }).then(() => {});
    res.json(data);
});

// DELETE /api/user-api-keys/:id — permanently delete a key (must belong to the authenticated user)
router.delete("/:id", async (req, res) => {
    const userId = req.user.id;
    const { data: existing, error: fetchErr } = await supabase
        .from("user_api_keys")
        .select("id, app_name")
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .single();
    if (fetchErr || !existing) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    const { error } = await supabase
        .from("user_api_keys")
        .delete()
        .eq("id", req.params["id"])
        .eq("user_id", userId);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user_api_key.delete",
        actor: req.user.email,
        target: req.params["id"],
        details: `Deleted API key for app "${existing["app_name"]}"`,
        user_id: userId,
    }).then(() => {});
    res.status(204).send();
});

export default router;
