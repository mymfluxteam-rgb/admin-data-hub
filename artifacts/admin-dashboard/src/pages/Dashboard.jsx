import { useEffect, useState } from "react";
import { Users, UserCheck, DollarSign, Activity, LogOut } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { metricsApi } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AddUserDialog } from "@/components/AddUserDialog";
import { AddCreditDialog } from "@/components/AddCreditDialog";
import { HwidActionDialog } from "@/components/HwidActionDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const tooltipStyle = {
    background: "hsl(224, 18%, 9%)",
    border: "1px solid hsl(224, 14%, 16%)",
    borderRadius: 8,
    fontSize: 12,
};

const DEFAULT_METRICS = {
    totalUsers: 0, activeUsers: 0, revenue: 0, apiCalls: 0,
    userGrowth: 0, activeGrowth: 0, revenueGrowth: 0, apiGrowth: 0,
};

function UserProfileCard() {
    const { user, signOut } = useAuth();
    const [signingOut, setSigningOut] = useState(false);

    const meta = user?.user_metadata ?? {};
    const name = meta.full_name || meta.name || user?.email?.split("@")[0] || "User";
    const email = user?.email ?? "";
    const avatarUrl = meta.avatar_url || meta.picture || null;
    const provider = user?.app_metadata?.provider ?? "email";

    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    async function handleSignOut() {
        setSigningOut(true);
        await signOut();
    }

    return (
        <div className="glass-card rounded-lg px-5 py-4 flex items-center gap-4">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/30 shrink-0"
                />
            ) : (
                <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)", color: "#fff" }}>
                    {initials}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
                <span className="inline-flex items-center gap-1 mt-0.5 text-xs capitalize" style={{ color: "hsl(187, 80%, 48%)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current inline-block"/>
                    {provider}
                </span>
            </div>
            <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 active:scale-95 shrink-0"
                style={{ color: "hsl(215, 14%, 50%)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
                <LogOut className="h-3.5 w-3.5"/>
                {signingOut ? "Signing out…" : "Logout"}
            </button>
        </div>
    );
}

export default function Dashboard() {
    const [metrics, setMetrics] = useState(DEFAULT_METRICS);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        Promise.all([metricsApi.getDashboard(), metricsApi.getChartData()])
            .then(([m, c]) => { setMetrics(m); setChartData(c); })
            .finally(() => setLoading(false));
    }, []);

    const metricCards = [
        { title: t("dashboard.totalUsers"), value: metrics.totalUsers.toLocaleString(), change: metrics.userGrowth, icon: Users },
        { title: t("dashboard.activeUsers"), value: metrics.activeUsers.toLocaleString(), change: metrics.activeGrowth, icon: UserCheck },
        { title: t("dashboard.revenue"), value: `$${metrics.revenue.toLocaleString()}`, change: metrics.revenueGrowth, icon: DollarSign },
        { title: t("dashboard.apiCalls"), value: metrics.apiCalls.toLocaleString(), change: metrics.apiGrowth, icon: Activity },
    ];

    return (<div className="space-y-6">
      <UserProfileCard />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddUserDialog />
          <AddCreditDialog />
          <HwidActionDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
            ? Array.from({ length: 4 }).map((_, i) => (<div key={i} className="glass-card rounded-lg p-5">
                <Skeleton className="h-4 w-24 mb-3"/>
                <Skeleton className="h-7 w-32"/>
              </div>))
            : metricCards.map((m) => <MetricCard key={m.title} {...m}/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-lg p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("dashboard.userGrowth")}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)"/>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Area type="monotone" dataKey="users" stroke="hsl(187, 80%, 48%)" fill="url(#userGrad)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("dashboard.revenueTrends")}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)"/>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Area type="monotone" dataKey="revenue" stroke="hsl(152, 60%, 45%)" fill="url(#revGrad)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>);
}
