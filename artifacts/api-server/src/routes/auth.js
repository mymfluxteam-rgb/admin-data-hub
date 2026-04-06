import { Router } from "express";
import { supabase } from "../lib/supabase";
import crypto from "crypto";
const router = Router();
const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const pkceStore = new Map();
function cleanupPkce() {
    const now = Date.now();
    for (const [k, v] of pkceStore)
        if (v.expiresAt < now)
            pkceStore.delete(k);
}
function generateCodeVerifier() {
    return crypto.randomBytes(32).toString("base64url");
}
function generateCodeChallenge(verifier) {
    return crypto.createHash("sha256").update(verifier).digest("base64url");
}
function getAppOrigin(req) {
    const proto = req.headers["x-forwarded-proto"]?.split(",")[0]?.trim() ??
        req.protocol;
    const host = req.headers["x-forwarded-host"]?.split(",")[0]?.trim() ??
        req.headers.host ??
        "localhost";
    return `${proto}://${host}`;
}
function buildOAuthUrl(provider, req) {
    cleanupPkce();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = crypto.randomBytes(16).toString("hex");
    pkceStore.set(state, { codeVerifier, expiresAt: Date.now() + 10 * 60 * 1000 });
    const callbackUrl = `${getAppOrigin(req)}/auth/callback`;
    const authUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
    authUrl.searchParams.set("provider", provider);
    authUrl.searchParams.set("redirect_to", callbackUrl);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("state", state);
    return { url: authUrl.toString(), state };
}
// ── Email / password login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
        res.status(401).json({ message: error?.message ?? "Invalid credentials" });
        return;
    }
    const user = data.user;
    res.json({
        token: data.session.access_token,
        user: {
            id: user.id,
            email: user.email ?? "",
            username: user.user_metadata?.["username"] ?? user.email ?? "",
            role: user.user_metadata?.["role"] ?? "admin",
            status: "active",
            verified: user.email_confirmed_at != null,
            credits: 0,
            created_at: user.created_at,
        },
    });
});
// ── OAuth — initiate Google / GitHub flow ─────────────────────────────────────
router.get("/google", (req, res) => {
    const { url } = buildOAuthUrl("google", req);
    res.redirect(url);
});
router.get("/github", (req, res) => {
    const { url } = buildOAuthUrl("github", req);
    res.redirect(url);
});
// ── OAuth callback — exchange code → session → redirect to frontend ───────────
router.get("/callback", async (req, res) => {
    const { code, state, error: oauthError } = req.query;
    if (oauthError || !code) {
        res.redirect(`/login?oauth_error=${encodeURIComponent(oauthError ?? "missing_code")}`);
        return;
    }
    const stored = state ? pkceStore.get(state) : undefined;
    if (!stored || stored.expiresAt < Date.now()) {
        res.redirect("/login?oauth_error=state_mismatch");
        return;
    }
    pkceStore.delete(state);
    // Exchange auth code + PKCE code verifier for tokens via Supabase REST API
    const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: supabaseServiceKey,
        },
        body: JSON.stringify({ auth_code: code, code_verifier: stored.codeVerifier }),
    });
    const tokenData = (await tokenRes.json());
    if (!tokenRes.ok || !tokenData.access_token) {
        const msg = tokenData.error_description ?? tokenData.error ?? "exchange_failed";
        res.redirect(`/login?oauth_error=${encodeURIComponent(msg)}`);
        return;
    }
    // ── Email-conflict middleware ─────────────────────────────────────────────
    // Supabase merges accounts with the same email automatically.
    // If the user signed up with email/password and now uses OAuth (same email),
    // Supabase links the identities. We detect and allow this — no action needed.
    const identities = tokenData.user?.identities ?? [];
    const hasPasswordIdentity = identities.some((id) => id.provider === "email");
    const hasOAuthIdentity = identities.some((id) => id.provider !== "email");
    const linkedHint = hasPasswordIdentity && hasOAuthIdentity ? "&linked=1" : "";
    res.redirect(`/login?oauth_token=${encodeURIComponent(tokenData.access_token)}${linkedHint}`);
});
export default router;
