import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ShieldCheck, Lock, Bell } from "lucide-react";

const DEFAULTS = {
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
};

export default function SecurityTab() {
  const { settings, update, loading, saving, save } = useSettingsGroup("security", DEFAULTS);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Password Policy
          </CardTitle>
          <CardDescription className="text-xs">Requirements enforced when users set or change their password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="password_min_length">Minimum Password Length</Label>
            <Input
              id="password_min_length"
              type="number"
              min={6}
              max={64}
              value={settings.password_min_length as number}
              onChange={(e) => update("password_min_length", parseInt(e.target.value) || 8)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {([
              ["require_uppercase", "Require uppercase letters (A-Z)"],
              ["require_numbers", "Require numbers (0-9)"],
              ["require_symbols", "Require symbols (!@#$...)"],
            ] as [keyof typeof DEFAULTS, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={settings[key] as boolean}
                  onCheckedChange={(v) => update(key, v === true)}
                />
                <Label htmlFor={key} className="font-normal text-sm cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Session Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">Require Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Force all users to set up 2FA before accessing the system</p>
            </div>
            <Switch
              checked={settings.require_2fa as boolean}
              onCheckedChange={(v) => update("require_2fa", v)}
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">IP Binding</p>
              <p className="text-xs text-muted-foreground">Lock sessions to the IP address used at login</p>
            </div>
            <Switch
              checked={settings.ip_binding as boolean}
              onCheckedChange={(v) => update("ip_binding", v)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Device Tracking</p>
              <p className="text-xs text-muted-foreground">Track devices used per session for anomaly detection</p>
            </div>
            <Switch
              checked={settings.device_tracking as boolean}
              onCheckedChange={(v) => update("device_tracking", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Alerts & Audit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="audit_log_retention_days">Audit Log Retention (days)</Label>
            <Input
              id="audit_log_retention_days"
              type="number"
              min={1}
              value={settings.audit_log_retention_days as number}
              onChange={(e) => update("audit_log_retention_days", parseInt(e.target.value) || 90)}
            />
            <p className="text-xs text-muted-foreground">Logs older than this are automatically deleted</p>
          </div>
          <div className="space-y-3 border-t border-border/30 pt-4">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div>
                <p className="text-sm font-medium">Failed Login Alerts</p>
                <p className="text-xs text-muted-foreground">Notify admins when accounts hit the login attempt limit</p>
              </div>
              <Switch
                checked={settings.failed_login_alert as boolean}
                onCheckedChange={(v) => update("failed_login_alert", v)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Suspicious Activity Alerts</p>
                <p className="text-xs text-muted-foreground">Detect and alert on unusual login patterns or locations</p>
              </div>
              <Switch
                checked={settings.suspicious_activity_alert as boolean}
                onCheckedChange={(v) => update("suspicious_activity_alert", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}
