import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { randomBytes } from "crypto";
import { supabase } from "../lib/supabase";
const router = Router();
const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many registration attempts. Please try again in 15 minutes." },
});
router.post("/", registrationLimiter, async (req, res) => {
    const { username, email, password, hwid } = req.body;
    if (!username || !email || !password || !hwid) {
        res.status(400).json({ message: "username, email, password, and hwid are required" });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ message: "Password must be at least 6 characters" });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Invalid email format" });
        return;
    }
    const [emailCheck, hwidCheck] = await Promise.all([
        supabase.from("users").select("id").eq("email", email).maybeSingle(),
        supabase.from("users").select("id").eq("hwid", hwid).maybeSingle(),
    ]);
    if (emailCheck.data) {
        res.status(409).json({ message: "An account with this email already exists" });
        return;
    }
    if (hwidCheck.data) {
        res.status(409).json({ message: "This device is already registered to an account" });
        return;
    }
    const publicApiKey = randomBytes(16).toString("hex");
    const accountExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
        username,
        email,
        password_hash: password,
        hwid,
        status: "active",
        verified: false,
        credits: 0,
        role: "user",
        public_api_key: publicApiKey,
        account_expiry: accountExpiry,
    })
        .select("id, username, email, status, verified, credits, role, public_api_key, account_expiry, created_at")
        .single();
    if (insertError) {
        res.status(500).json({ message: insertError.message });
        return;
    }
    await Promise.all([
        supabase.from("hwids").insert({
            user_id: newUser["id"],
            device_id: hwid,
            device_name: "Registered Device",
            blacklisted: false,
            last_seen: new Date().toISOString(),
        }),
        supabase.from("audit_logs").insert({
            action: "user.register",
            actor: email,
            target: email,
            details: `New user registered: ${username} (API key generated)`,
        }),
    ]);
    res.status(201).json({
        message: "Registration successful",
        user: newUser,
    });
});
export default router;
