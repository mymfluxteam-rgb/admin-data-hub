import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Cpu, BarChart3, ScrollText, Settings, ArrowLeftRight, MonitorSmartphone, AppWindow, KeyRound, Code2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPlan } from "@/contexts/UserPlanContext";

const NAV_ITEMS = [
    { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
    { href: "/applications", icon: AppWindow, key: "nav.applications" },
    { href: "/licenses", icon: KeyRound, key: "nav.licenses" },
    { href: "/sdk", icon: Code2, key: "nav.sdk" },
    { href: "/users", icon: Users, key: "nav.users" },
    { href: "/credits", icon: CreditCard, key: "nav.credits" },
    { href: "/transactions", icon: ArrowLeftRight, key: "nav.transactions" },
    { href: "/hwids", icon: Cpu, key: "nav.hwids" },
    { href: "/sessions", icon: MonitorSmartphone, key: "nav.sessions" },
    { href: "/analytics", icon: BarChart3, key: "nav.analytics" },
    { href: "/audit-logs", icon: ScrollText, key: "nav.auditLogs", sellerOnly: true },
    { href: "/settings", icon: Settings, key: "nav.settings" },
];

export function Sidebar() {
    const location = useLocation();
    const { t } = useLanguage();
    const { plan } = useUserPlan();

    const isSeller = plan.planName?.toLowerCase() === "seller";

    return (<aside className="w-56 shrink-0 flex flex-col h-screen bg-sidebar border-r border-sidebar-border sticky top-0">
      <div className="p-4 border-b border-sidebar-border">
        <span className="text-lg font-bold text-foreground tracking-tight">
          <span className="text-primary">◆</span> License<span className="text-primary">Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <Link to="/landing">
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-md text-xs font-medium transition-colors text-muted-foreground hover:text-primary hover:bg-sidebar-accent">
            <span className="text-primary">◇</span> View Landing Page
          </div>
        </Link>
        <div className="border-b border-sidebar-border mb-1.5"/>
        {NAV_ITEMS.map(({ href, icon: Icon, key, sellerOnly }) => {
            const isActive = location.pathname === href;
            const isLocked = sellerOnly && !isSeller && !plan.loading;

            return (<Link key={href} to={isLocked ? "#" : href} onClick={(e) => isLocked && e.preventDefault()}>
              <div className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                      ? "bg-sidebar-primary/10 text-primary font-medium"
                      : isLocked
                          ? "text-muted-foreground/50 cursor-default"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : isLocked ? "text-muted-foreground/40" : "")}/>
                <span className="flex-1">{t(key)}</span>
                {isLocked && (
                    <Lock className="h-3 w-3 text-muted-foreground/40 shrink-0" title="Seller plan required"/>
                )}
              </div>
            </Link>);
        })}
      </nav>

      {plan.planName && (
          <div className="px-3 py-3 border-t border-sidebar-border">
              <div className="text-xs text-muted-foreground">
                  Plan: <span className="font-medium text-foreground">{plan.planName}</span>
              </div>
              {plan.maxApplications != null && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                      Apps: {plan.currentApplications}/{plan.maxApplications}
                  </div>
              )}
              {plan.licensedUsers != null && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                      Licenses: {plan.currentLicenses}/{plan.licensedUsers}
                  </div>
              )}
          </div>
      )}
    </aside>);
}
