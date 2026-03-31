import { mockHWIDs } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Trash2, ShieldBan } from "lucide-react";
import { toast } from "sonner";

export default function HWIDsPage() {
  const columns = [
    { key: "deviceId", label: "Device ID", render: (h: typeof mockHWIDs[0]) => <span className="font-mono text-xs">{h.deviceId}</span> },
    { key: "userEmail", label: "User" },
    { key: "deviceName", label: "Device" },
    { key: "blacklisted", label: "Status", render: (h: typeof mockHWIDs[0]) => <StatusBadge status={h.blacklisted ? "blacklisted" : "active"} /> },
    { key: "lastSeen", label: "Last Seen", render: (h: typeof mockHWIDs[0]) => new Date(h.lastSeen).toLocaleDateString() },
    {
      key: "actions", label: "Actions", render: (h: typeof mockHWIDs[0]) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => toast.success(`Removed HWID ${h.deviceId}`)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-warning" onClick={() => toast.success(`${h.blacklisted ? 'Unblacklisted' : 'Blacklisted'} ${h.deviceId}`)}>
            <ShieldBan className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HWID Management</h1>
        <p className="text-sm text-muted-foreground">{mockHWIDs.length} devices registered</p>
      </div>
      <DataTable data={mockHWIDs} columns={columns} searchKey="userEmail" searchPlaceholder="Search by user..." />
    </div>
  );
}
