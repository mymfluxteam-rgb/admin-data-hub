import { useEffect, useState } from "react";
import { applicationsApi } from "@/lib/api";
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
import { toast } from "sonner";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function ApplicationsPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [appName, setAppName] = useState("");
    const [creating, setCreating] = useState(false);
    const [deleteApp, setDeleteApp] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { plan, refreshPlan } = useUserPlan();

    const fetchApps = () => {
        setLoading(true);
        applicationsApi.getAll().then(setApps).finally(() => setLoading(false));
    };

    useEffect(() => { fetchApps(); }, []);

    const handleNewAppClick = () => {
        if (
            plan.maxApplications != null &&
            plan.currentApplications >= plan.maxApplications
        ) {
            setUpgradeOpen(true);
            return;
        }
        setCreateOpen(true);
    };

    const handleCreate = async () => {
        if (!appName.trim()) return;
        setCreating(true);
        const result = await applicationsApi.create({ name: appName.trim() });
        setCreating(false);
        if (result) {
            if (result.code === "PLAN_LIMIT_REACHED") {
                setCreateOpen(false);
                setUpgradeOpen(true);
                return;
            }
            toast.success(`Application "${result.name}" created`);
            setCreateOpen(false);
            setAppName("");
            fetchApps();
            refreshPlan();
        }
    };

    const handleDelete = async () => {
        if (!deleteApp) return;
        setDeleting(true);
        const ok = await applicationsApi.delete(deleteApp.id);
        setDeleting(false);
        if (ok !== false) {
            toast.success(`Application "${deleteApp.name}" deleted`);
            setDeleteApp(null);
            fetchApps();
            refreshPlan();
        }
    };

    const columns = [
        {
            key: "name",
            label: "Application Name",
            render: (row) => (
                <div>
                    <div className="font-medium text-foreground">{row.name}</div>
                    <div className="font-mono text-xs text-muted-foreground mt-0.5">{row.id}</div>
                </div>
            ),
        },
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
                    <Link to={`/licenses?app_id=${row.id}&app_name=${encodeURIComponent(row.name)}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            <KeyRound className="h-3 w-3" /> Keys
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteApp(row)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    const atLimit = plan.maxApplications != null && plan.currentApplications >= plan.maxApplications;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Applications</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your licensing applications. Each app gets a unique ID for license key assignment.
                        {plan.maxApplications != null && (
                            <span className="ml-2 text-xs font-medium">
                                ({plan.currentApplications}/{plan.maxApplications} used)
                            </span>
                        )}
                    </p>
                </div>
                <Button
                    onClick={handleNewAppClick}
                    className="gap-2"
                    variant={atLimit ? "outline" : "default"}
                >
                    <Plus className="h-4 w-4" /> New Application
                </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">License Verification Endpoint</p>
                <p>External clients (C#, Python, etc.) can verify licenses via:</p>
                <code className="block bg-muted rounded px-3 py-2 mt-2 text-xs font-mono text-foreground select-all">
                    POST /api/v1/verify — body: {`{ "app_id": "...", "license_key": "..." }`}
                </code>
            </div>

            <DataTable
                columns={columns}
                data={apps}
                isLoading={loading}
            />

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Application</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Application Name</Label>
                            <Input
                                placeholder="e.g. My Desktop App"
                                value={appName}
                                onChange={e => setAppName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCreate()}
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            A unique App ID (UUID) will be auto-generated. Use it when assigning license keys.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating || !appName.trim()}>
                            {creating ? "Creating…" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteApp} onOpenChange={o => !o && setDeleteApp(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Application?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteApp?.name}</strong> and all its license
                            keys. This action cannot be undone.
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
                featureName="New Application"
            />
        </div>
    );
}
