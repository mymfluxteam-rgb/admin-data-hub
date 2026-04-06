import { Router } from "express";
import { supabase } from "../lib/supabase";
const router = Router();
const ADMIN_ROLES = ["super_admin", "settings_admin", "user_admin", "api_admin", "finance_admin", "viewer", "admin"];
// GET /api/admin-users — list all admin/staff users
router.get("/", async (_req, res) => {
    const { data, error } = await supabase
        .from("users")
        .select("id, username, email, role, status, verified, created_at, last_login")
        .in("role", ADMIN_ROLES)
        .order("created_at", { ascending: false });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});
// POST /api/admin-users — promote an existing user to an admin role
router.post("/", async (req, res) => {
    const { user_id, role } = req.body;
    if (!user_id || !role) {
        res.status(400).json({ message: "user_id and role are required" });
        return;
    }
    if (!ADMIN_ROLES.includes(role)) {
        res.status(400).json({ message: `role must be one of: ${ADMIN_ROLES.join(", ")}` });
        return;
    }
    const { data, error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", user_id)
        .select("id, username, email, role, status, created_at")
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "admin_user.promote",
        actor: "admin",
        target: user_id,
        details: `Promoted user to role: ${role}`,
    });
    res.status(201).json(data);
});
// PUT /api/admin-users/:id/role — change admin role
router.put("/:id/role", async (req, res) => {
    const { role } = req.body;
    if (!role || !ADMIN_ROLES.includes(role)) {
        res.status(400).json({ message: `role must be one of: ${ADMIN_ROLES.join(", ")}` });
        return;
    }
    const { data, error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", req.params["id"])
        .select("id, username, email, role, status")
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "admin_user.role_change",
        actor: "admin",
        target: req.params["id"],
        details: `Changed admin role to: ${role}`,
    });
    res.json(data);
});
// DELETE /api/admin-users/:id — demote back to regular user
router.delete("/:id", async (req, res) => {
    const { data, error } = await supabase
        .from("users")
        .update({ role: "user" })
        .eq("id", req.params["id"])
        .select("id, username, email, role")
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "admin_user.demote",
        actor: "admin",
        target: req.params["id"],
        details: "Demoted admin to regular user",
    });
    res.json(data);
});
export default router;
