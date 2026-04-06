import { useEffect, useState } from "react";
import { usersApi, transactionsApi, creditsApi } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { CreditCard, Plus, Minus, Mail } from "lucide-react";
import { toast } from "sonner";
export default function CreditsPage() {
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adjustTarget, setAdjustTarget] = useState(null);
    const [adjustAmount, setAdjustAmount] = useState("100");
    const [adjustDesc, setAdjustDesc] = useState("");
    const [adjusting, setAdjusting] = useState(false);
    const fetchAll = () => {
        setLoading(true);
        Promise.all([usersApi.getAll(), transactionsApi.getAll()]).then(([u, t]) => { setUsers(u); setTransactions(t); }).finally(() => setLoading(false));
    };
    useEffect(() => { fetchAll(); }, []);
    const openAdjust = (user, mode) => {
        setAdjustTarget({ user, mode });
        setAdjustAmount("100");
        setAdjustDesc("");
    };
    const handleAdjust = async () => {
        if (!adjustTarget)
            return;
        const amt = parseInt(adjustAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Enter a valid positive amount");
            return;
        }
        setAdjusting(true);
        const ok = adjustTarget.mode === "add"
            ? await creditsApi.addCredits(adjustTarget.user.id, amt, adjustDesc || undefined)
            : await creditsApi.removeCredits(adjustTarget.user.id, amt, adjustDesc || undefined);
        setAdjusting(false);
        if (ok) {
            toast.success(`${adjustTarget.mode === "add" ? "Added" : "Removed"} ${amt} credits ${adjustTarget.mode === "add" ? "to" : "from"} ${adjustTarget.user.username}`);
            setAdjustTarget(null);
            fetchAll();
        }
    };
    const balanceColumns = [
        { key: "username", label: "User", render: (u) => <span className="font-mono text-sm">{u.username}</span> },
        {
            key: "email", label: "Email",
            render: (u) => (<div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3 text-muted-foreground"/>
          <span className="text-sm">{u.email}</span>
        </div>),
        },
        {
            key: "credits", label: "Balance",
            render: (u) => <span className="font-mono font-medium">{(u.credits ?? 0).toLocaleString()}</span>,
        },
        { key: "status", label: "Status", render: (u) => <StatusBadge status={u.status}/> },
        {
            key: "actions", label: "Adjust Credits",
            render: (u) => (<div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 gap-1 px-2" onClick={() => openAdjust(u, "add")}>
            <Plus className="h-3 w-3"/> Add
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 px-2" onClick={() => openAdjust(u, "remove")}>
            <Minus className="h-3 w-3"/> Deduct
          </Button>
        </div>),
        },
    ];
    const txColumns = [
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
    ];
    return (<div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Credit Management</h1>
        <p className="text-sm text-muted-foreground">Manage user balances and view transaction history</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">User Balances</h2>
        <DataTable data={users} columns={balanceColumns} searchKey="email" searchPlaceholder="Search by email..." isLoading={loading}/>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Transactions</h2>
        <DataTable data={transactions.slice(0, 20)} columns={txColumns} isLoading={loading}/>
      </div>

      <Dialog open={!!adjustTarget} onOpenChange={(o) => !o && setAdjustTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary"/>
              {adjustTarget?.mode === "add" ? "Add Credits" : "Deduct Credits"}
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Adjusting credits for</p>
            <p className="font-mono text-sm font-medium">{adjustTarget?.user.username}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3"/>
              <span>{adjustTarget?.user.email}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current balance: <span className="font-mono text-foreground font-medium">{(adjustTarget?.user.credits ?? 0).toLocaleString()}</span>
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Amount to {adjustTarget?.mode === "add" ? "Add" : "Deduct"}</Label>
              <Input type="number" min={1} value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} className="mt-1 font-mono" placeholder="e.g. 500"/>
              {adjustTarget && !isNaN(parseInt(adjustAmount)) && parseInt(adjustAmount) > 0 && (<p className="text-xs text-muted-foreground mt-1">
                  New balance:{" "}
                  <span className={`font-mono font-medium ${adjustTarget.mode === "add" ? "text-emerald-400" : "text-red-400"}`}>
                    {adjustTarget.mode === "add"
                ? (adjustTarget.user.credits + parseInt(adjustAmount)).toLocaleString()
                : Math.max(0, adjustTarget.user.credits - parseInt(adjustAmount)).toLocaleString()}
                  </span>
                </p>)}
            </div>

            <div>
              <Label className="text-xs">Reason / Description (optional)</Label>
              <Input type="text" value={adjustDesc} onChange={(e) => setAdjustDesc(e.target.value)} className="mt-1" placeholder="e.g. Monthly bonus"/>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAdjustTarget(null)}>Cancel</Button>
            <Button size="sm" disabled={adjusting} className={adjustTarget?.mode === "remove" ? "bg-destructive hover:bg-destructive/90" : ""} onClick={handleAdjust}>
              {adjusting ? "Saving…" : adjustTarget?.mode === "add" ? "Add Credits" : "Deduct Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
