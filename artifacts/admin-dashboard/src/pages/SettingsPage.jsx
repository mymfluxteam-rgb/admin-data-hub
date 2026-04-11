import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Users, Key, Cpu, CreditCard, ShieldCheck, Bell, Activity, HardDrive, UserCog, Zap, CheckCircle2, UserCircle } from "lucide-react";
import GeneralTab from "./settings/GeneralTab";
import UserManagementTab from "./settings/UserManagementTab";
import ApiSettingsTab from "./settings/ApiSettingsTab";
import HwidTab from "./settings/HwidTab";
import CreditsTab from "./settings/CreditsTab";
import SecurityTab from "./settings/SecurityTab";
import NotificationsTab from "./settings/NotificationsTab";
import SystemStatusTab from "./settings/SystemStatusTab";
import BackupRestoreTab from "./settings/BackupRestoreTab";
import AdminUsersTab from "./settings/AdminUsersTab";
import ProfileTab from "./settings/ProfileTab";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TAB_DEFS = [
    { value: "profile", label: "Profile", icon: UserCircle },
    { value: "general", key: "settings.tabs.general", icon: Globe },
    { value: "users", key: "settings.tabs.users", icon: Users },
    { value: "api", key: "settings.tabs.api", icon: Key },
    { value: "hwid", key: "settings.tabs.hwid", icon: Cpu },
    { value: "credits", key: "settings.tabs.credits", icon: CreditCard },
    { value: "security", key: "settings.tabs.security", icon: ShieldCheck },
    { value: "notifications", key: "settings.tabs.notifications", icon: Bell },
    { value: "status", key: "settings.tabs.status", icon: Activity },
    { value: "backup", key: "settings.tabs.backup", icon: HardDrive },
    { value: "admins", key: "settings.tabs.admins", icon: UserCog },
];

const PLAN_COLORS = {
    tester: "border-zinc-400/40 bg-zinc-500/5 text-zinc-500",
    basic: "border-blue-400/40 bg-blue-500/5 text-blue-500",
    pro: "border-primary/40 bg-primary/5 text-primary",
    enterprise: "border-purple-400/40 bg-purple-500/5 text-purple-500",
};

const PLAN_DESCRIPTIONS = {
    tester: "Limited access — HWID locking, 2FA enforcement, and IP controls are Pro features.",
    basic: "Basic access — some advanced security and HWID features require a Pro plan.",
    pro: "Full access to all settings and features.",
    enterprise: "Full access to all settings and features with enterprise-grade support.",
};

function getPlanKey(planName) {
    if (!planName) return "tester";
    const key = planName.toLowerCase().trim();
    if (key.includes("enterprise")) return "enterprise";
    if (key.includes("pro") || key.includes("business")) return "pro";
    if (key.includes("basic") || key.includes("starter")) return "basic";
    return "tester";
}

function PlanBanner() {
    const { plan } = useUserPlan();

    if (plan.loading) {
        return <Skeleton className="h-14 w-full rounded-lg" />;
    }

    const planKey = getPlanKey(plan.planName);
    const colorClass = PLAN_COLORS[planKey] ?? PLAN_COLORS.tester;
    const description = PLAN_DESCRIPTIONS[planKey] ?? PLAN_DESCRIPTIONS.tester;
    const isFullAccess = planKey === "pro" || planKey === "enterprise";

    return (
        <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${colorClass}`}>
            <div className="mt-0.5">
                {isFullAccess
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <Zap className="h-4 w-4" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                        Current Plan:
                    </span>
                    <Badge variant="outline" className={`text-xs font-semibold px-2 py-0 h-5 ${colorClass}`}>
                        {plan.planName ?? "Tester"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {plan.maxApplications != null
                            ? `${plan.currentApplications ?? 0} / ${plan.maxApplications} apps`
                            : null}
                        {plan.licensedUsers != null
                            ? `  ·  ${plan.currentLicenses ?? 0} / ${plan.licensedUsers} licenses`
                            : null}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            {!isFullAccess && (
                <Badge
                    variant="outline"
                    className="shrink-0 gap-1 text-xs border-amber-400/60 text-amber-500 bg-amber-500/10 cursor-default"
                >
                    <Zap className="h-3 w-3" />
                    Upgrade to Pro
                </Badge>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
            </div>

            <PlanBanner />

            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v)}
                className="flex gap-6 min-h-[calc(100vh-12rem)] items-start"
                orientation="vertical"
            >
                <TabsList className="flex flex-col h-auto w-52 shrink-0 bg-sidebar border border-border/50 rounded-lg p-1.5 gap-0.5 sticky top-0">
                    {TAB_DEFS.map(({ value, key, label, icon: Icon }) => (
                        <TabsTrigger
                            key={value}
                            value={value}
                            className="w-full justify-start gap-2.5 px-3 py-2 text-sm rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground"
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label ?? t(key)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="flex-1 min-w-0">
                    <TabsContent value="profile" className="mt-0"><ProfileTab /></TabsContent>
                    <TabsContent value="general" className="mt-0"><GeneralTab /></TabsContent>
                    <TabsContent value="users" className="mt-0"><UserManagementTab /></TabsContent>
                    <TabsContent value="api" className="mt-0"><ApiSettingsTab /></TabsContent>
                    <TabsContent value="hwid" className="mt-0"><HwidTab /></TabsContent>
                    <TabsContent value="credits" className="mt-0"><CreditsTab /></TabsContent>
                    <TabsContent value="security" className="mt-0"><SecurityTab /></TabsContent>
                    <TabsContent value="notifications" className="mt-0"><NotificationsTab /></TabsContent>
                    <TabsContent value="status" className="mt-0"><SystemStatusTab /></TabsContent>
                    <TabsContent value="backup" className="mt-0"><BackupRestoreTab /></TabsContent>
                    <TabsContent value="admins" className="mt-0"><AdminUsersTab /></TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
