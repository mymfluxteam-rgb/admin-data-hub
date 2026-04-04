import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe, Users, Key, Cpu, CreditCard, ShieldCheck, Bell, Activity, HardDrive, UserCog,
} from "lucide-react";
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
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const TAB_DEFS: { value: string; key: TranslationKey; icon: React.ElementType }[] = [
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

type TabValue = (typeof TAB_DEFS)[number]["value"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("general");
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="flex gap-6 min-h-[calc(100vh-12rem)] items-start"
        orientation="vertical"
      >
        <TabsList className="flex flex-col h-auto w-52 shrink-0 bg-sidebar border border-border/50 rounded-lg p-1.5 gap-0.5 sticky top-0">
          {TAB_DEFS.map(({ value, key, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="w-full justify-start gap-2.5 px-3 py-2 text-sm rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key)}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 min-w-0">
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
