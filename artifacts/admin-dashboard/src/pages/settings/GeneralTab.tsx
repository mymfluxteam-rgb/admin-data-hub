import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Globe, Mail, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n/translations";

const DEFAULTS = {
  system_name: "LicenseAdmin",
  logo_url: "",
  timezone: "UTC",
  date_format: "MM/DD/YYYY",
  language: "en",
  contact_email: "",
  maintenance_mode: false,
};

export default function GeneralTab() {
  const { settings, update, loading, saving, save } = useSettingsGroup("general", DEFAULTS);
  const { t, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: string) => {
    update("language", lang);
    setLanguage(lang as Language);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> {t("general.systemIdentity")}
          </CardTitle>
          <CardDescription className="text-xs">{t("general.systemIdentityDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="system_name">{t("general.systemName")}</Label>
            <Input
              id="system_name"
              value={settings.system_name as string}
              onChange={(e) => update("system_name", e.target.value)}
              placeholder="LicenseAdmin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo_url">{t("general.logoUrl")}</Label>
            <Input
              id="logo_url"
              value={settings.logo_url as string}
              onChange={(e) => update("logo_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">{t("general.timezone")}</Label>
            <Select value={settings.timezone as string} onValueChange={(v) => update("timezone", v)}>
              <SelectTrigger id="timezone"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_format">{t("general.dateFormat")}</Label>
            <Select value={settings.date_format as string} onValueChange={(v) => update("date_format", v)}>
              <SelectTrigger id="date_format"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">{t("general.language")}</Label>
            <Select value={settings.language as string} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> {t("general.contact")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="contact_email">{t("general.contactEmail")}</Label>
            <Input
              id="contact_email"
              type="email"
              value={settings.contact_email as string}
              onChange={(e) => update("contact_email", e.target.value)}
              placeholder="admin@yourdomain.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> {t("general.maintenanceMode")}
          </CardTitle>
          <CardDescription className="text-xs">{t("general.maintenanceModeDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              checked={settings.maintenance_mode as boolean}
              onCheckedChange={(v) => update("maintenance_mode", v)}
              className="data-[state=checked]:bg-amber-500"
            />
            <span className="text-sm">
              {settings.maintenance_mode ? (
                <span className="text-amber-400 font-medium">{t("general.maintenanceOn")}</span>
              ) : (
                <span className="text-muted-foreground">{t("general.maintenanceOff")}</span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
          {t("general.save")}
        </Button>
      </div>
    </div>
  );
}
