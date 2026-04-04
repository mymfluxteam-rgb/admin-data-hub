/**
 * POST /api/v1/public/register
 *
 * Public user-registration endpoint authenticated by a Public API Key + App Secret pair
 * from the user_api_keys table.  Intended to be called from your own application backend
 * or client SDK — not from the admin dashboard.
 *
 * Headers (preferred):
 *   x-api-key:    mym_live_xxxx   (Public API Key)
 *   x-api-secret: mym_secret_xxxx (Application Secret)
 *
 * Body:
 *   { username, email, password, hwid?, role? }
 *
 * Returns 201 on success with the new user object (password_hash excluded).
 * The new user's owner_id is set to the user_id stored on the matched api key row.
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes } from "crypto";
import { rateLimit } from "express-rate-limit";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

// ── Rate limit: max 10 registrations per IP per 15 min ──────────────────────
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "RATE_LIMITED",
    message: "Too many registration attempts. Please retry in 15 minutes.",
  },
});

// ── Helper: extract credentials from headers OR body ────────────────────────
function extractCredentials(req: Request): { publicKey: string | null; appSecret: string | null } {
  const publicKey =
    (req.headers["x-api-key"] as string | undefined)?.trim() ||
    (req.body as Record<string, string>)["public_key"]?.trim() ||
    null;

  const appSecret =
    (req.headers["x-api-secret"] as string | undefined)?.trim() ||
    (req.body as Record<string, string>)["app_secret"]?.trim() ||
    null;

  return { publicKey, appSecret };
}

// ── POST /register ───────────────────────────────────────────────────────────
router.post("/register", registrationLimiter, async (req: Request, res: Response) => {
  // 1. Extract & validate key credentials
  const { publicKey, appSecret } = extractCredentials(req);

  if (!publicKey || !appSecret) {
    res.status(401).json({
      success: false,
      error: "MISSING_CREDENTIALS",
      message:
        "Provide your Public API Key via the x-api-key header (or body.public_key) " +
        "and your App Secret via x-api-secret (or body.app_secret).",
    });
    return;
  }

  // 2. Look up the API key in user_api_keys
  const { data: apiKeyRow, error: keyErr } = await supabase
    .from("user_api_keys")
    .select("id, user_id, app_name, public_key, app_secret, is_active")
    .eq("public_key", publicKey)
    .maybeSingle();

  if (keyErr) {
    if (keyErr.code === "42P01") {
      // Table doesn't exist yet
      res.status(503).json({
        success: false,
        error: "MIGRATION_REQUIRED",
        message:
          "The user_api_keys table does not exist. " +
          "Run migration 001_user_api_keys.sql in your Supabase SQL Editor.",
      });
      return;
    }
    res.status(500).json({ success: false, error: "DB_ERROR", message: keyErr.message });
    return;
  }

  if (!apiKeyRow) {
    res.status(401).json({
      success: false,
      error: "INVALID_KEY",
      message: "The provided Public API Key does not exist.",
    });
    return;
  }

  const keyRow = apiKeyRow as {
    id: string;
    user_id: string;
    app_name: string;
    public_key: string;
    app_secret: string;
    is_active: boolean;
  };

  // 3. Verify the key is active
  if (!keyRow.is_active) {
    res.status(403).json({
      success: false,
      error: "KEY_REVOKED",
      message: "This API key has been revoked. Contact the account owner.",
    });
    return;
  }

  // 4. Verify the app secret
  if (keyRow.app_secret !== appSecret) {
    res.status(401).json({
      success: false,
      error: "INVALID_SECRET",
      message: "The Application Secret does not match.",
    });
    return;
  }

  // 5. Validate registration body fields
  const { username, email, password, hwid, role } = req.body as {
    username?: string;
    email?: string;
    password?: string;
    hwid?: string;
    role?: string;
  };

  const errors: string[] = [];
  if (!username || !username.trim()) errors.push("username is required");
  if (!email || !email.trim()) errors.push("email is required");
  if (!password || password.length < 6) errors.push("password must be at least 6 characters");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? "")) errors.push("email format is invalid");

  if (errors.length > 0) {
    res.status(400).json({ success: false, error: "VALIDATION", messages: errors });
    return;
  }

  const normalizedEmail = email!.trim().toLowerCase();
  const normalizedUsername = username!.trim();

  // 6. Duplicate checks (email + HWID)
  const duplicateChecks = await Promise.all([
    supabase.from("users").select("id").eq("email", normalizedEmail).maybeSingle(),
    hwid
      ? supabase.from("users").select("id").eq("hwid", hwid).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (duplicateChecks[0].data) {
    res.status(409).json({
      success: false,
      error: "DUPLICATE_EMAIL",
      message: "An account with this email already exists.",
    });
    return;
  }
  if (duplicateChecks[1].data) {
    res.status(409).json({
      success: false,
      error: "DUPLICATE_HWID",
      message: "This device is already registered to an account.",
    });
    return;
  }

  // 7. Generate the new user's own public API key + 30-day default expiry
  const userPublicApiKey = randomBytes(16).toString("hex");
  const accountExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // 8. Insert user — include owner_id if the column exists
  const userPayload: Record<string, unknown> = {
    username: normalizedUsername,
    email: normalizedEmail,
    password_hash: password,
    status: "active",
    verified: false,
    credits: 0,
    role: role === "admin" ? "user" : (role ?? "user"), // never let API grant admin
    public_api_key: userPublicApiKey,
    account_expiry: accountExpiry,
    ...(hwid ? { hwid } : {}),
    // Link to the account owner — requires migration 002_users_owner_id.sql
    owner_id: keyRow.user_id,
    registered_via_key_id: keyRow.id,
  };

  const { data: newUser, error: insertErr } = await supabase
    .from("users")
    .insert(userPayload)
    .select(
      "id, username, email, status, verified, credits, role, public_api_key, account_expiry, owner_id, registered_via_key_id, created_at"
    )
    .single();

  // If the owner_id / registered_via_key_id columns don't exist yet, retry without them
  let finalUser = newUser as Record<string, unknown> | null;
  if (insertErr) {
    if (insertErr.code === "42703") {
      // Column doesn't exist — fall back to base fields only
      const { username: _un, email: _em, ...restPayload } = userPayload as Record<string, unknown>;
      const fallbackPayload: Record<string, unknown> = {
        username: normalizedUsername,
        email: normalizedEmail,
        password_hash: password,
        status: "active",
        verified: false,
        credits: 0,
        role: role === "admin" ? "user" : (role ?? "user"),
        public_api_key: userPublicApiKey,
        account_expiry: accountExpiry,
        ...(hwid ? { hwid } : {}),
      };
      void _un; void _em; void restPayload;

      const { data: fallbackUser, error: fallbackErr } = await supabase
        .from("users")
        .insert(fallbackPayload)
        .select(
          "id, username, email, status, verified, credits, role, public_api_key, account_expiry, created_at"
        )
        .single();

      if (fallbackErr) {
        if (fallbackErr.code === "23505") {
          res.status(409).json({
            success: false,
            error: "DUPLICATE_USER",
            message: "A user with that email or username already exists.",
          });
          return;
        }
        res.status(500).json({ success: false, error: "DB_ERROR", message: fallbackErr.message });
        return;
      }

      finalUser = fallbackUser as Record<string, unknown>;
    } else if (insertErr.code === "23505") {
      res.status(409).json({
        success: false,
        error: "DUPLICATE_USER",
        message: "A user with that email or username already exists.",
      });
      return;
    } else {
      res.status(500).json({ success: false, error: "DB_ERROR", message: insertErr.message });
      return;
    }
  }

  if (!finalUser) {
    res.status(500).json({ success: false, error: "UNKNOWN", message: "User creation failed." });
    return;
  }

  // 9. Register HWID entry if provided
  if (hwid) {
    await supabase.from("hwids").insert({
      user_id: finalUser["id"],
      device_id: hwid,
      device_name: "Registered Device",
      blacklisted: false,
      last_seen: new Date().toISOString(),
    });
  }

  // 10. Audit log
  await supabase.from("audit_logs").insert({
    action: "user.public_register",
    actor: keyRow.app_name,
    target: normalizedEmail,
    details:
      `Public API registration — app: "${keyRow.app_name}", ` +
      `owner: ${keyRow.user_id}, key: ${keyRow.id.slice(0, 8)}…`,
  });

  // 11. Respond — exclude password_hash
  res.status(201).json({
    success: true,
    message: "Registration successful",
    app: keyRow.app_name,
    owner_id: keyRow.user_id,
    user: finalUser,
  });
});

export default router;
