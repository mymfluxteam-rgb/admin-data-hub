import { useState } from "react";
import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Mail, Webhook, Plus, X, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
const DEFAULTS = {
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
};
export default function NotificationsTab() {
    const { settings, update, loading, saving, save } = useSettingsGroup("notifications", DEFAULTS);
    const [showPassword, setShowPassword] = useState(false);
    const [newWebhook, setNewWebhook] = useState("");
    const { t } = useLanguage();
    const addWebhook = () => {
        const trimmed = newWebhook.trim();
        if (!trimmed)
            return;
        const urls = settings.webhook_urls ?? [];
        if (!urls.includes(trimmed)) {
            update("webhook_urls", [...urls, trimmed]);
        }
        setNewWebhook("");
    };
    const removeWebhook = (url) => {
        update("webhook_urls", settings.webhook_urls.filter((u) => u !== url));
    };
    if (loading) {
        return (<div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full"/>)}
      </div>);
    }
    const emailTemplates = [
        ["welcome_email_template", "notifications.welcomeEmail", "notifications.welcomeEmailHint"],
        ["password_reset_template", "notifications.passwordReset", "notifications.passwordResetHint"],
        ["credit_low_alert_template", "notifications.creditLow", "notifications.creditLowHint"],
    ];
    return (<div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary"/> {t("notifications.smtp")}
          </CardTitle>
          <CardDescription className="text-xs">{t("notifications.smtpDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">{t("notifications.smtpHost")}</Label>
            <Input id="smtp_host" value={settings.smtp_host} onChange={(e) => update("smtp_host", e.target.value)} placeholder="smtp.example.com"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_port">{t("notifications.smtpPort")}</Label>
            <Input id="smtp_port" type="number" value={settings.smtp_port} onChange={(e) => update("smtp_port", parseInt(e.target.value) || 587)} placeholder="587"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_user">{t("notifications.smtpUser")}</Label>
            <Input id="smtp_user" value={settings.smtp_user} onChange={(e) => update("smtp_user", e.target.value)} placeholder="user@example.com"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_password">{t("notifications.smtpPassword")}</Label>
            <div className="relative">
              <Input id="smtp_password" type={showPassword ? "text" : "password"} value={settings.smtp_password} onChange={(e) => update("smtp_password", e.target.value)} placeholder="••••••••" className="pr-10"/>
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="from_email">{t("notifications.fromEmail")}</Label>
            <Input id="from_email" type="email" value={settings.from_email} onChange={(e) => update("from_email", e.target.value)} placeholder="noreply@example.com"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="from_name">{t("notifications.fromName")}</Label>
            <Input id="from_name" value={settings.from_name} onChange={(e) => update("from_name", e.target.value)} placeholder="LicenseAdmin"/>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("notifications.emailTemplates")}</CardTitle>
          <CardDescription className="text-xs">
            {t("notifications.emailTemplatesDesc")} — use <code className="bg-muted px-1 rounded font-mono text-xs">{"{{variable}}"}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailTemplates.map(([key, labelKey, hintKey]) => (<div key={key} className="space-y-2">
              <Label htmlFor={key}>{t(labelKey)}</Label>
              <p className="text-xs text-muted-foreground">{t(hintKey)}</p>
              <textarea id={key} rows={3} value={settings[key]} onChange={(e) => update(key, e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"/>
            </div>))}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="h-4 w-4 text-primary"/> {t("notifications.webhooks")}
          </CardTitle>
          <CardDescription className="text-xs">{t("notifications.webhooksDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={newWebhook} onChange={(e) => setNewWebhook(e.target.value)} placeholder="https://hooks.example.com/events" onKeyDown={(e) => e.key === "Enter" && addWebhook()}/>
            <Button variant="outline" size="sm" onClick={addWebhook} className="shrink-0 gap-1">
              <Plus className="h-4 w-4"/> {t("notifications.add")}
            </Button>
          </div>
          <div className="space-y-2 min-h-[2rem]">
            {settings.webhook_urls.length === 0 ? (<p className="text-xs text-muted-foreground">{t("notifications.noWebhooks")}</p>) : (settings.webhook_urls.map((url) => (<div key={url} className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border/30">
                  <span className="font-mono text-xs truncate">{url}</span>
                  <button onClick={() => removeWebhook(url)} className="ml-2 text-muted-foreground hover:text-destructive shrink-0">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                </div>)))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin"/>}
          {t("notifications.save")}
        </Button>
      </div>
    </div>);
}
