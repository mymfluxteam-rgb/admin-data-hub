import { Router } from "express";
import { randomBytes } from "crypto";
import { supabase } from "../lib/supabase";
import { requireAdmin } from "../middlewares/requireAdmin";
const router = Router();
router.get("/", async (_req, res) => {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});
router.get("/expiring-soon", async (_req, res) => {
    const now = new Date().toISOString();
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .gt("account_expiry", now)
        .lt("account_expiry", in7Days)
        .order("account_expiry", { ascending: true });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});
router.post("/", async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !username.trim()) {
        res.status(400).json({ message: "username is required" });
        return;
    }
    if (!email || !email.trim()) {
        res.status(400).json({ message: "email is required" });
        return;
    }
    if (!password || password.length < 6) {
        res.status(400).json({ message: "password must be at least 6 characters" });
        return;
    }
    const { data, error } = await supabase
        .from("users")
        .insert({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password_hash: password,
        role: role ?? "user",
        status: "active",
        verified: false,
        credits: 0,
    })
        .select()
        .single();
    if (error) {
        if (error.code === "23505") {
            res.status(409).json({ message: "A user with that email or username already exists" });
            return;
        }
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.create",
        actor: "admin",
        target: data["email"],
        details: `Created user: ${username.trim()}`,
    });
    res.status(201).json(data);
});
router.put("/:id/ban", async (req, res) => {
    const { data, error } = await supabase
        .from("users").update({ status: "banned" }).eq("id", req.params["id"]).select().single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.ban", actor: "admin", target: req.params["id"], details: "User banned",
    });
    res.json(data);
});
router.put("/:id/unban", async (req, res) => {
    const { data, error } = await supabase
        .from("users").update({ status: "active" }).eq("id", req.params["id"]).select().single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.unban", actor: "admin", target: req.params["id"], details: "User unbanned",
    });
    res.json(data);
});
router.put("/:id/activate", async (req, res) => {
    const { data, error } = await supabase
        .from("users").update({ status: "active" }).eq("id", req.params["id"]).select().single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.activate", actor: "admin", target: req.params["id"], details: "User activated",
    });
    res.json(data);
});
router.put("/:id/verify", async (req, res) => {
    const { data, error } = await supabase
        .from("users").update({ verified: true }).eq("id", req.params["id"]).select().single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data);
});
router.put("/:id/credits/add", async (req, res) => {
    const { amount, description } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ message: "amount must be a positive number" });
        return;
    }
    const { data: user, error: fetchErr } = await supabase
        .from("users").select("credits").eq("id", req.params["id"]).single();
    if (fetchErr || !user) {
        res.status(404).json({ message: fetchErr?.message ?? "User not found" });
        return;
    }
    const newCredits = user["credits"] + amount;
    const { data, error } = await supabase
        .from("users").update({ credits: newCredits }).eq("id", req.params["id"]).select().single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("transactions").insert({
        user_id: req.params["id"], amount, type: "bonus",
        description: description ?? "Manual credit addition",
    });
    await supabase.from("audit_logs").insert({
        action: "credits.add", actor: "admin", target: req.params["id"],
        details: `Added ${amount} credits`,
    });
    res.json(data);
});
router.put("/:id/credits/remove", async (req, res) => {
    const { amount, description } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ message: "amount must be a positive number" });
        return;
    }
    const { data: user, error: fetchErr } = await supabase
        .from("users").select("credits").eq("id", req.params["id"]).single();
    if (fetchErr || !user) {
        res.status(404).json({ message: fetchErr?.message ?? "User not found" });
        return;
    }
    const newCredits = Math.max(0, user["credits"] - amount);
    const { data, error } = await supabase
        .from("users").update({ credits: newCredits }).eq("id", req.params["id"]).select().single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("transactions").insert({
        user_id: req.params["id"], amount: -amount, type: "deduction",
        description: description ?? "Manual credit deduction",
    });
    res.json(data);
});
router.post("/:id/set-expiry", async (req, res) => {
    const { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0, manualDate } = req.body;
    let expiry;
    if (manualDate) {
        expiry = new Date(manualDate);
        if (isNaN(expiry.getTime())) {
            res.status(400).json({ message: "Invalid manualDate format" });
            return;
        }
    }
    else {
        expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + (years || 0));
        expiry.setMonth(expiry.getMonth() + (months || 0));
        expiry.setDate(expiry.getDate() + (days || 0));
        expiry.setHours(expiry.getHours() + (hours || 0));
        expiry.setMinutes(expiry.getMinutes() + (minutes || 0));
        expiry.setSeconds(expiry.getSeconds() + (seconds || 0));
    }
    const { data, error } = await supabase
        .from("users")
        .update({ account_expiry: expiry.toISOString() })
        .eq("id", req.params["id"])
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.set_expiry", actor: "admin", target: req.params["id"],
        details: `Account expiry set to ${expiry.toISOString()}`,
    });
    res.json(data);
});
router.post("/:id/extend-expiry", async (req, res) => {
    const { days = 0, hours = 0 } = req.body;
    const { data: user, error: fetchErr } = await supabase
        .from("users").select("account_expiry").eq("id", req.params["id"]).single();
    if (fetchErr || !user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const base = user["account_expiry"] ? new Date(user["account_expiry"]) : new Date();
    if (base < new Date())
        base.setTime(new Date().getTime());
    base.setDate(base.getDate() + (days || 0));
    base.setHours(base.getHours() + (hours || 0));
    const { data, error } = await supabase
        .from("users")
        .update({ account_expiry: base.toISOString() })
        .eq("id", req.params["id"])
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.extend_expiry", actor: "admin", target: req.params["id"],
        details: `Extended by ${days}d ${hours}h → ${base.toISOString()}`,
    });
    res.json(data);
});
router.post("/:id/reset-password", async (req, res) => {
    const { newPassword } = req.body;
    const tempPass = newPassword ?? `Temp${randomBytes(6).toString("hex")}!`;
    const { data, error } = await supabase
        .from("users")
        .update({ password_hash: tempPass })
        .eq("id", req.params["id"])
        .select("id, username, email")
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.reset_password", actor: "admin", target: req.params["id"],
        details: "Admin reset user password",
    });
    res.json({ ...data, temporaryPassword: tempPass });
});
router.post("/:id/api-key/regenerate", async (req, res) => {
    const newKey = randomBytes(16).toString("hex");
    const { data, error } = await supabase
        .from("users")
        .update({ public_api_key: newKey })
        .eq("id", req.params["id"])
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.regen_api_key", actor: "admin", target: req.params["id"],
        details: "API key regenerated",
    });
    res.json(data);
});
router.delete("/:id/api-key", async (req, res) => {
    const { data, error } = await supabase
        .from("users")
        .update({ public_api_key: null })
        .eq("id", req.params["id"])
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data);
});
router.delete("/:id", async (req, res) => {
    const { data: user, error: fetchErr } = await supabase
        .from("users")
        .select("username, email")
        .eq("id", req.params["id"])
        .single();
    if (fetchErr || !user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    await supabase.from("hwids").delete().eq("user_id", req.params["id"]);
    await supabase.from("device_sessions").update({ status: "expired" }).eq("user_id", req.params["id"]);
    const { error } = await supabase.from("users").delete().eq("id", req.params["id"]);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "user.delete",
        actor: "admin",
        target: user["email"],
        details: `Deleted user: ${user["username"]}`,
    });
    res.status(204).send();
});
router.put("/:id/plan", requireAdmin, async (req, res) => {
    const { plan_id, plan_name } = req.body;

    let targetPlanId = plan_id;
    if (!targetPlanId && plan_name) {
        const { data: plan, error: planErr } = await supabase
            .from("plans")
            .select("id, plan_name")
            .eq("plan_name", plan_name)
            .single();
        if (planErr || !plan) {
            res.status(400).json({ message: "Plan not found" });
            return;
        }
        targetPlanId = plan.id;
    }
    if (!targetPlanId) {
        res.status(400).json({ message: "plan_id or plan_name is required" });
        return;
    }

    const { data, error } = await supabase
        .from("users")
        .update({ plan_id: targetPlanId })
        .eq("id", req.params["id"])
        .select("id, username, email, role, plan_id, plans(plan_name)")
        .single();

    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }

    await supabase.from("audit_logs").insert({
        action: "user.plan_change",
        actor: req.user.email,
        target: req.params["id"],
        details: `Plan upgraded to: ${plan_name ?? targetPlanId}`,
    });

    res.json(data);
});

router.get("/verify-api-key", async (req, res) => {
    const key = req.query["key"];
    if (!key || key.trim().length < 8) {
        res.status(400).json({ message: "API key is required" });
        return;
    }
    const { data, error } = await supabase
        .from("users")
        .select("id, username, email, status, verified, credits, role, account_expiry, created_at")
        .eq("public_api_key", key.trim())
        .maybeSingle();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    if (!data) {
        res.status(404).json({ valid: false, message: "No account found for this API key" });
        return;
    }
    res.json({ valid: true, user: data });
});
export default router;
