import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { licensesApi, applicationsApi } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Plus, Trash2, ArrowLeft, Ban, CheckCircle, XCircle, Monitor } from "lucide-react";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { UpgradeModal } from "@/components/UpgradeModal";

const STATUS_COLORS = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    inactive: "bg-muted text-muted-foreground border-border",
    banned: "bg-red-500/10 text-red-400 border-red-500/20",
};

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.inactive}`}>
            {status}
        </span>
    );
}

export default function LicensesPage() {
    const [searchParams] = useSearchParams();
    const filterAppId = searchParams.get("app_id");
    const filterAppName = searchParams.get("app_name");

    const [licenses, setLicenses] = useState([]);
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(filterAppId ?? "");
    const [count, setCount] = useState("1");
    const [maxHwids, setMaxHwids] = useState("");
    const [creating, setCreating] = useState(false);

    const [statusDialog, setStatusDialog] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [upgradeOpen, setUpgradeOpen] = useState(false);

    const { plan, refreshPlan } = useUserPlan();

    const fetchLicenses = () => {
        setLoading(true);
        licensesApi.getAll(filterAppId).then(setLicenses).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLicenses();
        applicationsApi.getAll().then(setApps);
    }, [filterAppId]);

    const handleGenerateClick = () => {
        if (
            plan.licensedUsers != null &&
            plan.currentLicenses >= plan.licensedUsers
        ) {
            setUpgradeOpen(true);
            return;
        }
        setSelectedAppId(filterAppId ?? "");
        setCount("1");
        setMaxHwids("");
        setCreateOpen(true);
    };

    const handleCreate = async () => {
        if (!selectedAppId) return;
        setCreating(true);
        const payload = {
            app_id: selectedAppId,
            count: Number(count) || 1,
        };
        if (maxHwids && Number(maxHwids) > 0) {
            payload.max_hwids = Number(maxHwids);
        }
        const result = await licensesApi.create(payload);
        setCreating(false);
        if (result) {
            if (result.code === "PLAN_LIMIT_REACHED") {
                setCreateOpen(false);
                setUpgradeOpen(true);
                return;
            }
            const n = Array.isArray(result) ? result.length : 1;
            toast.success(`${n} license key${n !== 1 ? "s" : ""} generated`);
            setCreateOpen(false);
            setMaxHwids("");
            setCount("1");
            fetchLicenses();
            refreshPlan();
        }
    };

    const handleSetStatus = async (license, status) => {
        const result = await licensesApi.setStatus(license.id, status);
        if (result) {
            toast.success(`License set to ${status}`);
            setStatusDialog(null);
            fetchLicenses();
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog) return;
        setDeleting(true);
        const ok = await licensesApi.delete(deleteDialog.id);
        setDeleting(false);
        if (ok !== false) {
            toast.success("License deleted");
            setDeleteDialog(null);
            fetchLicenses();
            refreshPlan();
        }
    };

    const columns = [
        {
            key: "key",
            label: "License Key",
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground">{row.key}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => { navigator.clipboard.writeText(row.key); toast.success("Copied"); }}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: "max_hwids",
            label: "Max HWIDs",
            render: (row) => (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Monitor className="h-3 w-3" />
                    {row.max_hwids != null ? row.max_hwids : "Unlimited"}
                </span>
            ),
        },
        ...(!filterAppId ? [{
            key: "app_name",
            label: "Application",
            render: (row) => (
                <span className="text-xs text-muted-foreground">{row.app_name ?? "—"}</span>
            ),
        }] : []),
        {
            key: "created_at",
            label: "Created",
            render: (row) => (
                <span className="text-xs text-muted-foreground">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                </span>
            ),
        },
        {
            key: "id",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-1">
                    {row.status !== "active" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-emerald-500 hover:text-emerald-400"
                            onClick={() => handleSetStatus(row, "active")}
                        >
                            <CheckCircle className="h-3 w-3" /> Activate
                        </Button>
                    )}
                    {row.status !== "inactive" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => handleSetStatus(row, "inactive")}
                        >
                            <XCircle className="h-3 w-3" /> Deactivate
                        </Button>
                    )}
                    {row.status !== "banned" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-red-500 hover:text-red-400"
                            onClick={() => handleSetStatus(row, "banned")}
                        >
                            <Ban className="h-3 w-3" /> Ban
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialog(row)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/applications">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {filterAppName ? `${decodeURIComponent(filterAppName)} — ` : ""}License Keys
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {licenses.length} license key{licenses.length !== 1 ? "s" : ""}
                            {filterAppName ? ` for this application` : " across all applications"}
                        </p>
                    </div>
                </div>
                <Button onClick={handleGenerateClick} className="gap-2">
                    <Plus className="h-4 w-4" /> Generate Keys
                    {plan.licensedUsers != null && (
                        <span className="text-xs opacity-70">({plan.currentLicenses}/{plan.licensedUsers})</span>
                    )}
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={licenses}
                isLoading={loading}
            />

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate License Keys</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {!filterAppId && (
                            <div className="space-y-1.5">
                                <Label>Application</Label>
                                <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select application…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {apps.map(app => (
                                            <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label>Quantity <span className="text-muted-foreground text-xs">(max 100)</span></Label>
                            <Input
                                type="number"
                                min="1"
                                max="100"
                                value={count}
                                onChange={e => setCount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>
                                Max HWIDs{" "}
                                <span className="text-muted-foreground text-xs">(optional — leave blank for unlimited)</span>
                            </Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="e.g. 3"
                                value={maxHwids}
                                onChange={e => setMaxHwids(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating || !selectedAppId}>
                            {creating ? "Generating…" : `Generate ${Number(count) > 1 ? count + " Keys" : "Key"}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteDialog} onOpenChange={o => !o && setDeleteDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete License Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the key{" "}
                            <strong className="font-mono">{deleteDialog?.key}</strong>.
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <UpgradeModal
                open={upgradeOpen}
                onClose={() => setUpgradeOpen(false)}
                featureName="Generate License Keys"
            />
        </div>
    );
}
