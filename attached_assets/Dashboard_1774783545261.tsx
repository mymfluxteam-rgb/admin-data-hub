import { Users, UserCheck, DollarSign, Activity } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { mockMetrics, mockChartData } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AddUserDialog } from "@/components/AddUserDialog";
import { AddCreditDialog } from "@/components/AddCreditDialog";
import { HwidActionDialog } from "@/components/HwidActionDialog";
import { TimeFormatToggle } from "@/components/TimeFormatToggle";

export default function Dashboard() {
  const metrics = [
    { title: "Total Users", value: mockMetrics.totalUsers.toLocaleString(), change: mockMetrics.userGrowth, icon: Users },
    { title: "Active Users", value: mockMetrics.activeUsers.toLocaleString(), change: mockMetrics.activeGrowth, icon: UserCheck },
    { title: "Revenue", value: `$${mockMetrics.revenue.toLocaleString()}`, change: mockMetrics.revenueGrowth, icon: DollarSign },
    { title: "API Calls", value: mockMetrics.apiCalls.toLocaleString(), change: mockMetrics.apiGrowth, icon: Activity },
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
          <TimeFormatToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <MetricCard key={m.title} {...m} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-lg p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(224, 18%, 9%)", border: "1px solid hsl(224, 14%, 16%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="hsl(187, 80%, 48%)" fill="url(#userGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(224, 18%, 9%)", border: "1px solid hsl(224, 14%, 16%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(152, 60%, 45%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
