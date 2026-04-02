import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RefreshCw, UserPlus, Trash2, Edit2, Search, Shield } from "lucide-react";
import { usersApi, type User } from "@/lib/api";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  created_at: string;
  last_login?: string | null;
}

const ADMIN_ROLES = [
  { value: "super_admin", label: "Super Admin", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  { value: "settings_admin", label: "Settings Admin", color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  { value: "user_admin", label: "User Admin", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "api_admin", label: "API Admin", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  { value: "finance_admin", label: "Finance Admin", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { value: "viewer", label: "Viewer", color: "bg-muted text-muted-foreground border-border" },
  { value: "admin", label: "Admin", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
];

function RoleBadge({ role }: { role: string }) {
  const found = ADMIN_ROLES.find((r) => r.value === role);
  if (!found) return <Badge variant="outline">{role}</Badge>;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${found.color}`}>
      {found.label}
    </span>
  );
}

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/admin-users");
  if (!res.ok) return [];
  return res.json() as Promise<AdminUser[]>;
}

async function promoteUser(userId: string, role: string): Promise<boolean> {
  const res = await fetch("/api/admin-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, role }),
  });
  return res.ok;
}

async function changeRole(id: string, role: string): Promise<boolean> {
  const res = await fetch(`/api/admin-users/${id}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  return res.ok;
}

async function demoteAdmin(id: string): Promise<boolean> {
  const res = await fetch(`/api/admin-users/${id}`, { method: "DELETE" });
  return res.ok;
}

export default function AdminUsersTab() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [addOpen, setAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("viewer");
  const [addSearching, setAddSearching] = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminUsers();
    setAdmins(data);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = admins.filter(
    (a) =>
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = async () => {
    if (!addEmail.trim()) { toast.error("Enter an email address"); return; }
    setAddSearching(true);
    const all = await usersApi.getAll();
    const found = all.find((u: User) => u.email.toLowerCase() === addEmail.trim().toLowerCase());
    setAddSearching(false);
    if (!found) { toast.error("No user found with that email"); return; }

    setAddSaving(true);
    const ok = await promoteUser(found.id, addRole);
    setAddSaving(false);
    if (ok) {
      toast.success(`${found.email} promoted to ${addRole}`);
      setAddOpen(false);
      setAddEmail("");
      setAddRole("viewer");
      await load();
    } else {
      toast.error("Failed to promote user");
    }
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    const ok = await changeRole(editTarget.id, editRole);
    setEditSaving(false);
    if (ok) {
      toast.success("Role updated");
      setEditOpen(false);
      setEditTarget(null);
      await load();
    } else {
      toast.error("Failed to update role");
    }
  };

  const handleDemote = async (id: string, email: string) => {
    const ok = await demoteAdmin(id);
    if (ok) {
      toast.success(`${email} demoted to regular user`);
      await load();
    } else {
      toast.error("Failed to remove admin");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Admin Users
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Manage who has administrative access and their permission level
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1">
              <UserPlus className="h-4 w-4" /> Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or username..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {search ? "No admins match your search" : "No admin users configured yet"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-xs text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">User</th>
                      <th className="text-left py-2 pr-4 font-medium">Role</th>
                      <th className="text-left py-2 pr-4 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Joined</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((admin) => (
                      <tr key={admin.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{admin.username}</p>
                          <p className="text-xs text-muted-foreground">{admin.email}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <RoleBadge role={admin.role} />
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs ${admin.status === "active" ? "text-emerald-400" : "text-red-400"}`}>
                            ● {admin.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditTarget(admin);
                                setEditRole(admin.role);
                                setEditOpen(true);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Admin Access?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <strong>{admin.email}</strong> will be demoted to a regular user and lose all admin privileges.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDemote(admin.id, admin.email)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span>{filtered.length} admins total</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span>Page {page} of {totalPages}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-email">User Email</Label>
              <Input
                id="add-email"
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="user@example.com"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <p className="text-xs text-muted-foreground">
                The user must already exist in the system
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Role</Label>
              <Select value={addRole} onValueChange={setAddRole}>
                <SelectTrigger id="add-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addSearching || addSaving} className="gap-2">
              {(addSearching || addSaving) && <RefreshCw className="h-4 w-4 animate-spin" />}
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Role</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-medium">{editTarget.username}</p>
                <p className="text-xs text-muted-foreground">{editTarget.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">New Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger id="edit-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ADMIN_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving} className="gap-2">
              {editSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
