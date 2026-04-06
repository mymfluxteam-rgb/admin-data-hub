import { useEffect, useState } from "react";
import { sessionsApi } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw, Monitor, Smartphone, Chrome } from "lucide-react";
import { toast } from "sonner";
function DeviceIcon({ type }) {
    if (type === "mobile")
        return <Smartphone className="h-4 w-4 text-blue-400"/>;
    if (type === "chrome")
        return <Chrome className="h-4 w-4 text-yellow-400"/>;
    return <Monitor className="h-4 w-4 text-muted-foreground"/>;
}
function TimeAgo({ date }) {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000)
        return <span className="text-xs text-emerald-400">Just now</span>;
    if (diff < 3600000)
        return <span className="text-xs text-emerald-400">{Math.floor(diff / 60000)}m ago</span>;
    if (diff < 86400000)
        return <span className="text-xs text-yellow-400">{Math.floor(diff / 3600000)}h ago</span>;
    return <span className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</span>;
}
export default function SessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchSessions = () => {
        setLoading(true);
        sessionsApi.getActive().then(setSessions).finally(() => setLoading(false));
    };
    useEffect(() => { fetchSessions(); }, []);
    const handleForceLogout = async (s) => {
        const ok = await sessionsApi.forceLogout(s.id);
        if (ok) {
            toast.success(`Session force-logged out`);
            setSessions((p) => p.filter((x) => x.id !== s.id));
        }
    };
    const columns = [
        {
            key: "user", label: "User",
            render: (s) => (<div>
          <div className="text-sm font-medium">{s.users?.username ?? "—"}</div>
          <div className="text-xs text-muted-foreground">{s.users?.email ?? s.user_id}</div>
        </div>),
        },
        {
            key: "device", label: "Device",
            render: (s) => (<div className="flex items-center gap-2">
          <DeviceIcon type={s.device_type}/>
          <div>
            <div className="text-xs font-mono text-muted-foreground">{(s.device_id ?? "").slice(0, 12) || "—"}{s.device_id ? "…" : ""}</div>
            <div className="text-xs text-muted-foreground capitalize">{s.device_type ?? "unknown"}</div>
          </div>
        </div>),
        },
        {
            key: "browser_os", label: "Browser / OS",
            render: (s) => (<div className="text-xs text-muted-foreground space-y-0.5">
          <div>{s.browser ?? "—"}</div>
          <div>{s.os ?? "—"}</div>
        </div>),
        },
        {
            key: "login_time", label: "Logged In",
            render: (s) => (<div className="text-xs text-muted-foreground">{new Date(s.login_time).toLocaleString()}</div>),
        },
        {
            key: "last_activity", label: "Last Active",
            render: (s) => <TimeAgo date={s.last_activity}/>,
        },
        {
            key: "actions", label: "Actions",
            render: (s) => (<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Force logout" onClick={() => handleForceLogout(s)}>
          <LogOut className="h-3.5 w-3.5"/>
        </Button>),
        },
    ];
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Sessions</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${sessions.length} active sessions`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}/>
          Refresh
        </Button>
      </div>

      {sessions.length === 0 && !loading ? (<div className="glass-card rounded-lg p-12 text-center">
          <Monitor className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
          <p className="text-muted-foreground text-sm">No active sessions</p>
          <p className="text-muted-foreground text-xs mt-1">Sessions are created when users log in via the API</p>
        </div>) : (<DataTable data={sessions} columns={columns} searchKey="device_id" searchPlaceholder="Search by device ID..." isLoading={loading}/>)}
    </div>);
}
