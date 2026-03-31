import { mockUsers, mockTransactions } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export default function CreditsPage() {
  const balanceColumns = [
    { key: "username", label: "User", render: (u: typeof mockUsers[0]) => <span className="font-mono text-sm">{u.username}</span> },
    { key: "email", label: "Email" },
    { key: "credits", label: "Balance", render: (u: typeof mockUsers[0]) => <span className="font-mono font-medium">{u.credits.toLocaleString()}</span> },
    {
      key: "actions", label: "Actions", render: (u: typeof mockUsers[0]) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-success" onClick={() => toast.success(`Added credits to ${u.username}`)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => toast.success(`Removed credits from ${u.username}`)}>
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const txColumns = [
    { key: "id", label: "ID", render: (t: typeof mockTransactions[0]) => <span className="font-mono text-xs text-muted-foreground">{t.id}</span> },
    { key: "userEmail", label: "User" },
    { key: "type", label: "Type", render: (t: typeof mockTransactions[0]) => <StatusBadge status={t.type} /> },
    { key: "amount", label: "Amount", render: (t: typeof mockTransactions[0]) => (
      <span className={`font-mono font-medium ${t.amount >= 0 ? "text-success" : "text-destructive"}`}>
        {t.amount >= 0 ? "+" : ""}{t.amount}
      </span>
    )},
    { key: "description", label: "Description" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Credit Management</h1>
        <p className="text-sm text-muted-foreground">Manage user balances and view transactions</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">User Balances</h2>
        <DataTable data={mockUsers} columns={balanceColumns} searchKey="email" searchPlaceholder="Search users..." />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Transactions</h2>
        <DataTable data={mockTransactions.slice(0, 15)} columns={txColumns} />
      </div>
    </div>
  );
}
