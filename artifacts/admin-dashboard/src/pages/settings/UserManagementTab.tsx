import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Users, Shield, Clock } from "lucide-react";

const DEFAULTS = {
  default_role: "user",
  auto_verify_email: false,
  require_admin_approval: false,
  default_credits: 0,
  session_timeout: 60,
  max_login_attempts: 5,
  account_lock_duration: 30,
};

export default function UserManagementTab() {
  const { settings, update, loading, saving, save } = useSettingsGroup("user_management", DEFAULTS);

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
            <Users className="h-4 w-4 text-primary" /> Registration Defaults
          </CardTitle>
          <CardDescription className="text-xs">Settings applied when a new user registers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_role">Default User Role</Label>
              <Select value={settings.default_role as string} onValueChange={(v) => update("default_role", v)}>
                <SelectTrigger id="default_role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_credits">Free Credits on Registration</Label>
              <Input
                id="default_credits"
                type="number"
                min={0}
                value={settings.default_credits as number}
                onChange={(e) => update("default_credits", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div>
                <p className="text-sm font-medium">Auto-verify email on registration</p>
                <p className="text-xs text-muted-foreground">Skip email verification step for new users</p>
              </div>
              <Switch
                checked={settings.auto_verify_email as boolean}
                onCheckedChange={(v) => update("auto_verify_email", v)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Require admin approval for new users</p>
                <p className="text-xs text-muted-foreground">New accounts must be manually approved before activation</p>
              </div>
              <Switch
                checked={settings.require_admin_approval as boolean}
                onCheckedChange={(v) => update("require_admin_approval", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Session Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
            <Input
              id="session_timeout"
              type="number"
              min={1}
              value={settings.session_timeout as number}
              onChange={(e) => update("session_timeout", parseInt(e.target.value) || 60)}
            />
            <p className="text-xs text-muted-foreground">Users are logged out after this period of inactivity</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Account Lock Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_login_attempts">Max Login Attempts Before Lock</Label>
            <Input
              id="max_login_attempts"
              type="number"
              min={1}
              max={20}
              value={settings.max_login_attempts as number}
              onChange={(e) => update("max_login_attempts", parseInt(e.target.value) || 5)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_lock_duration">Account Lock Duration (minutes)</Label>
            <Input
              id="account_lock_duration"
              type="number"
              min={1}
              value={settings.account_lock_duration as number}
              onChange={(e) => update("account_lock_duration", parseInt(e.target.value) || 30)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
          Save User Management Settings
        </Button>
      </div>
    </div>
  );
}
