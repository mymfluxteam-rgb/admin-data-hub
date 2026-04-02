import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Cpu } from "lucide-react";

const DEFAULTS = {
  max_devices_per_user: 3,
  default_session_timeout: 120,
  enforce_fingerprinting: true,
  auto_ban_device_switch: false,
  device_switch_cooldown_hours: 24,
  max_device_switches_per_day: 2,
};

export default function HwidTab() {
  const { settings, update, loading, saving, save } = useSettingsGroup("hwid", DEFAULTS);

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
            <Cpu className="h-4 w-4 text-primary" /> Device Limits
          </CardTitle>
          <CardDescription className="text-xs">Control how many devices users can register and use</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_devices_per_user">Max Devices Per User</Label>
            <Input
              id="max_devices_per_user"
              type="number"
              min={1}
              value={settings.max_devices_per_user as number}
              onChange={(e) => update("max_devices_per_user", parseInt(e.target.value) || 3)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_session_timeout">Default Session Timeout (minutes)</Label>
            <Input
              id="default_session_timeout"
              type="number"
              min={1}
              value={settings.default_session_timeout as number}
              onChange={(e) => update("default_session_timeout", parseInt(e.target.value) || 120)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Security Policies</CardTitle>
          <CardDescription className="text-xs">Fingerprinting and device-switching rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">Enforce Device Fingerprinting</p>
              <p className="text-xs text-muted-foreground">Collect browser/OS signatures for device identification</p>
            </div>
            <Switch
              checked={settings.enforce_fingerprinting as boolean}
              onCheckedChange={(v) => update("enforce_fingerprinting", v)}
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">Auto-ban on Multiple Device Switch</p>
              <p className="text-xs text-muted-foreground">Automatically ban users who exceed the device switch limit</p>
            </div>
            <Switch
              checked={settings.auto_ban_device_switch as boolean}
              onCheckedChange={(v) => update("auto_ban_device_switch", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Device Switch Limits</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="device_switch_cooldown_hours">Cooldown Period (hours)</Label>
            <Input
              id="device_switch_cooldown_hours"
              type="number"
              min={0}
              value={settings.device_switch_cooldown_hours as number}
              onChange={(e) => update("device_switch_cooldown_hours", parseInt(e.target.value) || 24)}
            />
            <p className="text-xs text-muted-foreground">Required wait time between device switches</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_device_switches_per_day">Max Device Switches Per Day</Label>
            <Input
              id="max_device_switches_per_day"
              type="number"
              min={0}
              value={settings.max_device_switches_per_day as number}
              onChange={(e) => update("max_device_switches_per_day", parseInt(e.target.value) || 2)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
          Save HWID Settings
        </Button>
      </div>
    </div>
  );
}
