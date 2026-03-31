import { useEffect, useState } from "react";
import { Users, UserCheck, DollarSign, Activity } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { metricsApi, type Metrics, type ChartDataPoint } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AddUserDialog } from "@/components/AddUserDialog";
import { AddCreditDialog } from "@/components/AddCreditDialog";
import { HwidActionDialog } from "@/components/HwidActionDialog";
import { Skeleton } from "@/components/ui/skeleton";

const tooltipStyle = {
  background: "hsl(224, 18%, 9%)",
  border: "1px solid hsl(224, 14%, 16%)",
  borderRadius: 8,
  fontSize: 12,
};

const DEFAULT_METRICS: Metrics = {
  totalUsers: 0, activeUsers: 0, revenue: 0, apiCalls: 0,
  userGrowth: 0, activeGrowth: 0, revenueGrowth: 0, apiGrowth: 0,
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics>(DEFAULT_METRICS);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([metricsApi.getDashboard(), metricsApi.getChartData()]).then(
      ([m, c]) => { setMetrics(m); setChartData(c); }
    ).finally(() => setLoading(false));
  }, []);

  const metricCards = [
    { title: "Total Users", value: metrics.totalUsers.toLocaleString(), change: metrics.userGrowth, icon: Users },
    { title: "Active Users", value: metrics.activeUsers.toLocaleString(), change: metrics.activeGrowth, icon: UserCheck },
    { title: "Revenue", value: `$${metrics.revenue.toLocaleString()}`, change: metrics.revenueGrowth, icon: DollarSign },
    { title: "API Calls", value: metrics.apiCalls.toLocaleString(), change: metrics.apiGrowth, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">License management overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddUserDialog />
          <AddCreditDialog />
          <HwidActionDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-lg p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-7 w-32" />
              </div>
            ))
          : metricCards.map((m, i) => <MetricCard key={m.title} {...m} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-lg p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">User Growth (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="hsl(187, 80%, 48%)" fill="url(#userGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue Trends (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(152, 60%, 45%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
