import { mockTransactions } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

export default function TransactionsPage() {
  const columns = [
    { key: "id", label: "ID", render: (t: typeof mockTransactions[0]) => <span className="font-mono text-xs text-muted-foreground">{t.id}</span> },
    { key: "userEmail", label: "User" },
    { key: "type", label: "Type", render: (t: typeof mockTransactions[0]) => <StatusBadge status={t.type} /> },
    { key: "amount", label: "Amount", render: (t: typeof mockTransactions[0]) => (
      <span className={`font-mono font-medium ${t.amount >= 0 ? "text-success" : "text-destructive"}`}>
        {t.amount >= 0 ? "+" : ""}{t.amount}
      </span>
    )},
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Date", render: (t: typeof mockTransactions[0]) => new Date(t.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground">All credit transactions</p>
      </div>
      <DataTable data={mockTransactions} columns={columns} searchKey="userEmail" searchPlaceholder="Search by user..." />
    </div>
  );
}
