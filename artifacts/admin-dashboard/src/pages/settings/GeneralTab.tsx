import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Globe, Mail, AlertTriangle } from "lucide-react";

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
            <Globe className="h-4 w-4 text-primary" /> System Identity
          </CardTitle>
          <CardDescription className="text-xs">Name, branding, and locale configuration</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="system_name">System Name</Label>
            <Input
              id="system_name"
              value={settings.system_name as string}
              onChange={(e) => update("system_name", e.target.value)}
              placeholder="LicenseAdmin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={settings.logo_url as string}
              onChange={(e) => update("logo_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
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
            <Label htmlFor="date_format">Date Format</Label>
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
            <Label htmlFor="language">Language</Label>
            <Select value={settings.language as string} onValueChange={(v) => update("language", v)}>
              <SelectTrigger id="language"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="contact_email">Contact Email</Label>
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
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Maintenance Mode
          </CardTitle>
          <CardDescription className="text-xs">
            When enabled, the system will show a maintenance page to all users
          </CardDescription>
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
                <span className="text-amber-400 font-medium">Maintenance mode is ON</span>
              ) : (
                <span className="text-muted-foreground">Maintenance mode is off</span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
          Save General Settings
        </Button>
      </div>
    </div>
  );
}
