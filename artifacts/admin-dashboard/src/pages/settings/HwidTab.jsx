import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanLockedRow } from "@/components/PlanLockedRow";
import { RefreshCw, Cpu } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
    const { features, planLoading } = usePlanFeatures();
    const { t } = useLanguage();

    if (loading || planLoading) {
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
                        <Cpu className="h-4 w-4 text-primary" /> {t("hwid.deviceLimits")}
                    </CardTitle>
                    <CardDescription className="text-xs">{t("hwid.deviceLimitsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="max_devices_per_user">{t("hwid.maxDevices")}</Label>
                        <Input
                            id="max_devices_per_user"
                            type="number"
                            min={1}
                            value={settings.max_devices_per_user}
                            onChange={(e) => update("max_devices_per_user", parseInt(e.target.value) || 3)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="default_session_timeout">{t("hwid.sessionTimeout")}</Label>
                        <Input
                            id="default_session_timeout"
                            type="number"
                            min={1}
                            value={settings.default_session_timeout}
                            onChange={(e) => update("default_session_timeout", parseInt(e.target.value) || 120)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t("hwid.securityPolicies")}</CardTitle>
                    <CardDescription className="text-xs">{t("hwid.securityPoliciesDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {features.hwidFingerprinting ? (
                        <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <div>
                                <p className="text-sm font-medium">{t("hwid.fingerprinting")}</p>
                                <p className="text-xs text-muted-foreground">{t("hwid.fingerprintingDesc")}</p>
                            </div>
                            <Switch
                                checked={settings.enforce_fingerprinting}
                                onCheckedChange={(v) => update("enforce_fingerprinting", v)}
                            />
                        </div>
                    ) : (
                        <div className="border-b border-border/30">
                            <PlanLockedRow
                                label={t("hwid.fingerprinting")}
                                description={t("hwid.fingerprintingDesc")}
                                value={false}
                            />
                        </div>
                    )}

                    {features.hwidAutoBan ? (
                        <div className="flex items-center justify-between py-2 border-b border-border/30">
                            <div>
                                <p className="text-sm font-medium">{t("hwid.autoBan")}</p>
                                <p className="text-xs text-muted-foreground">{t("hwid.autoBanDesc")}</p>
                            </div>
                            <Switch
                                checked={settings.auto_ban_device_switch}
                                onCheckedChange={(v) => update("auto_ban_device_switch", v)}
                            />
                        </div>
                    ) : (
                        <div className="border-b border-border/30">
                            <PlanLockedRow
                                label={t("hwid.autoBan")}
                                description={t("hwid.autoBanDesc")}
                                value={false}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t("hwid.switchLimits")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.hwidSwitchLimits ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="device_switch_cooldown_hours">{t("hwid.cooldown")}</Label>
                                <Input
                                    id="device_switch_cooldown_hours"
                                    type="number"
                                    min={0}
                                    value={settings.device_switch_cooldown_hours}
                                    onChange={(e) => update("device_switch_cooldown_hours", parseInt(e.target.value) || 24)}
                                />
                                <p className="text-xs text-muted-foreground">{t("hwid.cooldownDesc")}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_device_switches_per_day">{t("hwid.maxSwitches")}</Label>
                                <Input
                                    id="max_device_switches_per_day"
                                    type="number"
                                    min={0}
                                    value={settings.max_device_switches_per_day}
                                    onChange={(e) => update("max_device_switches_per_day", parseInt(e.target.value) || 2)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="md:col-span-2 rounded-lg border border-amber-400/30 bg-amber-500/5 p-4 flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <RefreshCw className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Device Switch Limits — Pro Feature</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Cooldown periods and daily device switch limits are available on Pro and higher plans.
                                    Upgrade to enforce stricter HWID rotation policies.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={save} disabled={saving} className="gap-2">
                    {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {t("hwid.save")}
                </Button>
            </div>
        </div>
    );
}
