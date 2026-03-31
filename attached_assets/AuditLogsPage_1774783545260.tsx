import { mockAuditLogs } from "@/lib/api";
import { DataTable } from "@/components/DataTable";

export default function AuditLogsPage() {
  const columns = [
    { key: "id", label: "ID", render: (l: typeof mockAuditLogs[0]) => <span className="font-mono text-xs text-muted-foreground">{l.id}</span> },
    { key: "action", label: "Action", render: (l: typeof mockAuditLogs[0]) => <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{l.action}</span> },
    { key: "actor", label: "Actor" },
    { key: "target", label: "Target" },
    { key: "details", label: "Details" },
    { key: "createdAt", label: "Date", render: (l: typeof mockAuditLogs[0]) => new Date(l.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">System and admin action history</p>
      </div>
      <DataTable data={mockAuditLogs} columns={columns} searchKey="action" searchPlaceholder="Search by action..." />
    </div>
  );
}
