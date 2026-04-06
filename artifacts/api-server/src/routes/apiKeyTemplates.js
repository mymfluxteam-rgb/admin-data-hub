import { Router } from "express";
import { supabase } from "../lib/supabase";
const router = Router();
// GET /api/api-key-templates — list all templates
router.get("/", async (_req, res) => {
    const { data, error } = await supabase
        .from("api_key_templates")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});
// GET /api/api-key-templates/:id — get a single template
router.get("/:id", async (req, res) => {
    const { data, error } = await supabase
        .from("api_key_templates")
        .select("*")
        .eq("id", req.params["id"])
        .single();
    if (error) {
        res.status(404).json({ message: "Template not found" });
        return;
    }
    res.json(data);
});
// POST /api/api-key-templates — create a template
router.post("/", async (req, res) => {
    const { template_name, permissions, rate_limit, expires_in_days, description } = req.body;
    if (!template_name || template_name.trim().length === 0) {
        res.status(400).json({ message: "template_name is required" });
        return;
    }
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
        res.status(400).json({ message: "permissions array is required and must not be empty" });
        return;
    }
    const { data, error } = await supabase
        .from("api_key_templates")
        .insert({
        template_name: template_name.trim(),
        permissions,
        rate_limit: rate_limit ?? null,
        expires_in_days: expires_in_days ?? null,
        description: description ?? null,
    })
        .select()
        .single();
    if (error) {
        if (error.code === "23505") {
            res.status(409).json({ message: "A template with that name already exists" });
            return;
        }
        res.status(500).json({ message: error.message });
        return;
    }
    res.status(201).json(data);
});
// PUT /api/api-key-templates/:id — update a template
router.put("/:id", async (req, res) => {
    const { template_name, permissions, rate_limit, expires_in_days, description } = req.body;
    const updates = {};
    if (template_name !== undefined)
        updates["template_name"] = template_name.trim();
    if (permissions !== undefined)
        updates["permissions"] = permissions;
    if (rate_limit !== undefined)
        updates["rate_limit"] = rate_limit;
    if (expires_in_days !== undefined)
        updates["expires_in_days"] = expires_in_days;
    if (description !== undefined)
        updates["description"] = description;
    if (Object.keys(updates).length === 0) {
        res.status(400).json({ message: "No fields provided to update" });
        return;
    }
    const { data, error } = await supabase
        .from("api_key_templates")
        .update(updates)
        .eq("id", req.params["id"])
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data);
});
// DELETE /api/api-key-templates/:id — delete a template
router.delete("/:id", async (req, res) => {
    const { data: existing, error: fetchErr } = await supabase
        .from("api_key_templates")
        .select("id, template_name")
        .eq("id", req.params["id"])
        .single();
    if (fetchErr || !existing) {
        res.status(404).json({ message: "Template not found" });
        return;
    }
    const { error } = await supabase
        .from("api_key_templates")
        .delete()
        .eq("id", req.params["id"]);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.status(204).send();
});
export default router;
