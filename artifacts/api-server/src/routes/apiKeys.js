import { Router } from "express";
import { randomBytes, createHash } from "crypto";
import { supabase } from "../lib/supabase";

const router = Router();

function generateApiKey() {
    const raw = `sk_${randomBytes(24).toString("hex")}`;
    const hash = createHash("sha256").update(raw).digest("hex");
    return { raw, hash };
}

// GET /api/api-keys — list keys belonging to the authenticated user
router.get("/", async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("api_keys")
        .select("id, user_id, key_name, key_type, permissions, allowed_ips, allowed_origins, rate_limit, usage_count, last_used_at, expires_at, is_active, created_at, created_by, revoked_at, revoked_by, revoke_reason")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});

// GET /api/api-keys/:id — get a single key (must belong to the authenticated user)
router.get("/:id", async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("api_keys")
        .select("id, user_id, key_name, key_type, permissions, allowed_ips, allowed_origins, rate_limit, usage_count, last_used_at, expires_at, is_active, created_at, created_by, revoked_at, revoked_by, revoke_reason")
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .single();
    if (error) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    res.json(data);
});

// POST /api/api-keys — create a new API key scoped to the authenticated user
router.post("/", async (req, res) => {
    const userId = req.user.id;
    const { key_name, key_type = "third_party", permissions = [], allowed_ips = [], allowed_origins = [], rate_limit = 100, expires_at, template_id } = req.body;
    if (!key_name || key_name.trim().length === 0) {
        res.status(400).json({ message: "key_name is required" });
        return;
    }
    let resolvedPermissions = permissions;
    let resolvedRateLimit = rate_limit;
    let resolvedExpiresAt = expires_at;
    if (template_id) {
        const { data: tmpl, error: tmplErr } = await supabase
            .from("api_key_templates")
            .select("*")
            .eq("id", template_id)
            .single();
        if (tmplErr || !tmpl) {
            res.status(404).json({ message: "Template not found" });
            return;
        }
        resolvedPermissions = tmpl["permissions"];
        resolvedRateLimit = tmpl["rate_limit"] ?? rate_limit;
        if (!resolvedExpiresAt && tmpl["expires_in_days"]) {
            const d = new Date();
            d.setDate(d.getDate() + tmpl["expires_in_days"]);
            resolvedExpiresAt = d.toISOString();
        }
    }
    const { raw, hash } = generateApiKey();
    const { data, error } = await supabase
        .from("api_keys")
        .insert({
            user_id: userId,
            api_key: raw,
            api_key_hash: hash,
            key_name: key_name.trim(),
            key_type,
            permissions: resolvedPermissions,
            allowed_ips,
            allowed_origins,
            rate_limit: resolvedRateLimit,
            expires_at: resolvedExpiresAt ?? null,
            created_by: userId,
            is_active: true,
        })
        .select("id, user_id, key_name, key_type, permissions, allowed_ips, allowed_origins, rate_limit, expires_at, created_at, created_by")
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "api_key.create",
        actor: req.user.email,
        target: data["id"],
        details: `Created API key "${key_name}"`,
        user_id: userId,
    });
    res.status(201).json({ ...data, api_key: raw });
});

// PUT /api/api-keys/:id — update key metadata (must belong to the authenticated user)
router.put("/:id", async (req, res) => {
    const userId = req.user.id;
    const { key_name, permissions, allowed_ips, allowed_origins, rate_limit, expires_at, is_active } = req.body;
    const updates = {};
    if (key_name !== undefined) updates["key_name"] = key_name.trim();
    if (permissions !== undefined) updates["permissions"] = permissions;
    if (allowed_ips !== undefined) updates["allowed_ips"] = allowed_ips;
    if (allowed_origins !== undefined) updates["allowed_origins"] = allowed_origins;
    if (rate_limit !== undefined) updates["rate_limit"] = rate_limit;
    if (expires_at !== undefined) updates["expires_at"] = expires_at;
    if (is_active !== undefined) updates["is_active"] = is_active;
    if (Object.keys(updates).length === 0) {
        res.status(400).json({ message: "No fields provided to update" });
        return;
    }
    const { data, error } = await supabase
        .from("api_keys")
        .update(updates)
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .select("id, user_id, key_name, key_type, permissions, allowed_ips, allowed_origins, rate_limit, usage_count, last_used_at, expires_at, is_active, created_at")
        .single();
    if (error || !data) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "api_key.update",
        actor: req.user.email,
        target: req.params["id"],
        details: `Updated fields: ${Object.keys(updates).join(", ")}`,
        user_id: userId,
    });
    res.json(data);
});

// POST /api/api-keys/:id/revoke — revoke a key (must belong to the authenticated user)
router.post("/:id/revoke", async (req, res) => {
    const userId = req.user.id;
    const { revoke_reason } = req.body;
    const { data, error } = await supabase
        .from("api_keys")
        .update({
            is_active: false,
            revoked_at: new Date().toISOString(),
            revoked_by: userId,
            revoke_reason: revoke_reason ?? null,
        })
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .select("id, key_name, is_active, revoked_at, revoke_reason")
        .single();
    if (error || !data) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "api_key.revoke",
        actor: req.user.email,
        target: req.params["id"],
        details: `Revoked API key. Reason: ${revoke_reason ?? "none"}`,
        user_id: userId,
    });
    res.json(data);
});

