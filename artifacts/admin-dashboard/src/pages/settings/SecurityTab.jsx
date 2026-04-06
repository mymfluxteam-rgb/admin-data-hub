import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ShieldCheck, Lock, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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
    const { t } = useLanguage();
    if (loading) {
        return (<div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full"/>)}
      </div>);
    }
    const checkboxItems = [
        ["require_uppercase", "security.requireUppercase"],
        ["require_numbers", "security.requireNumbers"],
        ["require_symbols", "security.requireSymbols"],
    ];
    return (<div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary"/> {t("security.passwordPolicy")}
          </CardTitle>
          <CardDescription className="text-xs">{t("security.passwordPolicyDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="password_min_length">{t("security.minLength")}</Label>
            <Input id="password_min_length" type="number" min={6} max={64} value={settings.password_min_length} onChange={(e) => update("password_min_length", parseInt(e.target.value) || 8)}/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {checkboxItems.map(([key, labelKey]) => (<div key={key} className="flex items-center gap-2">
                <Checkbox id={key} checked={settings[key]} onCheckedChange={(v) => update(key, v === true)}/>
                <Label htmlFor={key} className="font-normal text-sm cursor-pointer">{t(labelKey)}</Label>
              </div>))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary"/> {t("security.sessionSecurity")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">{t("security.require2fa")}</p>
              <p className="text-xs text-muted-foreground">{t("security.require2faDesc")}</p>
            </div>
            <Switch checked={settings.require_2fa} onCheckedChange={(v) => update("require_2fa", v)}/>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">{t("security.ipBinding")}</p>
              <p className="text-xs text-muted-foreground">{t("security.ipBindingDesc")}</p>
            </div>
            <Switch checked={settings.ip_binding} onCheckedChange={(v) => update("ip_binding", v)}/>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">{t("security.deviceTracking")}</p>
              <p className="text-xs text-muted-foreground">{t("security.deviceTrackingDesc")}</p>
            </div>
            <Switch checked={settings.device_tracking} onCheckedChange={(v) => update("device_tracking", v)}/>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary"/> {t("security.alertsAudit")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="audit_log_retention_days">{t("security.auditRetention")}</Label>
            <Input id="audit_log_retention_days" type="number" min={1} value={settings.audit_log_retention_days} onChange={(e) => update("audit_log_retention_days", parseInt(e.target.value) || 90)}/>
            <p className="text-xs text-muted-foreground">{t("security.auditRetentionDesc")}</p>
          </div>
          <div className="space-y-3 border-t border-border/30 pt-4">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div>
                <p className="text-sm font-medium">{t("security.failedLogin")}</p>
                <p className="text-xs text-muted-foreground">{t("security.failedLoginDesc")}</p>
              </div>
              <Switch checked={settings.failed_login_alert} onCheckedChange={(v) => update("failed_login_alert", v)}/>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{t("security.suspiciousActivity")}</p>
                <p className="text-xs text-muted-foreground">{t("security.suspiciousActivityDesc")}</p>
              </div>
              <Switch checked={settings.suspicious_activity_alert} onCheckedChange={(v) => update("suspicious_activity_alert", v)}/>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin"/>}
          {t("security.save")}
        </Button>
      </div>
    </div>);
}
