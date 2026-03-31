import { mockUsers } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Ban, ShieldCheck, Eye } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const columns = [
    { key: "username", label: "Username", render: (u: typeof mockUsers[0]) => <span className="font-mono text-sm">{u.username}</span> },
    { key: "email", label: "Email" },
    { key: "status", label: "Status", render: (u: typeof mockUsers[0]) => <StatusBadge status={u.status} /> },
    { key: "verified", label: "Verified", render: (u: typeof mockUsers[0]) => <StatusBadge status={u.verified ? "verified" : "unverified"} /> },
    { key: "credits", label: "Credits", render: (u: typeof mockUsers[0]) => <span className="font-mono">{u.credits.toLocaleString()}</span> },
    {
      key: "actions", label: "Actions", render: (u: typeof mockUsers[0]) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => toast.info(`Viewing ${u.username}`)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => toast.success(`${u.status === 'banned' ? 'Unbanned' : 'Banned'} ${u.username}`)}>
            <Ban className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => toast.success(`Verified ${u.username}`)}>
            <ShieldCheck className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">{mockUsers.length} users total</p>
      </div>
      <DataTable data={mockUsers} columns={columns} searchKey="email" searchPlaceholder="Search by email..." />
    </div>
  );
}
