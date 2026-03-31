import { mockChartData } from "@/lib/api";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const tooltipStyle = { background: "hsl(224, 18%, 9%)", border: "1px solid hsl(224, 14%, 16%)", borderRadius: 8, fontSize: 12 };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Detailed platform metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-lg p-6 animate-fade-in">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">API Usage (30 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="apiCalls" fill="hsl(187, 80%, 48%)" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue (30 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(152, 60%, 45%)" fill="url(#revGrad2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-6 animate-fade-in lg:col-span-2" style={{ animationDelay: "200ms" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">User Growth (30 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="userGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(187, 80%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 14%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="hsl(187, 80%, 48%)" fill="url(#userGrad2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
