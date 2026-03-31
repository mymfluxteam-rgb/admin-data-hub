import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Cpu,
  BarChart3,
  ScrollText,
  Settings,
  ArrowLeftRight,
  MonitorSmartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/users", icon: Users, label: "Users" },
  { href: "/credits", icon: CreditCard, label: "Credits" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/hwids", icon: Cpu, label: "HWIDs" },
  { href: "/sessions", icon: MonitorSmartphone, label: "Sessions" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/audit-logs", icon: ScrollText, label: "Audit Logs" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen bg-sidebar border-r border-sidebar-border sticky top-0">
      <div className="p-4 border-b border-sidebar-border">
        <span className="text-lg font-bold text-foreground tracking-tight">
          <span className="text-primary">◆</span> License<span className="text-primary">Admin</span>
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = location.pathname === href;
          return (
            <Link key={href} to={href}>
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
