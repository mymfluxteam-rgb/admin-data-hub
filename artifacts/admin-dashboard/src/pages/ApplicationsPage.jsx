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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Plus, Trash2, RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

function SecretCell({ secret }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-muted-foreground">
                {visible ? secret : `${secret.slice(0, 8)}${"•".repeat(16)}`}
            </span>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => setVisible(v => !v)}>
                {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => { navigator.clipboard.writeText(secret); toast.success("Secret copied"); }}>
                <Copy className="h-3 w-3" />
            </Button>
        </div>
    );
}

export default function ApplicationsPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [appName, setAppName] = useState("");
    const [creating, setCreating] = useState(false);

    const [rotateApp, setRotateApp] = useState(null);
    const [rotating, setRotating] = useState(false);

    const [deleteApp, setDeleteApp] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchApps = () => {
        setLoading(true);
        applicationsApi.getAll().then(setApps).finally(() => setLoading(false));
    };

    useEffect(() => { fetchApps(); }, []);

    const handleCreate = async () => {
        if (!appName.trim()) return;
        setCreating(true);
        const result = await applicationsApi.create({ app_name: appName.trim() });
        setCreating(false);
        if (result) {
            toast.success(`Application "${result.app_name}" created`);
            setCreateOpen(false);
            setAppName("");
            fetchApps();
        }
    };

    const handleRotate = async () => {
        if (!rotateApp) return;
        setRotating(true);
        const result = await applicationsApi.rotateSecret(rotateApp.id);
        setRotating(false);
        if (result) {
            toast.success("Secret rotated successfully");
            setRotateApp(null);
            fetchApps();
        }
    };

    const handleDelete = async () => {
        if (!deleteApp) return;
        setDeleting(true);
        const ok = await applicationsApi.delete(deleteApp.id);
        setDeleting(false);
        if (ok !== false) {
            toast.success(`Application "${deleteApp.app_name}" deleted`);
            setDeleteApp(null);
            fetchApps();
        }
    };

    const columns = [
        {
            key: "app_name",
            label: "Application Name",
            render: (v, row) => (
                <div>
                    <div className="font-medium text-foreground">{v}</div>
                    <div className="font-mono text-xs text-muted-foreground mt-0.5">{row.id}</div>
                </div>
            ),
        },
        {
            key: "app_secret",
            label: "App Secret",
            render: (v) => <SecretCell secret={v} />,
        },
        {
            key: "created_at",
            label: "Created",
            render: (v) => <span className="text-xs text-muted-foreground">{new Date(v).toLocaleDateString()}</span>,
        },
        {
            key: "id",
            label: "Actions",
            render: (_v, row) => (
                <div className="flex items-center gap-1">
                    <Link to={`/licenses?app_id=${row.id}&app_name=${encodeURIComponent(row.app_name)}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            <KeyRound className="h-3 w-3" /> Keys
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-yellow-500 hover:text-yellow-400"
                        onClick={() => setRotateApp(row)}>
                        <RefreshCw className="h-3 w-3" /> Rotate
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteApp(row)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Applications</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage licensing applications. Each app has a unique ID and secret for API verification.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> New Application
                </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Public Verify Endpoint</p>
                <p>External clients (C#, Python, etc.) can verify licenses via:</p>
                <code className="block bg-muted rounded px-3 py-2 mt-2 text-xs font-mono text-foreground select-all">
                    POST /api/v1/verify — body: {`{ "app_id": "...", "app_secret": "...", "license_key": "..." }`}
                </code>
            </div>

            <DataTable
                columns={columns}
                data={apps}
                loading={loading}
                emptyMessage="No applications yet. Create your first one."
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
                            An App ID (UUID) and App Secret will be auto-generated.
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

            <AlertDialog open={!!rotateApp} onOpenChange={o => !o && setRotateApp(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rotate App Secret?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will generate a new secret for <strong>{rotateApp?.app_name}</strong>. Any clients
                            using the old secret will immediately stop working until updated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRotate} disabled={rotating} className="bg-yellow-600 hover:bg-yellow-700">
                            {rotating ? "Rotating…" : "Rotate Secret"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteApp} onOpenChange={o => !o && setDeleteApp(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Application?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteApp?.app_name}</strong> and all its license
                            keys. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
