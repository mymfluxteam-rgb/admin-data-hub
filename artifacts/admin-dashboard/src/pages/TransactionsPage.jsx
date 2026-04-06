import { useEffect, useState } from "react";
import { transactionsApi } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        transactionsApi.getAll().then(setTransactions).finally(() => setLoading(false));
    }, []);
    const columns = [
        { key: "id", label: "ID", render: (t) => <span className="font-mono text-xs text-muted-foreground">{t.id.slice(0, 8)}…</span> },
        { key: "user", label: "User", render: (t) => <span className="text-sm">{t.users?.email ?? t.user_id}</span> },
        { key: "type", label: "Type", render: (t) => <StatusBadge status={t.type}/> },
        {
            key: "amount", label: "Amount",
            render: (t) => (<span className={`font-mono font-medium ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {t.amount >= 0 ? "+" : ""}{t.amount}
        </span>),
        },
        { key: "description", label: "Description" },
        { key: "created_at", label: "Date", render: (t) => new Date(t.created_at).toLocaleDateString() },
    ];
    return (<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground">All credit transactions</p>
      </div>
      <DataTable data={transactions} columns={columns} searchKey="description" searchPlaceholder="Search by description..." isLoading={loading}/>
    </div>);
}
