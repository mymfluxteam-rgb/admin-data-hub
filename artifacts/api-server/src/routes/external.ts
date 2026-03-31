import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes } from "crypto";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

function requireApiKey(req: Request, res: Response, next: () => void) {
  const masterKey = process.env["APP_REGISTRATION_SECRET"];
  if (!masterKey) {
    res.status(503).json({
      success: false,
      error: "Service not configured",
      message: "APP_REGISTRATION_SECRET is not set on the server",
    });
    return;
  }
  const provided = req.headers["x-api-key"] as string | undefined;
  if (!provided || provided !== masterKey) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid or missing x-api-key header",
    });
    return;
  }
  next();
}

router.post("/register", requireApiKey, async (req: Request, res: Response) => {
  const { username, email, password, hwid } = req.body as {
    username?: string;
    email?: string;
    password?: string;
    hwid?: string;
  };

  if (!username || !email || !password || !hwid) {
    res.status(400).json({
      success: false,
      error: "Missing fields",
      message: "username, email, password, and hwid are all required",
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      error: "Validation",
      message: "Password must be at least 6 characters",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      error: "Validation",
      message: "Invalid email format",
    });
    return;
  }

  const [emailCheck, hwidCheck] = await Promise.all([
    supabase.from("users").select("id, username, email, status").eq("email", email).maybeSingle(),
    supabase.from("users").select("id").eq("hwid", hwid).maybeSingle(),
  ]);

  if (emailCheck.data) {
    res.status(409).json({
      success: false,
      error: "Conflict",
      message: "An account with this email already exists",
      existing: {
        username: (emailCheck.data as Record<string, unknown>)["username"],
        status: (emailCheck.data as Record<string, unknown>)["status"],
      },
    });
    return;
  }

  if (hwidCheck.data) {
    res.status(409).json({
      success: false,
      error: "Conflict",
      message: "This device (HWID) is already registered to another account",
    });
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
    res.status(500).json({
      success: false,
      error: "Database error",
      message: insertError.message,
    });
    return;
  }

  await Promise.all([
    supabase.from("hwids").insert({
      user_id: (newUser as Record<string, unknown>)["id"],
      device_id: hwid,
      device_name: "Registered Device",
      blacklisted: false,
      last_seen: new Date().toISOString(),
    }),
    supabase.from("audit_logs").insert({
      action: "user.external_register",
      actor: "external_api",
      target: email,
      details: `External registration: ${username} via API client`,
      ip_address: req.ip,
    }),
  ]);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    user: {
      id: (newUser as Record<string, unknown>)["id"],
      username: (newUser as Record<string, unknown>)["username"],
      email: (newUser as Record<string, unknown>)["email"],
      status: (newUser as Record<string, unknown>)["status"],
      role: (newUser as Record<string, unknown>)["role"],
      credits: (newUser as Record<string, unknown>)["credits"],
      publicApiKey: (newUser as Record<string, unknown>)["public_api_key"],
      accountExpiry: (newUser as Record<string, unknown>)["account_expiry"],
      createdAt: (newUser as Record<string, unknown>)["created_at"],
    },
  });
});

export default router;
