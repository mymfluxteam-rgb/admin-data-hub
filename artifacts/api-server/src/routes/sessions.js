import { Router } from "express";
import { supabase } from "../lib/supabase";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

router.get("/", async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("device_sessions")
        .select("*, users(email, username)")
        .eq("status", "active")
        .in("app_id", supabase.from("applications").select("id").eq("owner_id", userId))
        .order("last_activity", { ascending: false });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});

router.get("/user/:id", requireAdmin, async (req, res) => {
    const { data, error } = await supabase
        .from("device_sessions")
        .select("*")
        .eq("user_id", req.params["id"])
        .order("login_time", { ascending: false });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.json(data ?? []);
});

router.post("/", async (req, res) => {
    const { user_id, device_id, browser, os, device_type } = req.body;
    if (!user_id || !device_id) {
        res.status(400).json({ message: "user_id and device_id are required" });
        return;
    }
    const { data: existing } = await supabase
        .from("device_sessions")
        .select("id")
        .eq("user_id", user_id)
        .eq("device_id", device_id)
        .eq("status", "active")
        .maybeSingle();
    if (existing) {
        const { data, error } = await supabase
            .from("device_sessions")
            .update({ last_activity: new Date().toISOString(), browser, os, device_type })
            .eq("id", existing["id"])
            .select()
            .single();
        if (error) {
            res.status(500).json({ message: error.message });
            return;
        }
        res.json(data);
    } else {
        const { data, error } = await supabase
            .from("device_sessions")
            .insert({
                user_id, device_id, browser, os, device_type,
                login_time: new Date().toISOString(),
                last_activity: new Date().toISOString(),
                status: "active",
            })
            .select()
            .single();
        if (error) {
            res.status(500).json({ message: error.message });
            return;
        }
        await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user_id);
        res.status(201).json(data);
    }
});

router.delete("/:id", requireAdmin, async (req, res) => {
    const { data, error } = await supabase
        .from("device_sessions")
        .update({ status: "expired" })
        .eq("id", req.params["id"])
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "session.force_logout", actor: req.user.email, target: req.params["id"],
        details: "Admin force-logged out session",
    });
    res.json(data);
});

router.delete("/user/:userId/all", requireAdmin, async (req, res) => {
    const { error } = await supabase
        .from("device_sessions")
        .update({ status: "expired" })
        .eq("user_id", req.params["userId"]);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "session.logout_all", actor: req.user.email, target: req.params["userId"],
        details: "All sessions force-expired for user",
    });
    res.json({ message: "All sessions expired" });
});

export default router;