// POST /api/api-keys/:id/rotate — rotate (regenerate) a key (must belong to the authenticated user)
router.post("/:id/rotate", async (req, res) => {
    const userId = req.user.id;
    const { data: existing, error: fetchErr } = await supabase
        .from("api_keys")
        .select("id, key_name, is_active")
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .single();
    if (fetchErr || !existing) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    if (!existing["is_active"]) {
        res.status(400).json({ message: "Cannot rotate a revoked key" });
        return;
    }
    const { raw, hash } = generateApiKey();
    const { data, error } = await supabase
        .from("api_keys")
        .update({ api_key: raw, api_key_hash: hash })
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .select("id, user_id, key_name, key_type, permissions, rate_limit, expires_at, created_at")
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "api_key.rotate",
        actor: req.user.email,
        target: req.params["id"],
        details: `Rotated API key "${existing["key_name"]}"`,
        user_id: userId,
    });
    res.json({ ...data, api_key: raw });
});

// DELETE /api/api-keys/:id — permanently delete a key (must belong to the authenticated user)
router.delete("/:id", async (req, res) => {
    const userId = req.user.id;
    const { data: existing, error: fetchErr } = await supabase
        .from("api_keys")
        .select("id, key_name")
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .single();
    if (fetchErr || !existing) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    await supabase.from("api_key_usage_logs").delete().eq("api_key_id", req.params["id"]);
    const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", req.params["id"])
        .eq("user_id", userId);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "api_key.delete",
        actor: req.user.email,
        target: req.params["id"],
        details: `Deleted API key "${existing["key_name"]}"`,
        user_id: userId,
    });
    res.status(204).send();
});

// POST /api/api-keys/validate — validate a raw key (public endpoint, no ownership check needed)
router.post("/validate", async (req, res) => {
    const { api_key, ip_address, endpoint, method } = req.body;
    if (!api_key) {
        res.status(400).json({ valid: false, message: "api_key is required" });
        return;
    }
    const hash = createHash("sha256").update(api_key).digest("hex");
    const { data, error } = await supabase
        .from("api_keys")
        .select("id, user_id, key_name, key_type, permissions, allowed_ips, rate_limit, is_active, expires_at, usage_count")
        .eq("api_key_hash", hash)
        .maybeSingle();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    if (!data) {
        res.status(401).json({ valid: false, message: "Invalid API key" });
        return;
    }
    const key = data;
    if (!key["is_active"]) {
        res.status(403).json({ valid: false, message: "API key has been revoked" });
        return;
    }
    if (key["expires_at"] && new Date(key["expires_at"]) < new Date()) {
        res.status(403).json({ valid: false, message: "API key has expired" });
        return;
    }
    const allowedIps = key["allowed_ips"];
    if (ip_address && allowedIps.length > 0 && !allowedIps.includes(ip_address)) {
        res.status(403).json({ valid: false, message: "IP address not allowed" });
        return;
    }
    await supabase
        .from("api_keys")
        .update({ usage_count: key["usage_count"] + 1, last_used_at: new Date().toISOString() })
        .eq("id", key["id"]);
    if (endpoint && method) {
        await supabase.from("api_key_usage_logs").insert({
            api_key_id: key["id"],
            user_id: key["user_id"] ?? null,
            endpoint,
            method,
            ip_address: ip_address ?? null,
        });
    }
    res.json({
        valid: true,
        key_id: key["id"],
        user_id: key["user_id"],
        key_name: key["key_name"],
        key_type: key["key_type"],
        permissions: key["permissions"],
        rate_limit: key["rate_limit"],
    });
});

// GET /api/api-keys/:id/usage — get usage logs for a key (must belong to the authenticated user)
router.get("/:id/usage", async (req, res) => {
    const userId = req.user.id;
    const { data: keyCheck, error: keyErr } = await supabase
        .from("api_keys")
        .select("id")
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .single();
    if (keyErr || !keyCheck) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    const limit = Math.min(parseInt(req.query["limit"] ?? "100", 10), 500);
    const offset = parseInt(req.query["offset"] ?? "0", 10);
    const { data, error, count } = await supabase
        .from("api_key_usage_logs")
        .select("*", { count: "exact" })
        .eq("api_key_id", req.params["id"])
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json({ total: count ?? 0, limit, offset, data: data ?? [] });
});

// POST /api/api-keys/:id/usage — log a usage entry externally (must belong to the authenticated user)
router.post("/:id/usage", async (req, res) => {
    const userId = req.user.id;
    const { data: keyCheck, error: keyErr } = await supabase
        .from("api_keys")
        .select("id")
        .eq("id", req.params["id"])
        .eq("user_id", userId)
        .single();
    if (keyErr || !keyCheck) {
        res.status(404).json({ message: "API key not found" });
        return;
    }
    const { endpoint, method, ip_address, user_agent, response_status, response_time_ms } = req.body;
    if (!endpoint || !method) {
        res.status(400).json({ message: "endpoint and method are required" });
        return;
    }
    const { data, error } = await supabase
        .from("api_key_usage_logs")
        .insert({
            api_key_id: req.params["id"],
            user_id: userId,
            endpoint,
            method,
            ip_address: ip_address ?? null,
            user_agent: user_agent ?? null,
            response_status: response_status ?? null,
            response_time_ms: response_time_ms ?? null,
        })
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.status(201).json(data);
});

export default router;
