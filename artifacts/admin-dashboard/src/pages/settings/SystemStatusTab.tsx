import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Server, Users, Key, Coins, AlertTriangle } from "lucide-react";
import { metricsApi, type Metrics } from "@/lib/api";

interface EndpointCheck {
  label: string;
  path: string;
  ok: boolean | null;
  status: number | null;
  latency: number | null;
}

const ENDPOINTS: { label: string; path: string }[] = [
  { label: "Health", path: "/api/healthz" },
  { label: "Users", path: "/api/users" },
  { label: "Transactions", path: "/api/transactions" },
  { label: "API Keys", path: "/api/api-keys" },
  { label: "Settings", path: "/api/settings" },
  { label: "Audit Logs", path: "/api/audit-logs" },
];

function StatusDot({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted animate-pulse" />;
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`}
    />
  );
}

export default function SystemStatusTab() {
  const [statuses, setStatuses] = useState<EndpointCheck[]>(
    ENDPOINTS.map((e) => ({ ...e, ok: null, status: null, latency: null }))
  );
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeApiKeys, setActiveApiKeys] = useState<number | null>(null);
  const [recentErrors, setRecentErrors] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runChecks = async () => {
    setChecking(true);

    const [results, m, keys, auditLogs] = await Promise.all([
      Promise.all(
        ENDPOINTS.map(async (ep) => {
          const start = Date.now();
          try {
            const res = await fetch(ep.path);
            return { ...ep, ok: res.ok, status: res.status, latency: Date.now() - start };
          } catch {
            return { ...ep, ok: false, status: null, latency: null };
          }
        })
      ),
      metricsApi.getDashboard(),
      fetch("/api/api-keys").then((r) => r.json()).catch(() => []),
      fetch("/api/audit-logs").then((r) => r.json()).catch(() => []),
    ]);

    setStatuses(results);
    setMetrics(m);

    const keyList = Array.isArray(keys) ? keys : [];
    setActiveApiKeys(keyList.filter((k: Record<string, unknown>) => k["is_active"]).length);

    const logList = Array.isArray(auditLogs) ? auditLogs : [];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    setRecentErrors(
      logList.filter((l: Record<string, unknown>) => {
        const created = new Date(l["created_at"] as string);
        return created > yesterday && String(l["action"]).toLowerCase().includes("error");
      }).length
    );

    setLastChecked(new Date());
    setChecking(false);
  };

  useEffect(() => { void runChecks(); }, []);

  const allOk = statuses.every((s) => s.ok === true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {lastChecked && (
            <p className="text-xs text-muted-foreground">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={runChecks} disabled={checking} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Checking..." : "Re-check All"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: metrics ? metrics.totalUsers.toLocaleString() : null,
            icon: Users,
            color: "text-blue-400",
          },
          {
            label: "Active Users",
            value: metrics ? metrics.activeUsers.toLocaleString() : null,
            icon: Users,
            color: "text-emerald-400",
          },
          {
            label: "Active API Keys",
            value: activeApiKeys !== null ? activeApiKeys.toLocaleString() : null,
            icon: Key,
            color: "text-violet-400",
          },
          {
            label: "Recent Errors (24h)",
            value: recentErrors !== null ? recentErrors.toLocaleString() : null,
            icon: AlertTriangle,
            color: recentErrors && recentErrors > 0 ? "text-red-400" : "text-emerald-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              {value !== null ? (
                <p className="text-2xl font-bold">{value}</p>
              ) : (
                <Skeleton className="h-8 w-16" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" /> API Endpoints
            </CardTitle>
            {checking ? null : (
              <Badge variant={allOk ? "default" : "destructive"} className="text-xs">
                {allOk ? "All Healthy" : "Issues Detected"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          {statuses.map((s) => (
            <div
              key={s.path}
              className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <StatusDot ok={s.ok} />
                <span className="text-sm">{s.label}</span>
                <span className="font-mono text-xs text-muted-foreground">{s.path}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {s.status !== null && (
                  <span className={s.ok ? "text-emerald-400" : "text-red-400"}>{s.status}</span>
                )}
                {s.latency !== null && (
                  <span className="text-muted-foreground">{s.latency}ms</span>
                )}
                {s.ok === false && s.status === null && (
                  <span className="text-red-400">unreachable</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics ? (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">API Calls</p>
                <p className="font-mono font-bold">{metrics.apiCalls.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Revenue</p>
                <p className="font-mono font-bold">${metrics.revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">User Growth</p>
                <p className={`font-mono font-bold ${metrics.userGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {metrics.userGrowth >= 0 ? "+" : ""}{metrics.userGrowth}%
                </p>
              </div>
            </>
          ) : (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
