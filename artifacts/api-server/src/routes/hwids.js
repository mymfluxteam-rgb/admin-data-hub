import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("hwids")
        .select("*, users(email)")
        .eq("user_id", userId)
        .order("last_seen", { ascending: false });
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    const rows = (data ?? []).map((h) => ({
        ...h,
        user_email: h["users"]?.["email"] ?? null,
        users: undefined,
    }));
    res.json(rows);
});

router.put("/:id/blacklist", async (req, res) => {
    const { blacklisted } = req.body;
    if (typeof blacklisted !== "boolean") {
        res.status(400).json({ message: "blacklisted must be a boolean" });
        return;
    }
    const { data, error } = await supabase
        .from("hwids")
        .update({ blacklisted })
        .eq("id", req.params["id"])
        .eq("user_id", req.user.id)
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: blacklisted ? "hwid.blacklist" : "hwid.unblacklist",
        actor: req.user.email,
        target: req.params["id"],
        details: blacklisted ? "Device blacklisted" : "Device unblacklisted",
        user_id: req.user.id,
    });
    res.json(data);
});

router.put("/:id/restrict", async (req, res) => {
    const { hours = 0, minutes = 0, seconds = 0 } = req.body;
    const totalMs = ((hours * 3600) + (minutes * 60) + seconds) * 1000;
    if (totalMs <= 0) {
        res.status(400).json({ message: "Restriction duration must be greater than 0" });
        return;
    }
    const restrictionEndTime = new Date(Date.now() + totalMs).toISOString();
    const { data, error } = await supabase
        .from("hwids")
        .update({ restriction_type: "time_limit", restriction_end_time: restrictionEndTime })
        .eq("id", req.params["id"])
        .eq("user_id", req.user.id)
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "hwid.restrict",
        actor: req.user.email,
        target: req.params["id"],
        details: `Time restriction set: ${hours}h ${minutes}m ${seconds}s`,
        user_id: req.user.id,
    });
    res.json(data);
});

router.put("/:id/manual-block", async (req, res) => {
    const { reason } = req.body;
    const { data, error } = await supabase
        .from("hwids")
        .update({ restriction_type: "manual_block", restriction_end_time: null })
        .eq("id", req.params["id"])
        .eq("user_id", req.user.id)
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "hwid.manual_block",
        actor: req.user.email,
        target: req.params["id"],
        details: reason ?? "Manual device block applied",
        user_id: req.user.id,
    });
    res.json(data);
});

router.put("/:id/unblock", async (req, res) => {
    const { data, error } = await supabase
        .from("hwids")
        .update({ restriction_type: null, restriction_end_time: null })
        .eq("id", req.params["id"])
        .eq("user_id", req.user.id)
        .select()
        .single();
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    await supabase.from("audit_logs").insert({
        action: "hwid.unblock",
        actor: req.user.email,
        target: req.params["id"],
        details: "Device restriction removed",
        user_id: req.user.id,
    });
    res.json(data);
});

router.delete("/:id", async (req, res) => {
    const { error } = await supabase
        .from("hwids")
        .delete()
        .eq("id", req.params["id"])
        .eq("user_id", req.user.id);
    if (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    res.status(204).send();
});

export default router;
