import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

const DEFAULTS: Record<string, unknown> = {
  general: {
    system_name: "LicenseAdmin",
    logo_url: "",
    timezone: "UTC",
    date_format: "MM/DD/YYYY",
    language: "en",
    contact_email: "",
    maintenance_mode: false,
  },
  user_management: {
    default_role: "user",
    auto_verify_email: false,
    require_admin_approval: false,
    default_credits: 0,
    session_timeout: 60,
    max_login_attempts: 5,
    account_lock_duration: 30,
  },
  api: {
    default_rate_limit: 100,
    default_key_expiry_days: 365,
    allowed_origins: [],
    api_version: "v1",
    api_access_enabled: true,
    require_ip_whitelist: false,
  },
  hwid: {
    max_devices_per_user: 3,
    default_session_timeout: 120,
    enforce_fingerprinting: true,
    auto_ban_device_switch: false,
    device_switch_cooldown_hours: 24,
    max_device_switches_per_day: 2,
  },
  credits: {
    base_credit_price: 1.0,
    min_credit_purchase: 10,
    max_credit_purchase: 10000,
    free_credits_on_registration: 0,
    credit_expiry_days: 0,
    auto_deduction_enabled: false,
  },
  security: {
    password_min_length: 8,
    require_uppercase: true,
    require_numbers: true,
    require_symbols: false,
    require_2fa: false,
    ip_binding: false,
    device_tracking: true,
    audit_log_retention_days: 90,
    failed_login_alert: true,
    suspicious_activity_alert: true,
  },
  notifications: {
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_password: "",
    from_email: "",
    from_name: "LicenseAdmin",
    welcome_email_template: "Welcome to {{system_name}}! Your account has been created.",
    password_reset_template: "Click the link below to reset your password: {{reset_link}}",
    credit_low_alert_template: "Your credit balance is low ({{credits}} remaining). Please top up.",
    webhook_urls: [],
  },
  backup: {
    scheduled_backup: "daily",
    last_backup_time: null,
  },
};

// GET /api/settings — return all settings groups
router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("admin_settings")
    .select("setting_key, setting_value, setting_group, updated_at");
  if (error) { res.status(500).json({ message: error.message }); return; }

  const result: Record<string, unknown> = { ...DEFAULTS };
  for (const row of (data ?? [])) {
    const r = row as Record<string, unknown>;
    result[r["setting_key"] as string] = r["setting_value"];
  }
  res.json(result);
});

// GET /api/settings/:group — return a single group's settings
router.get("/:group", async (req, res) => {
  const { group } = req.params;
  const { data, error } = await supabase
    .from("admin_settings")
    .select("setting_value")
    .eq("setting_key", group)
    .maybeSingle();
  if (error) { res.status(500).json({ message: error.message }); return; }
  const value = data ? (data as Record<string, unknown>)["setting_value"] : DEFAULTS[group] ?? {};
  res.json(value);
});

// PUT /api/settings/:group — upsert a settings group
router.put("/:group", async (req, res) => {
  const { group } = req.params;
  const { updated_by, ...value } = req.body as Record<string, unknown>;

  const { data, error } = await supabase
    .from("admin_settings")
    .upsert({
      setting_key: group,
      setting_value: value,
      setting_group: group,
      updated_by: updated_by ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "setting_key" })
    .select()
    .single();
  if (error) { res.status(500).json({ message: error.message }); return; }

  await supabase.from("audit_logs").insert({
    action: "settings.update",
    actor: (updated_by as string) ?? "admin",
    target: group,
    details: `Updated ${group} settings`,
  });

  res.json((data as Record<string, unknown>)["setting_value"]);
});

export default router;
