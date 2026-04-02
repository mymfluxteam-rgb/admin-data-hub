import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CreditCard, DollarSign } from "lucide-react";

const DEFAULTS = {
  base_credit_price: 1.0,
  min_credit_purchase: 10,
  max_credit_purchase: 10000,
  free_credits_on_registration: 0,
  credit_expiry_days: 0,
  auto_deduction_enabled: false,
};

export default function CreditsTab() {
  const { settings, update, loading, saving, save } = useSettingsGroup("credits", DEFAULTS);

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
            <DollarSign className="h-4 w-4 text-primary" /> Pricing
          </CardTitle>
          <CardDescription className="text-xs">Configure credit pricing and purchase limits</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base_credit_price">Base Credit Price ($ per credit)</Label>
            <Input
              id="base_credit_price"
              type="number"
              min={0.01}
              step={0.01}
              value={settings.base_credit_price as number}
              onChange={(e) => update("base_credit_price", parseFloat(e.target.value) || 1.0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="free_credits_on_registration">Free Credits on Registration</Label>
            <Input
              id="free_credits_on_registration"
              type="number"
              min={0}
              value={settings.free_credits_on_registration as number}
              onChange={(e) => update("free_credits_on_registration", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_credit_purchase">Minimum Credit Purchase</Label>
            <Input
              id="min_credit_purchase"
              type="number"
              min={1}
              value={settings.min_credit_purchase as number}
              onChange={(e) => update("min_credit_purchase", parseInt(e.target.value) || 10)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_credit_purchase">Maximum Credit Purchase</Label>
            <Input
              id="max_credit_purchase"
              type="number"
              min={1}
              value={settings.max_credit_purchase as number}
              onChange={(e) => update("max_credit_purchase", parseInt(e.target.value) || 10000)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Credit Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="credit_expiry_days">Credit Expiry (days)</Label>
            <Input
              id="credit_expiry_days"
              type="number"
              min={0}
              value={settings.credit_expiry_days as number}
              onChange={(e) => update("credit_expiry_days", parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">Set to 0 for credits that never expire</p>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border/30 pt-4">
            <div>
              <p className="text-sm font-medium">Enable Automatic Credit Deduction</p>
              <p className="text-xs text-muted-foreground">
                Automatically deduct credits for API usage based on billing rules
              </p>
            </div>
            <Switch
              checked={settings.auto_deduction_enabled as boolean}
              onCheckedChange={(v) => update("auto_deduction_enabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
          Save Credit Settings
        </Button>
      </div>
    </div>
  );
}
