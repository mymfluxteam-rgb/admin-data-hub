import { useState } from "react";
import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Key, Globe, Plus, X } from "lucide-react";

const DEFAULTS = {
  default_rate_limit: 100,
  default_key_expiry_days: 365,
  allowed_origins: [] as string[],
  api_version: "v1",
  api_access_enabled: true,
  require_ip_whitelist: false,
};

export default function ApiSettingsTab() {
  const { settings, update, loading, saving, save } = useSettingsGroup("api", DEFAULTS);
  const [newOrigin, setNewOrigin] = useState("");

  const addOrigin = () => {
    const trimmed = newOrigin.trim();
    if (!trimmed) return;
    const origins = (settings.allowed_origins as string[]) ?? [];
    if (!origins.includes(trimmed)) {
      update("allowed_origins", [...origins, trimmed]);
    }
    setNewOrigin("");
  };

  const removeOrigin = (origin: string) => {
    update("allowed_origins", (settings.allowed_origins as string[]).filter((o) => o !== origin));
  };

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
            <Key className="h-4 w-4 text-primary" /> API Key Defaults
          </CardTitle>
          <CardDescription className="text-xs">Default values applied to newly created API keys</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="default_rate_limit">Default Rate Limit (requests/min)</Label>
            <Input
              id="default_rate_limit"
              type="number"
              min={1}
              value={settings.default_rate_limit as number}
              onChange={(e) => update("default_rate_limit", parseInt(e.target.value) || 100)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_key_expiry_days">Default Key Expiry (days)</Label>
            <Input
              id="default_key_expiry_days"
              type="number"
              min={1}
              value={settings.default_key_expiry_days as number}
              onChange={(e) => update("default_key_expiry_days", parseInt(e.target.value) || 365)}
            />
            <p className="text-xs text-muted-foreground">Set to 0 for no expiry</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api_version">API Version</Label>
            <Select value={settings.api_version as string} onValueChange={(v) => update("api_version", v)}>
              <SelectTrigger id="api_version"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">v1</SelectItem>
                <SelectItem value="v2">v2</SelectItem>
                <SelectItem value="v3">v3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> CORS — Allowed Origins
          </CardTitle>
          <CardDescription className="text-xs">
            Domains allowed to make cross-origin requests. Leave empty to allow all origins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              placeholder="https://app.example.com"
              onKeyDown={(e) => e.key === "Enter" && addOrigin()}
            />
            <Button variant="outline" size="sm" onClick={addOrigin} className="shrink-0 gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {(settings.allowed_origins as string[]).length === 0 ? (
              <p className="text-xs text-muted-foreground">No origin restrictions (all origins allowed)</p>
            ) : (
              (settings.allowed_origins as string[]).map((origin) => (
                <Badge key={origin} variant="secondary" className="gap-1 font-mono text-xs">
                  {origin}
                  <button onClick={() => removeOrigin(origin)} className="hover:text-destructive ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Access Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">API Access Enabled</p>
              <p className="text-xs text-muted-foreground">Disable to block all third-party API requests</p>
            </div>
            <Switch
              checked={settings.api_access_enabled as boolean}
              onCheckedChange={(v) => update("api_access_enabled", v)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Require IP Whitelist</p>
              <p className="text-xs text-muted-foreground">Only allow requests from IPs listed on each key</p>
            </div>
            <Switch
              checked={settings.require_ip_whitelist as boolean}
              onCheckedChange={(v) => update("require_ip_whitelist", v)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
          Save API Settings
        </Button>
      </div>
    </div>
  );
}
