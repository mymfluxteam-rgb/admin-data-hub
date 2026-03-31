import { useEffect, useState } from "react";
import { auditLogsApi, type AuditLog } from "@/lib/api";
import { DataTable } from "@/components/DataTable";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogsApi.getAll().then(setLogs).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "id", label: "ID", render: (l: AuditLog) => <span className="font-mono text-xs text-muted-foreground">{l.id.slice(0, 8)}…</span> },
    { key: "action", label: "Action", render: (l: AuditLog) => <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{l.action}</span> },
    { key: "actor", label: "Actor" },
    { key: "target", label: "Target" },
    { key: "details", label: "Details" },
    { key: "ip_address", label: "IP", render: (l: AuditLog) => <span className="font-mono text-xs text-muted-foreground">{l.ip_address ?? "—"}</span> },
    { key: "created_at", label: "Date", render: (l: AuditLog) => new Date(l.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${logs.length} entries`}
        </p>
      </div>
      <DataTable
        data={logs as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        searchKey="action" searchPlaceholder="Search by action..." isLoading={loading}
      />
    </div>
  );
}
