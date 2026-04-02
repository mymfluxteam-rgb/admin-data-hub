import { useEffect, useState } from "react";
import { usersApi, type User } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Ban, ShieldCheck, Eye, KeyRound, CalendarClock, RefreshCw, Copy, Clock, Trash2, AlertTriangle, UserPlus, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function ExpiryBadge({ expiry }: { expiry?: string | null }) {
  if (!expiry) return <span className="text-xs text-muted-foreground">—</span>;
  const date = new Date(expiry);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0) return <span className="text-xs text-red-400 font-medium">Expired</span>;
  if (diffDays <= 3) return <span className="text-xs text-red-400 font-medium">{diffDays}d left</span>;
  if (diffDays <= 7) return <span className="text-xs text-yellow-400 font-medium">{diffDays}d left</span>;
  return <span className="text-xs text-emerald-400">{date.toLocaleDateString()}</span>;
}

function ApiKeyCell({ apiKey, userId, onRefresh }: { apiKey?: string | null; userId: string; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  if (!apiKey) {
    return (
      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-primary px-2"
        onClick={async () => {
          setLoading(true);
          const ok = await usersApi.regenerateApiKey(userId);
          setLoading(false);
          if (ok) { toast.success("API key generated"); onRefresh(); }
        }} disabled={loading}>
        {loading ? "…" : "Generate"}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-xs text-muted-foreground">{apiKey.slice(0, 8)}…</span>
      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground"
        onClick={() => { navigator.clipboard.writeText(apiKey); toast.success("API key copied"); }}>
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiryUser, setExpiryUser] = useState<User | null>(null);
  const [expiryDays, setExpiryDays] = useState("30");
  const [expiryHours, setExpiryHours] = useState("0");
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add user dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("user");
  const [addSaving, setAddSaving] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    usersApi.getAll().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBanToggle = async (user: User) => {
    const ok = user.status === "banned"
      ? await usersApi.unban(user.id)
      : await usersApi.ban(user.id);
    if (ok) {
      toast.success(user.status === "banned" ? `Unbanned ${user.username}` : `Banned ${user.username}`);
      fetchUsers();
    }
  };

  const handleVerify = async (user: User) => {
    const ok = await usersApi.verify(user.id);
    if (ok) { toast.success(`Verified ${user.username}`); fetchUsers(); }
  };

  const handleSetExpiry = async () => {
    if (!expiryUser) return;
    const ok = await usersApi.setExpiry(expiryUser.id, {
      days: parseInt(expiryDays) || 0,
      hours: parseInt(expiryHours) || 0,
    });
    if (ok) {
      toast.success(`Expiry set for ${expiryUser.username}`);
      setExpiryUser(null);
      fetchUsers();
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser) return;
    const result = await usersApi.resetPassword(resetUser.id, newPassword || undefined);
    if (result) {
      setTempPassword(result.temporaryPassword);
      toast.success(`Password reset for ${resetUser.username}`);
      setNewPassword("");
    }
  };

  const handleAddUser = async () => {
    if (!addUsername.trim()) { toast.error("Username is required"); return; }
    if (!addEmail.trim()) { toast.error("Email is required"); return; }
    if (addPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setAddSaving(true);
    const result = await usersApi.create({
      username: addUsername.trim(),
      email: addEmail.trim(),
      password: addPassword,
      role: addRole,
    });
    setAddSaving(false);
    if (result) {
      toast.success(`User "${addUsername}" created successfully`);
      setAddOpen(false);
      setAddUsername("");
      setAddEmail("");
      setAddPassword("");
      setAddRole("user");
      setShowAddPassword(false);
      fetchUsers();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    await usersApi.deleteUser(deleteUser.id);
    setDeleting(false);
    toast.success(`Deleted user ${deleteUser.username}`);
    setDeleteUser(null);
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
  };

  const columns = [
    { key: "username", label: "Username", render: (u: User) => <span className="font-mono text-sm">{u.username}</span> },
    { key: "email", label: "Email", render: (u: User) => <span className="text-sm">{u.email}</span> },
    { key: "status", label: "Status", render: (u: User) => <StatusBadge status={u.status} /> },
    { key: "verified", label: "Verified", render: (u: User) => <StatusBadge status={u.verified ? "verified" : "unverified"} /> },
    { key: "role", label: "Role", render: (u: User) => <span className="text-xs text-muted-foreground capitalize">{u.role}</span> },
    { key: "credits", label: "Credits", render: (u: User) => <span className="font-mono">{(u.credits ?? 0).toLocaleString()}</span> },
    { key: "account_expiry", label: "Expiry", render: (u: User) => <ExpiryBadge expiry={u.account_expiry} /> },
    {
      key: "public_api_key", label: "API Key",
      render: (u: User) => <ApiKeyCell apiKey={u.public_api_key} userId={u.id} onRefresh={fetchUsers} />,
    },
    { key: "created_at", label: "Joined", render: (u: User) => new Date(u.created_at).toLocaleDateString() },
    {
      key: "actions", label: "Actions",
      render: (u: User) => (
        <div className="flex gap-1 flex-wrap">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="View info" onClick={() => toast.info(`${u.username} · ${u.email}`)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title={u.status === "banned" ? "Unban" : "Ban"} onClick={() => handleBanToggle(u)}>
            <Ban className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
            title="Verify" onClick={() => handleVerify(u)} disabled={u.verified}>
            <ShieldCheck className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-yellow-400"
            title="Set expiry"
            onClick={() => { setExpiryUser(u); setExpiryDays("30"); setExpiryHours("0"); }}>
            <CalendarClock className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-orange-400"
            title="Reset password"
            onClick={() => { setResetUser(u); setTempPassword(null); setNewPassword(""); }}>
            <KeyRound className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary"
            title="Regenerate API key"
            onClick={async () => {
              const ok = await usersApi.regenerateApiKey(u.id);
              if (ok) { toast.success(`API key regenerated for ${u.username}`); fetchUsers(); }
            }}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Delete user" onClick={() => setDeleteUser(u)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${users.length} users total`}
          </p>
        </div>
        <Button onClick={() => { setAddOpen(true); setShowAddPassword(false); }} className="gap-2 shrink-0">
          <UserPlus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      <DataTable
        data={users as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        searchKey="email"
        searchPlaceholder="Search by email..."
        isLoading={loading}
      />

      {/* Add New User Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) { setAddOpen(false); setShowAddPassword(false); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" /> Add New User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="add-username">Username <span className="text-destructive">*</span></Label>
              <Input
                id="add-username"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                placeholder="johndoe"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="add-email"
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="john@example.com"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showAddPassword ? "text" : "password"}
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="pr-10"
                  autoComplete="new-password"
                  onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowAddPassword((v) => !v)}
                >
                  {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {addPassword.length > 0 && addPassword.length < 6 && (
                <p className="text-xs text-destructive">Password must be at least 6 characters</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-role">Role</Label>
              <Select value={addRole} onValueChange={setAddRole}>
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddUser} disabled={addSaving} className="gap-2">
              {addSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              {addSaving ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Delete User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This will permanently delete the user and all associated HWIDs and sessions. This action cannot be undone.
            </p>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Deleting</p>
              <p className="font-mono text-sm font-medium">{deleteUser?.username}</p>
              <p className="text-xs text-muted-foreground">{deleteUser?.email}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button size="sm" variant="destructive" disabled={deleting} onClick={handleDeleteConfirm}>
              {deleting ? "Deleting…" : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!expiryUser} onOpenChange={(o) => !o && setExpiryUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Set Account Expiry
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Setting expiry from now for <span className="font-mono text-foreground">{expiryUser?.username}</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Days</Label>
              <Input type="number" min={0} value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Hours</Label>
              <Input type="number" min={0} max={23} value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setExpiryUser(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSetExpiry}>Set Expiry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetUser} onOpenChange={(o) => { if (!o) { setResetUser(null); setTempPassword(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-orange-400" /> Reset Password
            </DialogTitle>
          </DialogHeader>
          {tempPassword ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Password reset. Share this temporary password:</p>
              <div className="flex items-center gap-2 bg-muted rounded p-3">
                <code className="flex-1 font-mono text-sm break-all">{tempPassword}</code>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                  onClick={() => { navigator.clipboard.writeText(tempPassword); toast.success("Copied"); }}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <DialogFooter>
                <Button size="sm" onClick={() => { setResetUser(null); setTempPassword(null); }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Resetting password for <span className="font-mono text-foreground">{resetUser?.username}</span>.
                Leave blank to auto-generate a secure temporary password.
              </p>
              <div>
                <Label className="text-xs">New Password (optional)</Label>
                <Input type="text" placeholder="Leave blank to auto-generate"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" />
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setResetUser(null)}>Cancel</Button>
                <Button size="sm" onClick={handleResetPassword}>Reset Password</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
